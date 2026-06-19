import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';
import NotificationDropdown from './NotificationDropdown';

const UserLayout = () => {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('BUYER');
    const [activePage, setActivePage] = useState(
        sessionStorage.getItem('dashboardActivePage') ||
        localStorage.getItem('dashboardActivePage') ||
        'marketplace'
    );

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // 🟢 1. Profile fetching hook should ONLY run once on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authService.getProfile();
                setUser(data);

                const savedView = localStorage.getItem('currentView') || data.currentView;
                setCurrentView(savedView || 'BUYER');
            } catch (err) {
                localStorage.clear();
                navigate('/');
            }
        };

        fetchProfile();
    }, [navigate]);

    // 🟢 2. Fixed Sync Route Hook: Updates views instantly with no delay
    useEffect(() => {
        const path = location.pathname;

        if (path.includes('/cart')) {
            setActivePage('cart');
        } else if (path.includes('/orders')) {
            setActivePage('orders');
        } else if (path.includes('/sellers/')) {
            setActivePage('profile');
        } else if (path.includes('/messages')) {
            setActivePage('messages');
        } else {
            const viewParam = searchParams.get('view');
            if (viewParam === 'seller') {
                setActivePage('sell');
                setCurrentView('SELLER');
            } else {
                setActivePage('marketplace');
                setCurrentView('BUYER'); // 🟢 FIXED: Instantly flips back to Buyer view without API latency lag
            }
        }
    }, [location.pathname, searchParams]);

    const handleSellerDashboardClick = () => {
        localStorage.setItem('currentView', 'SELLER');
        setCurrentView('SELLER');
        setActivePage('sell');
        navigate('/user-dashboard?view=seller');
    };

    const handleMarketplaceClick = () => {
        localStorage.setItem('currentView', 'BUYER');
        setCurrentView('BUYER');
        setActivePage('marketplace');
        navigate('/user-dashboard');
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

    if (!user) {
        return (
            <div className="p-5 text-center text-dark">
                Loading your MMU Profile...
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#F9FAFB' }}>
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
                    <span className="navbar-brand fw-bold fs-4">eBizzness</span>

                    <div className="d-flex align-items-center gap-3 ms-auto text-white">
                        <span className="small opacity-90">
                            Hi, <strong>{user.name}</strong>
                        </span>

                        <NotificationDropdown />

                        <button
                            type="button"
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'marketplace' ? 'btn-light' : 'btn-outline-light'
                            }`}
                            onClick={handleMarketplaceClick}
                        >
                            Marketplace
                        </button>

                        {user.hasSellerProfile && (
                            <button
                                type="button"
                                className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                    activePage === 'sell' ? 'btn-light' : 'btn-outline-light'
                                }`}
                             onClick={handleSellerDashboardClick}
                            >
                                Sell
                            </button>
                        )}

                        <Link
                            to="cart"
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'cart' ? 'btn-light' : 'btn-outline-light'
                            }`}
                        >
                            Cart
                        </Link>

                        <Link
                            to="orders"
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'orders' ? 'btn-light' : 'btn-outline-light'
                            }`}
                        >
                            Orders
                        </Link>

                        <Link
                            to={`sellers/${user.userID}`}
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'profile' ? 'btn-light' : 'btn-outline-light'
                            }`}
                        >
                            Profile
                        </Link>

                        <Link
                            to="messages"
                            className={`btn btn-sm fw-bold px-3 rounded-pill ${
                                activePage === 'messages' ? 'btn-light' : 'btn-outline-light'
                            }`}
                        >
                            Messages
                        </Link>

                        <button
                            className="btn btn-outline-light btn-sm px-3"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <div className="flex-grow-1">
                <Outlet /> 
            </div>
        </div>
    );
};

export default UserLayout;
