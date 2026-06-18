// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import DashboardComponent from './components/DashboardComponent';
import AdminLoginComponent from './components/AdminLoginComponent';
import AdminManageUsers from "./components/AdminManageUser";

import ChatPage from './components/ChatPage';
import AdminDashboard from './components/AdminDashboard';
import MainLayout from "./components/MainLayout";
import ResolveReports from './components/ResolveReports';
import AdminRefundsPage from './components/AdminRefundsPage';

import SellerProfileComponent from './components/SellerProfileComponent';
import ProductDetailComponent from './components/ProductDetailComponent';
import SellerProductsComponent from './components/SellerProductsComponent';
import 'bootstrap/dist/css/bootstrap.min.css';

// Member 3 (Cart, Checkout, Orders, Pickup) – your imports
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import PickupPage from './components/PickupPage';
import SellerOrdersPage from './components/SellerOrdersPage';

import './App.css';

// Guard block to verify if a student token exists before letting them view dashboards
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('currentView') === 'ADMIN';

    return token || isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Entry Auth Gates */}
                <Route path="/" element={<LoginComponent />} />
                <Route path="/register" element={<RegisterComponent />} />
                <Route path="/admin-login" element={<AdminLoginComponent />} />                
                
                {/* Fallback endpoints for variation matches */}
                <Route path="/auth/login" element={<Navigate to="/" replace />} />
                <Route path="/auth/register" element={<Navigate to="/register" replace />} />

                {/* Logged in Action Workspace */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <DashboardComponent />
                        </ProtectedRoute>
                    } 
                />

                {/* amir pages */}
                
                <Route
                    path="/messages"
                    element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AdminDashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resolve-reports"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ResolveReports />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-users"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AdminManageUsers />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-refunds"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AdminRefundsPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                
                                
                <Route 
                    path="/products/:id" 
                    element={
                        <ProtectedRoute>
                            <ProductDetailComponent />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/seller/products" 
                    element={
                        <ProtectedRoute>
                            <SellerProductsComponent />
                        </ProtectedRoute>
                    } 
                />

                {/* MEMBER 3 ROUTES: Cart, Checkout, Orders, Pickup */}
                <Route 
                    path="/cart" 
                    element={
                        <ProtectedRoute>
                            <CartPage />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/checkout" 
                    element={
                        <ProtectedRoute>
                            <CheckoutPage />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/orders" 
                    element={
                        <ProtectedRoute>
                            <OrderHistoryPage />
                        </ProtectedRoute>
                    } 
                />

                <Route
                    path="/seller/orders"
                    element={
                        <ProtectedRoute>
                            <SellerOrdersPage />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/pickup" 
                    element={
                        <ProtectedRoute>
                            <PickupPage />
                        </ProtectedRoute>
                    } 
                />

                <Route path="/sellers/:sellerId" element={<SellerProfileComponent />} />

                {/* Catch-all global wildcard redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>

        </Router>
    );
}

export default App;
