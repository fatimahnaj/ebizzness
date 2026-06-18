// src/components/PickupPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { confirmPickup } from '../services/pickupService';

const PickupPage = () => {
    const [orderId, setOrderId] = useState('');
    const [code, setCode] = useState('');
    const [encryptedData, setEncryptedData] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [message, setMessage] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scanTimerRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setOrderId(params.get('orderId') || '');
        setCode(params.get('code') || '');
        setEncryptedData(params.get('data') || '');
    }, [location.search]);

    useEffect(() => {
        return () => stopScanner();
    }, []);

    const stopScanner = () => {
        if (scanTimerRef.current) {
            clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setScanning(false);
    };

    const startScanner = async () => {
        setMessage('');

        if (!('BarcodeDetector' in window)) {
            setMessage('Built-in QR scanning is not supported in this browser. Use the pickup code or scan with your phone camera.');
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setMessage('Camera access is not available. Use the pickup code instead.');
            return;
        }

        try {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            streamRef.current = stream;
            setScanning(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            scanTimerRef.current = window.setInterval(async () => {
                if (!videoRef.current || videoRef.current.readyState < 2) {
                    return;
                }

                try {
                    const barcodes = await detector.detect(videoRef.current);
                    const result = barcodes.find(barcode => barcode.rawValue);

                    if (result?.rawValue) {
                        stopScanner();
                        setEncryptedData(result.rawValue);
                        setMessage('QR captured. Confirm pickup to complete verification.');
                    }
                } catch (scanError) {
                    stopScanner();
                    setMessage('Unable to read QR from camera. Try again or use the pickup code.');
                }
            }, 700);
        } catch (err) {
            stopScanner();
            setMessage('Camera permission was denied or unavailable. Use the pickup code instead.');
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();

        if (!code.trim() && !encryptedData.trim()) {
            setMessage('Enter a pickup code or scan a QR first.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            await confirmPickup({
                orderId: orderId ? Number(orderId) : null,
                pickupCode: code.trim(),
                encryptedData: encryptedData.trim()
            });
            setMessage('Pickup confirmed successfully. Order marked as completed.');
            setTimeout(() => navigate('/orders'), 1500);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Invalid pickup confirmation details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Confirm Pickup</h2>
                    <p className="text-muted mb-0">Scan the parcel QR or use the backup pickup code.</p>
                </div>

                <Link to="/orders" className="btn btn-outline-secondary">
                    Back to Orders
                </Link>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3">QR Scanner</h5>
                            <div className="bg-dark rounded overflow-hidden d-flex align-items-center justify-content-center" style={{ aspectRatio: '4 / 3' }}>
                                {scanning ? (
                                    <video
                                        ref={videoRef}
                                        muted
                                        playsInline
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="text-white text-center px-4">
                                        <div className="display-6 mb-2">QR</div>
                                        <div className="small opacity-75">Camera preview appears here</div>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={startScanner}
                                    disabled={scanning || loading}
                                >
                                    {scanning ? 'Scanning...' : 'Scan QR'}
                                </button>

                                {scanning && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={stopScanner}
                                    >
                                        Stop
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3">Pickup Verification</h5>

                            <form onSubmit={handleConfirm}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Order ID</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={orderId}
                                            onChange={(e) => setOrderId(e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Pickup Code</label>
                                        <input
                                            type="text"
                                            className="form-control text-uppercase"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                                            placeholder="Example: A1B2C3"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold">Encrypted QR Data</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={encryptedData}
                                            onChange={(e) => setEncryptedData(e.target.value)}
                                            placeholder="Filled automatically when QR is scanned"
                                        />
                                    </div>
                                </div>

                                <div className="d-flex flex-wrap gap-2 mt-4">
                                    <button type="submit" className="btn btn-success" disabled={loading}>
                                        {loading ? 'Verifying...' : 'Confirm Pickup'}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setOrderId('');
                                            setCode('');
                                            setEncryptedData('');
                                            setMessage('');
                                        }}
                                        disabled={loading}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickupPage;
