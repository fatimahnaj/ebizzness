import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../services/ProductService";
import authService from "../services/authService";
import { addToCart } from "../services/cartService";
import { submitReport } from "../services/ReportService";

function ProductDetailComponent() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");
    const [reportMessage, setReportMessage] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(1);
    const currentUserId = Number(localStorage.getItem("userId"));
    const isOwnListing = currentUserId === Number(product?.sellerId);

    useEffect(() => {
        getProductById(id)
            .then(setProduct)
            .catch(err => setError(err.message));
    }, [id]);

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

            const response = await fetch("http://localhost:8080/api/chatrooms/start", {
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

            navigate("/dashboard");
        } catch (error) {
            console.error("Error contacting seller:", error);
            alert("Failed to contact seller.");
        }
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
        setReportMessage("");

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
        <nav className="d-flex justify-content-between align-items-center px-5 py-3 sticky-top" style={{ background: "linear-gradient(90deg, #4f46e5, #6366f1)", zIndex: 1000}}>

            <h2 className="fw-bold text-white mb-0">
                eBizzness
            </h2>

            <div className="d-flex align-items-center gap-4">

                <button
                    className="btn btn-outline-light px-4"
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("email");
                        globalThis.location.href = "/";
                    }}
                >
                    Logout
                </button>

            </div>

        </nav>
        
        <div style={{ background: "#f8f9fb", minHeight: "100vh", padding: "40px 0" }}>
            <div className="container">

                <Link
                    to="/dashboard"
                    className="btn btn-outline-secondary mb-4"
                >
                    ← Back to Marketplace
                </Link>

                <div className="card border-0 shadow-sm overflow-hidden">

                    <div className="px-4 py-3 border-bottom bg-light d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <span className="fs-2">👤</span>
                            <div>
                                <div className="fw-semibold">{product.sellerName || "Seller"}</div>
                                <div className="text-muted small">
                                    Trust score: {product.sellerTrustScore !== null && product.sellerTrustScore !== undefined
                                        ? product.sellerTrustScore.toFixed(1)
                                        : "N/A"}
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            {currentUserId !== product.sellerId && (
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
                                        src={`http://localhost:8080${product.imageUrl}`}
                                        alt={product.title}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                        }}
                                    />
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center h-100">
                                        <span style={{ fontSize: "100px" }}>📦</span>
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
                                    {product.sellerName}
                                </div>

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

                                    <button 
                                        className="btn btn-primary btn-lg px-4"
                                        onClick={handleAddToCart}
                                        disabled={isOwnListing || product.quantity < 1}
                                    >
                                        {isOwnListing ? "Your Listing" : product.quantity < 1 ? "Out of Stock" : "Add to Cart"}
                                    </button>

                                    <Link to="/cart" className="btn btn-outline-primary btn-lg px-4">
                                        View Cart
                                    </Link>

                                    <button
                                        className="btn btn-success btn-lg px-4"
                                        onClick={handleContactSeller}
                                        disabled={isOwnListing}
                                    >
                                        {isOwnListing ? "Your Listing" : "Contact Seller"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
        </>
    );
}

export default ProductDetailComponent;
