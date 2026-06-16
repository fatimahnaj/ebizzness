// src/components/DashboardComponent.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const DashboardComponent = () => {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('BUYER');
    const [shopName, setShopName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setUser(data);
            // Sync current view with what's tracked or default to current DB value
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
            localStorage.setItem('currentView', nextView);
        } catch (err) {
            alert('Could not safely flip context.');
        }
    };

    const handleUpgrade = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            // Call the backend upgrade endpoint and switch to seller view
            const updatedUser = await authService.upgradeToSeller({ storeName: shopName });
            setUser(updatedUser);
            setCurrentView('SELLER');
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
            navigate('/');
        }
    };

    if (!user) return <div className="p-5 text-center text-white">Loading your MMU Profile...</div>;

    /* === STAFF ADMINISTRATOR WORKSPACE CONSOLE === */
    if (currentView === 'ADMIN') {
        return (
            <div className="min-vh-100 d-flex flex-column bg-dark text-white">
                <nav className="navbar navbar-expand-lg navbar-dark px-4 border-bottom border-secondary" style={{ backgroundColor: '#222222' }}>
                    <div className="container-fluid">
                        <span className="navbar-brand fw-bold fs-4 text-danger">eBizzness Staff Console</span>
                        <div className="d-flex align-items-center gap-3 ms-auto">
                            <span className="small opacity-75">Admin Core Session Secure</span>
                            <button className="btn btn-outline-danger btn-sm px-3" onClick={handleLogout}>Exit System</button>
                        </div>
                    </div>
                </nav>
                <div className="container my-5 text-start">
                    <h2 className="fw-bold text-danger">🛡️ System Administration Command Base</h2>
                    <p className="text-white">Logged secure session verified. System logs tracking is ongoing.</p>
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

    /* === STANDARD STUDENT MARKETPLACE WORKSPACE === */
    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#F9FAFB' }}>
            {/* Main Application Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark px-4 border-bottom" style={{ backgroundColor: '#5850EC' }}>
                <div className="container-fluid">
                    <span className="navbar-brand fw-bold fs-4">eBizzness</span>
                    
                    <div className="d-flex align-items-center gap-3 ms-auto text-white">
                        <span className="small opacity-90">Hi, <strong>{user.name}</strong></span>
                        
                        {/* Interactive Role Switch Button if upgraded */}
                        {user.hasSellerProfile ? (
                            <button className="btn btn-warning btn-sm fw-bold shadow-sm px-3 rounded-pill" onClick={handleToggleView}>
                                Switch to {currentView === 'BUYER' ? 'Seller View 🏪' : 'Buyer View 🛒'}
                            </button>
                        ) : (
                            <span className="badge bg-light text-dark py-2 px-3 rounded-pill">Buyer Account Only</span>
                        )}

                        <button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            {/* Dynamic Layout Delivery Zone */}
            <div className="container my-5 flex-grow-1 text-start">
                {currentView === 'BUYER' ? (
                    /* BUYER VIEW WINDOW */
                    <div className="card p-4 shadow-sm border-0 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold text-dark m-0">🛒 Campus Shopping Center</h3>
                            {!user.hasSellerProfile && (
                                <button className="btn btn-primary btn-sm fw-bold" onClick={handleUpgrade}>
                                    Start Selling on Campus
                                </button>
                            )}
                        </div>
                        <p className="text-secondary">Welcome to your buyer workspace. Browse student textbooks, electronics, and food collection points.</p>
                        <div className="row g-4 mt-2 text-center">
                            <div className="col-md-4"><div className="p-4 rounded border bg-light text-dark fw-medium">📚 Textbooks Listing Block</div></div>
                            <div className="col-md-4"><div className="p-4 rounded border bg-light text-dark fw-medium">📱 Tech Gear Block</div></div>
                            <div className="col-md-4"><div className="p-4 rounded border bg-light text-dark fw-medium">🍔 Central Hub Food Hub</div></div>
                        </div>
                    </div>
                ) : (
                    /* SELLER VIEW WINDOW */
                    <div className="card p-4 shadow-sm border-0 bg-dark text-white">
                        <h3 className="fw-bold text-warning mb-3">🏪 Active Seller Dashboard</h3>
                        <p className="opacity-75">Manage your student inventory listings, handle customer order pings, and coordinate safe central hub dropoffs.</p>
                        <div className="row g-4 mt-2 text-dark text-center">
                            <div className="col-md-6"><div className="p-4 rounded bg-light fw-bold">📦 Upload/List New Item</div></div>
                            <div className="col-md-6"><div className="p-4 rounded bg-light fw-bold">📈 Current Shop Orders Received</div></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bootstrap Modal for Seller Account Upgrade */}
            <div className="modal fade text-dark" id="upgradeModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">Setup Your Campus Store</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onSubmit={handleUpgrade}>
                            <div className="modal-body text-start">
                                <p className="text-white small">Fill out this quick profile form to initialize your row inside our secure backend database.</p>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">MMU Campus Store Name</label>
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
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-success btn-sm">Activate Store Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;