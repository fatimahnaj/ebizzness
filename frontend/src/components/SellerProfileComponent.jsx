import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { getSellerProfile } from "../services/SellerService";
import NotificationDropdown from "./NotificationDropdown";

function SellerProfileComponent() {
    const { sellerId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");

    const formatSellerRating = (rating) => {
        const value = Number(rating || 0);
        return value.toFixed(1);
    };

    const renderStars = (rating) => {
        const value = Number(rating || 0);
        return "★".repeat(value) + "☆".repeat(Math.max(0, 5 - value));
    };

    useEffect(() => {
        authService.getProfile()
            .then(setUser)
            .catch(() => {});

        getSellerProfile(sellerId)
            .then(setProfile)
            .catch(err => setError(err.message));
    }, [sellerId]);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            localStorage.clear();
        } finally {
            localStorage.clear();
            navigate("/");
        }
    };

    return (
        <div
            className="min-vh-100 d-flex flex-column"
            style={{ backgroundColor: "#F9FAFB" }}
        >

            <div className="container my-5 flex-grow-1 text-start">
                <Link to="/user-dashboard" className="btn btn-outline-secondary mb-4">
                    Back to Marketplace
                </Link>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {!profile && !error && (
                    <div className="p-5 text-center bg-white rounded shadow-sm">
                        Loading seller profile...
                    </div>
                )}

                {profile && (
                    <>
                        <div className="card border-0 shadow-sm p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                                <div>
                                    <h2 className="fw-bold mb-1">
                                        {profile.sellerName}
                                    </h2>

                                    <p className="text-muted mb-0">
                                        {profile.email}
                                    </p>
                                </div>

                                <div className="text-end">
                                    <div className="small text-muted fw-bold">
                                        Seller Rating
                                    </div>

                                    <div className="fs-3 fw-bold text-warning">
                                        {formatSellerRating(profile.sellerRating)} / 5
                                    </div>

                                    <div className="small text-muted">
                                        {profile.reviewCount || 0} review(s)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm p-4 mb-4">
                            <h4 className="fw-bold mb-4">
                                Seller Listings
                            </h4>

                            {profile.listings.length === 0 ? (
                                <p className="text-muted mb-0">
                                    This seller has no listings yet.
                                </p>
                            ) : (
                                <div className="row g-4">
                                    {profile.listings.map(product => (
                                        <div
                                            className="col-md-4"
                                            key={product.productId}
                                        >
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div
                                                    style={{
                                                        height: "180px",
                                                        background: "#eef0f4",
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
                                                            <span style={{ fontSize: "55px" }}>
                                                                📦
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="card-body">
                                                    <span className="badge bg-primary mb-2">
                                                        {product.category}
                                                    </span>

                                                    <h5 className="fw-bold">
                                                        {product.title}
                                                    </h5>

                                                    <p className="text-muted">
                                                        {product.description}
                                                    </p>

                                                    <h5 className="text-success fw-bold">
                                                        RM {product.price}
                                                    </h5>

                                                    <Link
                                                        to={`/user-dashboard/products/${product.productId}`}
                                                        className="btn btn-primary w-100 mt-2"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="card border-0 shadow-sm p-4">
                            <h4 className="fw-bold mb-4">
                                Customer Reviews
                            </h4>

                            {!profile.reviews || profile.reviews.length === 0 ? (
                                <p className="text-muted mb-0">
                                    No customer reviews yet.
                                </p>
                            ) : (
                                profile.reviews.map((review) => (
                                    <div
                                        className="border rounded p-3 mb-3 bg-light"
                                        key={review.reviewId}
                                    >
                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                            <div>
                                                <div className="fw-bold">
                                                    {review.buyerName || "Buyer"}
                                                </div>
                                                <div className="text-muted small">
                                                    {review.productTitle}
                                                </div>
                                            </div>

                                            <div className="text-warning fw-bold">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>

                                        <p className="mb-1 mt-3">
                                            {review.comment || "No comment provided."}
                                        </p>

                                        <div className="text-muted small">
                                            {review.createdAt
                                                ? new Date(review.createdAt).toLocaleDateString()
                                                : "Date unavailable"}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SellerProfileComponent;
