import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const userData = await authService.login({ email, password });

        // 🔑 SAVE THE TOKEN
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        } else {
            console.warn('No token returned from login');
        }

        localStorage.setItem('currentView', userData.currentView || 'BUYER');
        localStorage.setItem('userId', userData.userID || userData.userId || userData.id);

        navigate('/dashboard');
    } catch (err) {
        setError(err.response?.data?.message || 'Invalid MMU credentials.');
        }
    };

    return (
        <div className="container-fluid vh-100 p-0 m-0 d-flex text-white">
            {/* Left Column (Purple) */}
            <div className="col-md-6 d-flex flex-column justify-content-center px-5" style={{ backgroundColor: '#5850EC' }}>
                <h1 className="display-4 fw-bold mb-3">eBizzness</h1>
                <p className="fs-5 mb-5 opacity-90 text-start">
                    The campus marketplace built exclusively for MMU students and staff. Buy, sell, and connect — all within your verified university community.
                </p>
                
                <div className="d-flex flex-column gap-3 max-w-400">
                    <div className="p-3 rounded border border-white border-opacity-20 bg-white bg-opacity-10 d-flex align-items-center">
                        <div className="me-3 fs-3">🛡️</div>
                        <div className="text-start">
                            <div className="fw-bold text-white">MMU-verified accounts only</div>
                            <small className="opacity-75">Sign in with your @mmu.edu.my email</small>
                        </div>
                    </div>
                    <div className="p-3 rounded border border-white border-opacity-20 bg-white bg-opacity-10 d-flex align-items-center">
                        <div className="me-3 fs-3">📖</div>
                        <div className="text-start">
                            <div className="fw-bold text-white">Textbooks by course code</div>
                            <small className="opacity-75">Find books for your exact subjects</small>
                        </div>
                    </div>
                    <div className="p-3 rounded border border-white border-opacity-20 bg-white bg-opacity-10 d-flex align-items-center">
                        <div className="me-3 fs-3">📍</div>
                        <div className="text-start">
                            <div className="fw-bold text-white">Central hub pickup</div>
                            <small className="opacity-75">Safe, QR-verified item collection</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column (Dark Grey) */}
            <div className="col-md-6 d-flex flex-column justify-content-center align-items-center px-5" style={{ backgroundColor: '#222222' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <h2 className="fw-bold mb-1">Welcome back</h2>
                    <p className="text-white mb-4">Sign in to your eBizzness account</p>

                    <div className="alert alert-info border-0 d-flex align-items-center py-2" style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}>
                        <span className="me-2">ℹ️</span> Use your MMU email address to sign in
                    </div>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={handleSignIn} className="mt-4">
                        <div className="mb-3 text-start">
                            <label className="form-label text-white small fw-bold">MMU email</label>
                            <input 
                                type="email" 
                                className="form-control text-white border-secondary bg-transparent py-2" 
                                placeholder="yourname@student.mmu.edu.my"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="mb-2 text-start">
                            <div className="d-flex justify-content-between align-items-center">
                                <label className="form-label text-white small fw-bold mb-1">Password</label>
                                <a href="#" className="small text-decoration-none text-primary opacity-75">Forgot password?</a>
                            </div>
                            <input 
                                type="password" 
                                className="form-control text-white border-secondary bg-transparent py-2" 
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>

                        <button type="submit" className="btn btn-outline-light w-100 py-2 mt-4 fw-bold">Sign in</button>
                    </form>

                    <div className="text-center my-4 text-white position-relative">
                        <hr className="border-secondary" />
                        <span className="position-absolute top-50 start-50 translate-middle px-3" style={{ backgroundColor: '#222222' }}>don't have an account?</span>
                    </div>

                    <Link to="/register" className="btn btn-outline-secondary w-100 py-2 text-white border-secondary fw-bold">Create an account</Link>
                    
                    <div className="text-center mt-5">
                        <Link to="/admin-login" className="text-white small text-decoration-underline">Admin login · For staff administrators only</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginComponent;