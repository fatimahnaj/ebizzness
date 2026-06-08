// src/components/RegisterComponent.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const RegisterComponent = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        
        if (!email.endsWith('@mmu.edu.my') && !email.endsWith('@student.mmu.edu.my') && !email.endsWith('@staff.mmu.edu.my')) {
            setError('Registration restricted strictly to MMU emails (@mmu.edu.my / @student.mmu.edu.my / @staff.mmu.edu.my).');
            return;
        }

        try {
            await authService.register({ name, email, mmuID: studentId, password });
            navigate('/'); // Kick them straight to login on success
        } catch (err) {
            const backendMessage = err.response?.data?.message;
            const normalizedMessage = backendMessage?.toString() || '';

            if (normalizedMessage.includes('already exists')) {
                setError('Email already exists. Please login or use another email.');
            } else if (normalizedMessage.includes('must be a valid MMU')) {
                setError('Email must be a valid MMU student or staff address ending with @student.mmu.edu.my or @staff.mmu.edu.my.');
            } else if (normalizedMessage.includes('Email is required')) {
                setError('Please enter your MMU email.');
            } else if (normalizedMessage.includes('Password is required')) {
                setError('Please enter a password.');
            } else if (normalizedMessage.includes('BuyerRegisterRequest cannot be null')) {
                setError('Registration request is invalid. Please refresh and try again.');
            } else {
                setError(backendMessage || 'Registration failed. Please check your details and try again.');
            }
        }
    };

    return (
        <div className="container-fluid vh-100 p-0 m-0 d-flex text-white">
            {/* Left Column (Info & Workflow) */}
            <div className="col-md-6 d-flex flex-column justify-content-center px-5" style={{ backgroundColor: '#5850EC' }}>
                <h1 className="display-4 fw-bold mb-1">eBizzness</h1>
                <p className="text-start opacity-75 mb-4">How it works</p>

                <div className="d-flex flex-column gap-4 max-w-450 text-start">
                    <div className="d-flex align-items-start">
                        <div className="bg-success rounded-circle p-2 d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: '32px', height: '32px' }}>⏳</div>
                        <div>
                            <div className="fw-bold text-white">Step 1 — Register</div>
                            <small className="opacity-90">Create your account with your MMU email. You will gain access to search and buy items from the eBizzness community.</small>
                        </div>
                    </div>

                    <div className="d-flex align-items-start">
                        <div className="bg-white bg-opacity-20 rounded-circle p-2 d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: '32px', height: '32px', fontSize: '12px' }}>2</div>
                        <div>
                            <div className="fw-bold text-white text-white">Step 2 — Upgrade to Seller</div>
                            <small className="opacity-90">Ready to sell? Click "Become a seller" in your profile — you'll now be able to upload and sell your items.</small>
                        </div>
                    </div>

                    <div className="d-flex align-items-start">
                        <div className="bg-white bg-opacity-20 rounded-circle p-2 d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: '32px', height: '32px', fontSize: '12px' }}>3</div>
                        <div>
                            <div className="fw-bold text-white text-white">Step 3 — Switch views</div>
                            <small className="opacity-90">Use the toggle in the navbar to flip between your Buyer View and Seller View at any time.</small>
                        </div>
                    </div>
                </div>

                <div className="p-3 rounded bg-white bg-opacity-10 mt-5 text-start border border-white border-opacity-10" style={{ maxWidth: '400px' }}>
                    Create your account and join the community now !
                </div>
            </div>

            {/* Right Column (Form Box) */}
            <div className="col-md-6 d-flex flex-column justify-content-center align-items-center px-5" style={{ backgroundColor: '#222222' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <h2 className="fw-bold mb-1">Create your account</h2>
                    <p className="text-white mb-4">Join the MMU campus marketplace</p>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={handleRegister} className="mt-3">
                        <div className="mb-3 text-start">
                            <label className="form-label text-white small fw-bold">Name</label>
                            <input 
                                type="text" 
                                className="form-control text-white border-secondary bg-transparent" 
                                placeholder="Ahmad Malik"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="mb-3 text-start">
                            <label className="form-label text-white small fw-bold">MMU Email</label>
                            <input 
                                type="email" 
                                className="form-control text-white border-secondary bg-transparent" 
                                placeholder="ahmad.malik@student.mmu.edu.my"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="mb-3 text-start">
                            <label className="form-label text-white small fw-bold">Student / Staff ID</label>
                            <input 
                                type="text" 
                                className="form-control text-white border-secondary bg-transparent" 
                                placeholder="2567376"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="mb-4 text-start">
                            <label className="form-label text-white small fw-bold">Password</label>
                            <input 
                                type="password" 
                                className="form-control text-white border-secondary bg-transparent" 
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>

                        <button type="submit" className="btn btn-outline-light w-100 py-2 fw-bold">Create account</button>
                    </form>

                    <div className="text-center mt-4">
                        <span className="text-white small">Already have an account? </span>
                        <Link to="/" className="small text-primary text-decoration-none ms-1">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterComponent;