import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../services/ProductService";
import { addToCart } from "../services/cartService";   // <-- Import here

function ProductDetailComponent() {

    const { id } = useParams();
    const navigate = useNavigate();   // <-- For navigation after adding to cart
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getProductById(id)
            .then(setProduct)
            .catch(err => setError(err.message));
    }, [id]);

    // =============================================
    // Add to Cart handler (moved here, outside JSX)
    // =============================================
    const handleAddToCart = async () => {
        try {
            await addToCart(product.productId, 1);
            alert('Item added to cart successfully!');
            // Optional: navigate to cart page
            // navigate('/cart');
        } catch (err) {
            alert('Failed to add item to cart: ' + (err.response?.data?.message || err.message));
        }
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
                        window.location.href = "/";
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

                    <div className="row g-0">

                        {/* IMAGE SECTION */}
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

                        {/* DETAILS SECTION */}
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

                                <div className="d-flex gap-3 mt-4">

                                    {/* ✅ Fixed Add to Cart button */}
                                    <button 
                                        className="btn btn-primary btn-lg px-4"
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart
                                    </button>

                                    <button className="btn btn-success btn-lg px-4">
                                        Contact Seller
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