// src/components/DashboardComponent.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import {
    getAllProducts,
    getProductsBySeller,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
} from '../services/ProductService';

import ChatPage from './ChatPage';
import ReportForm from './ReportForm';
import NotificationDropdown from './NotificationDropdown';

class CategoryFilterStrategy {
    matches(product, criteria) {
        if (criteria.selectedCategory === 'ALL') {
            return true;
        }

        return product.category === criteria.selectedCategory;
    }
}

class PriceFilterStrategy {
    matches(product, criteria) {
        return Number(product.price) <= Number(criteria.maxPrice);
    }
}

class KeywordFilterStrategy {
    matches(product, criteria) {
        if (!criteria.searchKeyword.trim()) {
            return true;
        }

        const keyword = criteria.searchKeyword.toLowerCase();

        return (
            product.title?.toLowerCase().includes(keyword) ||
            product.description?.toLowerCase().includes(keyword)
        );
    }
}

class CourseCodeFilterStrategy {
    matches(product, criteria) {
        if (!criteria.searchKeyword.trim()) {
            return true;
        }

        return product.courseCode
            ?.toLowerCase()
            .includes(criteria.searchKeyword.toLowerCase());
    }
}

class ProductFilterContext {
    constructor(baseStrategies, searchStrategies) {
        this.baseStrategies = baseStrategies;
        this.searchStrategies = searchStrategies;
    }

    apply(products, criteria) {
        return products.filter(product => {
            const passesBaseFilters = this.baseStrategies.every(strategy =>
                strategy.matches(product, criteria)
            );

            const hasSearchKeyword = criteria.searchKeyword.trim();
            const passesSearch =
                !hasSearchKeyword ||
                this.searchStrategies.some(strategy =>
                    strategy.matches(product, criteria)
                );

            return passesBaseFilters && passesSearch;
        });
    }
}

const productFilterContext = new ProductFilterContext(
    [
        new CategoryFilterStrategy(),
        new PriceFilterStrategy()
    ],
    [
        new KeywordFilterStrategy(),
        new CourseCodeFilterStrategy()
    ]
);

const DashboardComponent = () => {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('BUYER');
    const [shopName, setShopName] = useState('');
    const [activeTab, setActiveTab] = useState('ACTIVE');

    const [products, setProducts] = useState([]);
    const [productError, setProductError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [maxPrice, setMaxPrice] = useState(500);
    const [sellerProducts, setSellerProducts] = useState([]);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        category: 'TEXTBOOK',
        price: '',
        quantity: '',
        courseCode: '',
        imageUrl: ''
    });

    const [editingProduct, setEditingProduct] = useState(null);

    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        courseCode: '',
        imageUrl: ''
    });

    const [activePage, setActivePage] = useState(
        sessionStorage.getItem("dashboardActivePage") ||
        localStorage.getItem("dashboardActivePage") ||
        "marketplace"
    );

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();

        getAllProducts()
            .then(setProducts)
            .catch(err => setProductError(err.message));
    }, []);

    useEffect(() => {
        if (currentView === 'SELLER' && user?.userID) {
            getProductsBySeller(user.userID)
                .then(data => {
                    console.log('SELLER PRODUCTS:', data);
                    setSellerProducts(data);
                })
                .catch(err => setProductError(err.message));
        }
    }, [currentView, user]);

    useEffect(() => {
        const savedPage = localStorage.getItem("dashboardActivePage");

        if (savedPage) {
            setActivePage(savedPage);
            localStorage.removeItem("dashboardActivePage");
        }
    }, []);

    useEffect(() => {
        const savedPage =
            sessionStorage.getItem("dashboardActivePage") ||
            localStorage.getItem("dashboardActivePage");

        if (savedPage) {
            setActivePage(savedPage);
            sessionStorage.removeItem("dashboardActivePage");
            localStorage.removeItem("dashboardActivePage");
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setUser(data);

            const userId = data.userID || data.userId || data.id;

            if (userId) {
                localStorage.setItem('userId', userId);
            }

            const savedView = localStorage.getItem('currentView') || data.currentView;
            setCurrentView(savedView);

        } catch (err) {
            localStorage.clear();
            navigate('/');
        }
    };

    const handleToggleView = async () => {
        const nextView = currentView === 'BUYER' ? 'SELLER' : 'BUYER';

        try {
            const updatedUser = await authService.switchRole({ role: nextView });

            setUser(updatedUser);
            setCurrentView(nextView);
            setActivePage('marketplace');

            localStorage.setItem('currentView', nextView);
        } catch (err) {
            alert('Could not safely flip context.');
        }
    };

    const handleUpgrade = async (e) => {
        e.preventDefault();

        try {
            const updatedUser = await authService.upgradeToSeller({
                storeName: shopName
            });

            setUser(updatedUser);
            setCurrentView('SELLER');
            setActivePage('marketplace');

            localStorage.setItem('currentView', 'SELLER');

            alert('Congratulations! Your MMU Seller profile is active.');
        } catch (err) {
            alert('Failed to initialize seller account.');
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            localStorage.clear();
        } finally {
            localStorage.clear();
            navigate('/');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setProductError('');
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;

        setCreateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        try {
            if (createForm.quantity === '') {
                alert('Please enter product quantity.');
                return;
            }

            let uploadedImageUrl = '';

            if (createForm.imageFile) {
                uploadedImageUrl = await uploadProductImage(createForm.imageFile);
            }

            const payload = {
                ...createForm,
                sellerId: user.userID,
                price: Number(createForm.price),
                quantity: Number(createForm.quantity),
                imageUrl: uploadedImageUrl
            };

            await createProduct(payload);

            const updatedSellerProducts = await getProductsBySeller(user.userID);
            setSellerProducts(updatedSellerProducts);

            const allProducts = await getAllProducts();
            setProducts(allProducts);

            setCreateForm({
                title: '',
                description: '',
                category: 'TEXTBOOK',
                price: '',
                quantity: '',
                courseCode: '',
                imageUrl: ''
            });

            setShowCreateModal(false);
            alert('Product uploaded successfully.');
        } catch (err) {
            alert('Failed to upload product.');
            console.error(err);
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);

        setEditForm({
            title: product.title || '',
            description: product.description || '',
            category: product.category || '',
            price: product.price || '',
            quantity: product.quantity ?? '',
            courseCode: product.courseCode || '',
            imageUrl: product.imageUrl || ''
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        try {
            if (editForm.quantity === '') {
                alert('Please enter product quantity.');
                return;
            }

            let uploadedImageUrl = editingProduct.imageUrl;

            if (editForm.imageFile) {
                uploadedImageUrl = await uploadProductImage(editForm.imageFile);
            }

            const payload = {
                ...editForm,
                sellerId: user.userID,
                price: Number(editForm.price),
                quantity: Number(editForm.quantity),
                imageUrl: uploadedImageUrl
            };

            await updateProduct(editingProduct.productId, payload);

            const updatedSellerProducts = await getProductsBySeller(user.userID);
            setSellerProducts(updatedSellerProducts);

            const allProducts = await getAllProducts();
            setProducts(allProducts);

            setEditingProduct(null);
            alert('Product updated successfully.');
        } catch (err) {
            alert('Failed to update product.');
            console.error(err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this listing?');

        if (!confirmDelete) return;

        try {
            await deleteProduct(productId);

            setSellerProducts(prev =>
                prev.filter(product => product.productId !== productId)
            );

            setProducts(prev =>
                prev.filter(product => product.productId !== productId)
            );

            alert('Product deleted successfully.');
        } catch (err) {
            alert('Failed to delete product.');
            console.error(err);
        }
    };

    if (!user) {
        return (
            <div className="p-5 text-center text-dark">
                Loading your MMU Profile...
            </div>
        );
    }

    /* === STAFF ADMINISTRATOR WORKSPACE CONSOLE === */
    if (currentView === 'ADMIN') {
        return (
            <div className="min-vh-100 d-flex flex-column bg-dark text-white">
                <nav
                    className="navbar navbar-expand-lg navbar-dark px-4 border-bottom border-secondary"
                    style={{
                        backgroundColor: '#222222',
                        position: 'sticky',
                        zIndex: 9999
                    }}
                >
                    <div className="container-fluid">
                        <span className="navbar-brand fw-bold fs-4 text-danger">
                            eBizzness Staff Console
                        </span>

                        <div className="d-flex align-items-center gap-3 ms-auto">
                            <span className="small opacity-75">
                                Admin Core Session Secure
                            </span>

                            <button
                                className="btn btn-outline-danger btn-sm px-3"
                                onClick={handleLogout}
                            >
                                Exit System
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="container my-5 text-start">
                    <h2 className="fw-bold text-danger">
                        🛡️ System Administration Command Base
                    </h2>

                    <p className="text-white">
                        Logged secure session verified. System logs tracking is ongoing.
                    </p>

                    <div className="row g-4 mt-3 text-dark">
                        <div className="col-md-4">
                            <div className="p-4 rounded bg-white border border-secondary border-opacity-20 shadow-sm fw-bold">
                                👥 Moderating All Registered Users
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="p-4 rounded bg-white border border-secondary border-opacity-20 shadow-sm fw-bold">
                                🚩 Unresolved Product Ticket Pipeline
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="p-4 rounded bg-white border border-secondary border-opacity-20 shadow-sm fw-bold">
                                📊 Analytics & Hub Audit History
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const productFilterCriteria = {
        selectedCategory,
        maxPrice,
        searchKeyword
    };

    const marketplaceProducts = products.filter(product =>
        product.status === 'AVAILABLE' &&
        Number(product.sellerId) !== Number(user.userID)
    );

    const filteredProducts = productFilterContext.apply(
        marketplaceProducts,
        productFilterCriteria
    );

    const filteredSellerProducts = sellerProducts.filter(product => {
        if (activeTab === 'ACTIVE') {
            return product.status === 'AVAILABLE';
        }

        return product.status === 'SOLD';
    });

    const renderMarketplace = () => {
        if (currentView === 'BUYER') {
            return (
                <div className="card p-4 shadow-sm border-0 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold text-dark m-0">
                            🛒 Campus Marketplace
                        </h3>

                        {!user.hasSellerProfile && (
                            <button
                                className="btn btn-primary btn-sm fw-bold" onClick={handleUpgrade}
                            >
                                Start Selling on Campus
                            </button>
                        )}
                    </div>

                    <p className="text-secondary">
                        Browse student textbooks, food, services, and second-hand items.
                    </p>

                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="row g-3 align-items-stretch">
                            <div className="col-md-9">
                                <div className="input-group h-100">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search products by keyword or course code..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />

                                    <button
                                        className="btn btn-primary fw-bold px-4"
                                        type="submit"
                                    >
                                        Search
                                    </button>

                                    <button
                                        className="btn btn-outline-secondary px-4"
                                        type="button"
                                        onClick={async () => {
                                            setSearchKeyword('');
                                            setSelectedCategory('ALL');
                                            setMaxPrice(500);

                                            const data = await getAllProducts();
                                            setProducts(data);
                                        }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="col-md-3 d-flex flex-column justify-content-center">
                                <label className="small fw-bold text-secondary mb-1">
                                    Max Price: RM {maxPrice}
                                </label>

                                <input
                                    type="range"
                                    className="form-range"
                                    min="1"
                                    max="1000"
                                    step="5"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </form>

                    {/* CATEGORY FILTERS */}
                    <div className="row g-3 mt-4 mb-4 text-center">
                        {[
                            { key: 'ALL', label: '🛍️ All Listings' },
                            { key: 'TEXTBOOK', label: '📚 Textbooks' },
                            { key: 'SECOND_HAND', label: '♻️ Second-hand' },
                            { key: 'FOOD', label: '🍔 Food' },
                            { key: 'SERVICE', label: '🛠️ Services' }
                        ].map(item => (
                            <div className="col-md" key={item.key}>
                                <button
                                    className={`w-100 py-4 rounded-3 border fw-bold shadow-sm ${
                                        selectedCategory === item.key
                                            ? 'btn btn-primary text-white'
                                            : 'btn btn-light text-dark'
                                    }`}
                                    onClick={() => setSelectedCategory(item.key)}
                                >
                                    {item.label}
                                </button>
                            </div>
                        ))}
                    </div>

                    {productError && (
                        <div className="alert alert-danger">
                            {productError}
                        </div>
                    )}

                    {filteredProducts.length === 0 && !productError ? (
                        <div className="p-5 text-center border rounded bg-light">
                            <h5>No products found</h5>
                            <p className="text-muted mb-0">
                                No listings available for this category.
                            </p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredProducts.map(product => (
                                <div className="col-md-4" key={product.productId}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{
                                                height: '180px',
                                                background: '#eef0f4'
                                            }}
                                        >
                                            {product.imageUrl ? (
                                                <img
                                                    src={`http://localhost:8080${product.imageUrl}`}
                                                    alt={product.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '180px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '55px' }}>
                                                    📦
                                                </span>
                                            )}
                                        </div>

                                        <div className="card-body p-4">
                                            <span className="badge bg-primary mb-2">
                                                {product.category}
                                            </span>

                                            <h5 className="fw-bold">
                                                {product.title}
                                            </h5>

                                            <p className="text-muted">
                                                {product.description}
                                            </p>

                                            <h4 className="fw-bold text-success">
                                                RM {product.price}
                                            </h4>

                                            <p className="text-muted mb-3">
                                                Stock: {product.quantity}
                                            </p>

                                            <Link
                                                to={`/products/${product.productId}`}
                                                className="btn btn-primary w-100"
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
            );
        }

        return (
            <div className="card p-4 shadow-sm border-0 bg-dark text-white">
                <h3 className="fw-bold text-warning mb-3">
                    🏪 Active Seller Dashboard
                </h3>

                <p className="opacity-75">
                    Manage your product listings, update product details, and remove unavailable items.
                </p>

                <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
                    <div className="d-flex gap-3 mb-4">
                        <button
                            className={`btn ${
                                activeTab === 'ACTIVE'
                                    ? 'btn-warning'
                                    : 'btn-outline-light'
                            }`}
                            onClick={() => setActiveTab('ACTIVE')}
                        >
                            Active Listings
                        </button>

                        <button
                            className={`btn ${
                                activeTab === 'PAST'
                                    ? 'btn-warning'
                                    : 'btn-outline-light'
                            }`}
                            onClick={() => setActiveTab('PAST')}
                        >
                            Past Listings
                        </button>
                    </div>

                    <button
                        className="btn btn-warning fw-bold"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Upload New Item
                    </button>
                </div>

                {sellerProducts.length === 0 ? (
                    <div className="bg-light rounded p-5 text-center">
                        <h5 className="text-dark">No listings yet</h5>
                        <p className="text-muted mb-0">
                            Upload your first item to start selling.
                        </p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredSellerProducts.map(product => (
                            <div className="col-md-4" key={product.productId}>
                                <div className="card border-0 shadow-sm h-100 text-dark">
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

                                        <h4 className="fw-bold text-success">
                                            RM {product.price}
                                        </h4>

                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                className="btn btn-outline-primary w-50"
                                                data-bs-toggle="modal"
                                                data-bs-target="#editProductModal"
                                                onClick={() => openEditModal(product)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-outline-danger w-50"
                                                onClick={() => handleDeleteProduct(product.productId)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderDashboardContent = () => {
        if (activePage === 'messages') {
            return (
                <div className="card p-3 shadow-sm border-0 bg-white dashboard-chat-card">
                    <ChatPage />
                </div>
            );
        }

        if (activePage === 'report') {
            return (
                <div className="card p-4 shadow-sm border-0 bg-white">
                    <ReportForm />
                </div>
            );
        }

        return renderMarketplace();
    };

    return (
        <div
            className="min-vh-100 d-flex flex-column"
            style={{ backgroundColor: '#F9FAFB' }}
        >
            {/* Main Application Navbar */}
            <nav
                className="navbar navbar-expand-lg navbar-dark px-4 border-bottom"
                style={{
                    backgroundColor: '#5850EC',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1030
                }}
            >
                <div className="container-fluid">
                    <span className="navbar-brand fw-bold fs-4">
                        eBizzness
                    </span>

                    <div className="d-flex align-items-center gap-3 ms-auto text-white">
                        <span className="small opacity-90">
                            Hi, <strong>{user.name}</strong>
                        </span>

                        <NotificationDropdown />

                        <button
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'marketplace'
                                    ? 'btn-light'
                                    : 'btn-outline-light'
                            }`}
                            onClick={() => setActivePage('marketplace')}
                        >
                            Marketplace
                        </button>

                        <button
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'messages'
                                    ? 'btn-light'
                                    : 'btn-outline-light'
                            }`}
                            onClick={() => setActivePage('messages')}
                        >
                            Messages
                        </button>

                        <button
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'report'
                                    ? 'btn-light'
                                    : 'btn-outline-light'
                            }`}
                            onClick={() => setActivePage('report')}
                        >
                            Report Issue
                        </button>

                        {user.hasSellerProfile ? (
                            <button
                                className="btn btn-warning btn-sm fw-bold shadow-sm px-3 rounded-pill"
                                onClick={handleToggleView}
                            >
                                Switch to {currentView === 'BUYER' ? 'Seller View 🏪' : 'Buyer View 🛒'}
                            </button>
                        ) : (
                            <span className="badge bg-light text-dark py-2 px-3 rounded-pill">
                                Buyer Account Only
                            </span>
                        )}

                        <button
                            className="btn btn-outline-light btn-sm px-3"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Dynamic Layout Delivery Zone */}
            <div
                className={
                    activePage === 'messages'
                        ? 'container-fluid px-4 py-3 dashboard-chat-wrapper'
                        : 'container my-5 flex-grow-1 text-start'
                }
            >
                {renderDashboardContent()}
            </div>

            {/* Bootstrap Modal for Seller Account Upgrade */}
            <div className="modal fade text-dark" id="upgradeModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">
                                Setup Your Campus Store
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            />
                        </div>

                        <form onSubmit={handleUpgrade}>
                            <div className="modal-body text-start">
                                <p className="text-white small">
                                    Fill out this quick profile form to initialize your row inside our secure backend database.
                                </p>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        MMU Campus Store Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Malik's Engineering Books"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-success btn-sm"
                                >
                                    Activate Store Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div
                    className="modal show d-block text-dark overflow-auto"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        position: 'fixed',
                        inset: 0,
                        overflowY: 'scroll',
                        height: '100vh',
                        padding: '80px 0',
                        zIndex: 1050
                    }}
                >
                    <div
                        className="modal-dialog"
                        style={{ maxWidth: '900px', margin: 'auto' }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    Upload New Product
                                </h5>
                            </div>

                            <form onSubmit={handleCreateProduct}>
                                <div className="modal-body text-start">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            value={createForm.title}
                                            onChange={handleCreateChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            className="form-control"
                                            value={createForm.description}
                                            onChange={handleCreateChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Category
                                        </label>

                                        <select
                                            name="category"
                                            className="form-select"
                                            value={createForm.category}
                                            onChange={handleCreateChange}
                                            required
                                        >
                                            <option value="TEXTBOOK">Textbook</option>
                                            <option value="SECOND_HAND">Second-hand</option>
                                            <option value="FOOD">Food</option>
                                            <option value="SERVICE">Service</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Price
                                        </label>

                                        <input
                                            type="number"
                                            name="price"
                                            className="form-control"
                                            value={createForm.price}
                                            onChange={handleCreateChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Quantity
                                        </label>

                                        <input
                                            type="number"
                                            name="quantity"
                                            className="form-control"
                                            value={createForm.quantity}
                                            onChange={handleCreateChange}
                                            min="0"
                                            required
                                        />

                                        <small className="text-muted">
                                            Set quantity to 0 to mark this product as sold.
                                        </small>
                                    </div>

                                    {createForm.category === 'TEXTBOOK' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">
                                                Course Code
                                            </label>

                                            <input
                                                type="text"
                                                name="courseCode"
                                                className="form-control"
                                                value={createForm.courseCode}
                                                onChange={handleCreateChange}
                                                placeholder="e.g. CSC1101"
                                            />
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Product Image
                                        </label>

                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];

                                                if (file) {
                                                    setCreateForm(prev => ({
                                                        ...prev,
                                                        imageFile: file
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>

                                    {createForm.imageFile && (
                                        <img
                                            src={URL.createObjectURL(createForm.imageFile)}
                                            alt="Preview"
                                            className="img-fluid rounded mt-3"
                                            style={{
                                                maxHeight: '200px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-warning fw-bold"
                                    >
                                        Upload Item
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {editingProduct && (
                <div
                    className="modal show d-block text-dark overflow-auto"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        position: 'fixed',
                        inset: 0,
                        overflowY: 'scroll',
                        height: '100vh',
                        padding: '80px 0',
                        zIndex: 1050
                    }}
                >
                    <div
                        className="modal-dialog"
                        style={{ maxWidth: '900px', margin: 'auto' }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    Edit Product Listing
                                </h5>
                            </div>

                            <form onSubmit={handleUpdateProduct}>
                                <div className="modal-body text-start">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            value={editForm.title}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            className="form-control"
                                            value={editForm.description}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Category
                                        </label>

                                        <select
                                            name="category"
                                            className="form-select"
                                            value={editForm.category}
                                            onChange={handleEditChange}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option value="TEXTBOOK">Textbook</option>
                                            <option value="SECOND_HAND">Second-hand</option>
                                            <option value="FOOD">Food</option>
                                            <option value="SERVICE">Service</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Price
                                        </label>

                                        <input
                                            type="number"
                                            name="price"
                                            className="form-control"
                                            value={editForm.price}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Quantity
                                        </label>

                                        <input
                                            type="number"
                                            name="quantity"
                                            className="form-control"
                                            value={editForm.quantity}
                                            onChange={handleEditChange}
                                            min="0"
                                            required
                                        />

                                        <small className="text-muted">
                                            Set quantity to 0 to mark this product as sold.
                                        </small>
                                    </div>

                                    {editForm.category === 'TEXTBOOK' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">
                                                Course Code
                                            </label>

                                            <input
                                                type="text"
                                                name="courseCode"
                                                className="form-control"
                                                value={editForm.courseCode}
                                                onChange={handleEditChange}
                                                placeholder="e.g. CSC1101"
                                            />
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Product Image
                                        </label>

                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];

                                                if (file) {
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        imageFile: file
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>

                                    {editForm.imageFile && (
                                        <img
                                            src={URL.createObjectURL(editForm.imageFile)}
                                            alt="Preview"
                                            className="img-fluid rounded mt-3"
                                            style={{
                                                maxHeight: '200px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setEditingProduct(null)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary fw-bold"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardComponent;

