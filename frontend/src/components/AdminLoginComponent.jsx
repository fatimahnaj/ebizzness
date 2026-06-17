// src/components/AdminLoginComponent.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const AdminLoginComponent = () => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAdminSignIn = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const adminData = await authService.loginAdmin({ adminID: adminId, password });
            // Direct them instantly into a distinct system administrative context block
            localStorage.setItem("currentView", "ADMIN");
            localStorage.setItem("adminId", adminId);
            localStorage.setItem("userId", adminData.userID || adminData.userId || adminData.id || 5);

            navigate("/admin-dashboard");
        } catch (err) {
            setError(err.response?.data?.message || 'Access denied. Invalid system administrator credentials.');
        }
    };

    return (
        <div className="container-fluid vh-100 p-0 m-0 d-flex text-white" style={{ backgroundColor: '#222222' }}>
            {/* Left Column (Admin Overview Panels) */}
            <div className="col-md-6 d-flex flex-column justify-content-center px-5 border-end border-secondary border-opacity-10" style={{ backgroundColor: '#2B2B2B' }}>
                <div className="max-w-450 text-start">
                    <h1 className="display-4 fw-bold mb-1">eBizzness</h1>
                    <span className="badge bg-secondary mb-5 px-3 py-2 text-uppercase tracking-wider opacity-75" style={{ fontSize: '12px' }}>Admin Portal</span>
                    
                    <div className="p-4 rounded mb-4 text-white border border-secondary border-opacity-10" style={{ backgroundColor: '#242424' }}>
                        <div className="fw-bold text-white mb-3">🛡️ Admin access includes</div>
                        <ul className="list-unstyled d-flex flex-column gap-2 m-0 ps-1">
                            <li>👥 Manage all user accounts</li>
                            <li>🏳️ Review & resolve reports</li>
                            <li>📦 Moderate product listings</li>
                            <li>🎛️ Oversee pickup operations</li>
                            <li>📊 View platform analytics</li>
                        </ul>
                    </div>

                    <div className="alert border-0 p-3 d-flex align-items-start gap-2" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                        <span className="fs-5 mt-n1">⚠️</span>
                        <small className="fw-medium">
                            This portal is restricted to authorised MMU staff administrators only. Unauthorised access attempts are logged.
                        </small>
                    </div>

                    <Link to="/" className="text-white small text-decoration-none d-inline-flex align-items-center mt-4 opacity-75 hover-opacity-100">
                        ← Back to student login
                    </Link>
                </div>
            </div>

            {/* Right Column (Restricted Credentials Form Interface) */}
            <div className="col-md-6 d-flex flex-column justify-content-center align-items-center px-5">
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <h2 className="fw-bold mb-1 text-start">Admin sign in</h2>
                    <p className="text-white mb-4 text-start">eBizzness administrator portal</p>

                    <div className="alert d-flex align-items-center py-2 border-0 text-start" style={{ backgroundColor: '#FFFBEB', color: '#B45309' }}>
                        <span className="me-2">🔒</span> Restricted access · MMU staff only
                    </div>

                    {error && <div className="alert alert-danger py-2 border-0 text-start">{error}</div>}

                    <form onSubmit={handleAdminSignIn} className="mt-4 text-start">
                        <div className="mb-4">
                            <label className="form-label text-white small fw-bold">Admin Id</label>
                            <input 
                                type="text" 
                                className="form-control text-white border-secondary bg-transparent py-2" 
                                placeholder="Enter system admin identifier"
                                value={adminId}
                                onChange={(e) => setAdminId(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-white small fw-bold">Password</label>
                            <input 
                                type="password" 
                                className="form-control text-white border-secondary bg-transparent py-2" 
                                placeholder="Admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>

                        <hr className="border-secondary my-4" />

                        <button type="submit" className="btn btn-outline-light w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                            <span>💭</span> Sign in as administrator
                        </button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <span className="text-white small">Not an admin? </span>
                        <Link to="/" className="small text-primary text-decoration-none ms-1">Go to student login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginComponent;