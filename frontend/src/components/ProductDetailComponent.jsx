import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/ProductService";

function ProductDetailComponent() {

    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getProductById(id)
            .then(setProduct)
            .catch(err => setError(err.message));
    }, [id]);

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
                                className="d-flex justify-content-center align-items-center"
                                style={{
                                    background: "#eef0f4",
                                    height: "100%"
                                }}
                            >

                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="img-fluid"
                                        style={{
                                            maxHeight: "450px",
                                            objectFit: "cover"
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div style={{ fontSize: "100px" }}>
                                        📦
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

                                <button className="btn btn-success btn-lg">
                                    Contact Seller
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default ProductDetailComponent;