import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../services/authService";
import { getAdminProductById, getProductById } from "../services/ProductService";
import { addToCart } from "../services/cartService";
import { submitReport } from "../services/ReportService";
import { getReviewsByProduct } from "../services/ReviewService";
import { API_BASE_URL, withApiOrigin } from "../services/apiConfig";

function ProductDetailComponent() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [sellerRating, setSellerRating] = useState(null);
    const currentUserId = Number(localStorage.getItem("userId"));
    const isOwnListing = currentUserId === Number(product?.sellerId);
    const isAdminView = searchParams.get("adminView") === "true";

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setError("");
                setProduct(null);

                const productData = isAdminView
                    ? await getAdminProductById(id)
                    : await getProductById(id);

                setProduct(productData);
                setSellerRating(productData.sellerRating ?? null);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            }
        };

        loadProduct();
    }, [id, isAdminView]);

    const handleContactSeller = async () => {
        try {
            const currentUser = await authService.getProfile();

            const buyerId =
                currentUser.userID ||
                currentUser.userId ||
                currentUser.id;

            const sellerId =
                product.sellerId ||
                product.sellerID ||
                product.seller_id ||
                product.seller?.sellerId ||
                product.seller?.sellerID ||
                product.seller?.seller_id ||
                product.seller?.userID ||
                product.seller?.userId ||
                product.seller?.id ||
                product.seller?.user?.userID ||
                product.seller?.user?.userId ||
                product.seller?.user?.id;

            if (!buyerId) {
                alert("Buyer ID not found. Please login again.");
                return;
            }

            if (!sellerId) {
                alert("Seller ID not found for this product.");
                return;
            }

            if (Number(buyerId) === Number(sellerId)) {
                alert("You cannot contact yourself.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/chatrooms/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user1Id: buyerId,
                    user2Id: sellerId
                })
            });

            if (!response.ok) {
                throw new Error("Failed to start chat room");
            }

            const chatRoom = await response.json();

            const roomId =
                chatRoom.chatRoomId ||
                chatRoom.chat_room_id ||
                chatRoom.roomId;

            if (roomId) {
                sessionStorage.setItem("selectedChatRoomId", roomId);
                localStorage.setItem("selectedChatRoomId", roomId);
            }

            sessionStorage.setItem("dashboardActivePage", "messages");
            localStorage.setItem("dashboardActivePage", "messages");

            navigate("/user-dashboard/messages");
        } catch (error) {
            console.error("Error contacting seller:", error);
            alert("Failed to contact seller.");
        }
    };
    useEffect(() => {
        let active = true;

        Promise.resolve()
            .then(() => {
                if (active) {
                    setReviewsLoading(true);
                }
            })
            .then(() => getReviewsByProduct(id))
            .then((data) => {
                if (active) {
                    setReviews(data);
                }
            })
            .catch(() => {
                if (active) {
                    setReviews([]);
                }
            })
            .finally(() => {
                if (active) {
                    setReviewsLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [id]);

    const renderStars = (rating) => {
        const value = Number(rating || 0);
        return "\u2605".repeat(value) + "\u2606".repeat(Math.max(0, 5 - value));
    };

    // =============================================
    // Add to Cart handler
    // =============================================
    const handleAddToCart = async () => {
        try {
            await addToCart(product.productId, cartQuantity);
            alert('Item added to cart successfully!');
        } catch (err) {
            alert('Failed to add item to cart: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmitReport = async (targetType, targetId, label) => {
        const reporterId = Number(localStorage.getItem("userId"));

        if (!reporterId) {
            alert(`Please log in before reporting this ${label}.`);
            return;
        }

        if (!targetId) {
            alert(`Could not find the ${label} to report.`);
            return;
        }

        const reason = globalThis.prompt(`Please enter the reason for reporting this ${label}:`);

        if (!reason?.trim()) {
            return;
        }

        setReportLoading(true);

        try {
            const report = {
                reporterId,
                targetId,
                targetType,
                reason: reason.trim()
            };

            const response = await submitReport(report);
            alert(`Report submitted successfully (ID: ${response.reportId}).`);
        } catch (submitError) {
            console.error("Error submitting report:", submitError);
            alert("Failed to submit report. Please try again later.");
        } finally {
            setReportLoading(false);
        }
    };

    // =============================================
    // Report Seller handler
    // =============================================
    const handleReportSeller = async () => {
        await handleSubmitReport("USER", product.sellerId, "seller");
    };

    // =============================================
    // Report Product handler
    // =============================================
    const handleReportProduct = async () => {
        await handleSubmitReport("LISTING", product.productId, "product");
    };

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error}
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mt-5">
                <h4>Loading product...</h4>
            </div>
        );
    }

    return (
        <>
        <nav ></nav>
        
        <div style={{ background: "#f8f9fb", minHeight: "100vh", padding: "40px 0" }}>
            <div className="container">

                <Link
                    to={isAdminView ? "/resolve-reports" : "/user-dashboard"}
                    className="btn btn-outline-secondary mb-4"
                >
                    {"\u2190"} Back to {isAdminView ? "Reports" : "Marketplace"}
                </Link>

                <div className="card border-0 shadow-sm overflow-hidden">

                    <div className="px-4 py-3 border-bottom bg-light d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <span className="fs-2">{"\uD83D\uDC64"}</span>
                            <div>
                                <Link
                                    to={`/user-dashboard/sellers/${product.sellerId}`}
                                    className="fw-semibold text-decoration-none"
                                >
                                    {product.sellerName || "Seller"}
                                </Link>
                                <div className="text-muted small">
                                    Seller rating: {sellerRating !== null && sellerRating !== undefined
                                        ? Number(sellerRating).toFixed(1)
                                        : "N/A"}
                                    {" "} / 5
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            {!isAdminView && currentUserId !== product.sellerId && (
                                <>
                                    <button
                                        className="btn btn-outline-warning"
                                        onClick={handleReportProduct}
                                        disabled={reportLoading}
                                    >
                                        {reportLoading ? "Reporting..." : "Report Product"}
                                    </button>

                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={handleReportSeller}
                                        disabled={reportLoading}
                                    >
                                        {reportLoading ? "Reporting..." : "Report Seller"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="row g-0">

                        <div className="col-md-5">
                            <div
                                style={{
                                    background: "#eef0f4",
                                    height: "500px",
                                    overflow: "hidden"
                                }}
                            >
                                {product.imageUrl ? (
                                    <img
                                        src={withApiOrigin(product.imageUrl)}
                                        alt={product.title}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                        }}
                                    />
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center h-100">
                                        <span style={{ fontSize: "100px" }}>{"\uD83D\uDCE6"}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-7">

                            <div className="card-body p-5">

                                <span className="badge bg-primary mb-3">
                                    {product.category}
                                </span>

                                <h1 className="fw-bold mb-3">
                                    {product.title}
                                </h1>

                                <h2 className="text-success fw-bold mb-4">
                                    RM {product.price}
                                </h2>

                                <p className="text-muted fs-5">
                                    {product.description}
                                </p>

                                <hr />

                                <div className="mb-3">
                                    <strong>Status:</strong>{" "}
                                    <span className="text-primary">
                                        {product.status}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <strong>Course Code:</strong>{" "}
                                    {product.courseCode}
                                </div>

                                <div className="mb-4">
                                    <strong>Seller:</strong>{" "}
                                    <Link
                                        to={`/user-dashboard/sellers/${product.sellerId}`}
                                        className="fw-bold text-primary"
                                    >
                                        {product.sellerName}
                                    </Link>
                                </div>

                                {isAdminView ? (
                                    <div className="alert alert-info mt-4 mb-0">
                                        Admin moderation view. Buyer actions are hidden so removed or banned-seller listings can still be reviewed.
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                                        <div>
                                            <label className="form-label fw-bold small mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                max={product.quantity || 1}
                                                value={cartQuantity}
                                                onChange={(e) => {
                                                    const nextQuantity = Number(e.target.value);
                                                    setCartQuantity(Math.max(1, Math.min(product.quantity || 1, nextQuantity || 1)));
                                                }}
                                                disabled={isOwnListing || product.quantity < 1}
                                                style={{ width: "110px" }}
                                            />
                                        </div>
                                        {isOwnListing ? (
                                            <div className="alert alert-info mt-4 mb-0">
                                                This item is your own listings.
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-primary btn-lg px-4 me-2"
                                                    onClick={handleAddToCart}
                                                    disabled={product.quantity < 1} /* 💡 Simplified since isOwnListing is already false here */
                                                >
                                                    {product.quantity < 1 ? "Out of Stock" : "Add to Cart"}
                                                </button>

                                                <Link to="/cart" className="btn btn-outline-primary btn-lg px-4 me-2">
                                                    View Cart
                                                </Link>

                                                <button
                                                    className="btn btn-success btn-lg px-4"
                                                    onClick={handleContactSeller}
                                                >
                                                    Chat Seller
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                </div>

                <div className="card border-0 shadow-sm mt-4">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="fw-bold mb-0">Product Reviews</h3>
                            <span className="text-muted small">
                                {reviews.length} review(s)
                            </span>
                        </div>

                        {reviewsLoading ? (
                            <p className="text-muted mb-0">Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <p className="text-muted mb-0">No reviews yet.</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {reviews.map((review) => (
                                    <div
                                        className="border rounded p-3 bg-light"
                                        key={review.reviewId}
                                    >
                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                            <div>
                                                <div className="fw-bold">
                                                    {review.buyerName || "Buyer"}
                                                </div>
                                                <div className="text-muted small">
                                                    {review.createdAt
                                                        ? new Date(review.createdAt).toLocaleDateString()
                                                        : "Date unavailable"}
                                                </div>
                                            </div>

                                            <div className="text-warning fw-bold">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>

                                        <p className="mb-0 mt-3">
                                            {review.comment || "No comment provided."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
        </>
    );
}

export default ProductDetailComponent;
