import React, { useEffect, useState } from "react";
import { getAllProducts } from "../services/ProductService";

function SellerProductsComponent() {

    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getAllProducts()
            .then(data => {

                // TEMP: hardcoded sellerId = 1
                const sellerProducts = data.filter(
                    product => product.sellerId === 1
                );

                setProducts(sellerProducts);
            })
            .catch(err => setError(err.message));

    }, []);

    return (
        <div className="container mt-4">

            <h2>My Products</h2>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className="row">
                    {products.map(product => (
                        <div
                            className="col-md-4 mb-3"
                            key={product.productId}
                        >
                            <div className="card h-100">

                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="card-img-top"
                                />

                                <div className="card-body">

                                    <h5>{product.title}</h5>

                                    <p>{product.description}</p>

                                    <p>
                                        <strong>RM {product.price}</strong>
                                    </p>

                                    <p>{product.status}</p>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default SellerProductsComponent;