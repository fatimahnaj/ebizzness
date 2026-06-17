// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import DashboardComponent from './components/DashboardComponent';
import AdminLoginComponent from './components/AdminLoginComponent';
import AdminMarketplace from './components/AdminMarketplace';
import AdminManageUsers from "./components/AdminManageUser";

import ChatPage from './components/ChatPage';
import ReportForm from './components/ReportForm';
import AdminDashboard from './components/AdminDashboard';
import MainLayout from "./components/MainLayout";
import ResolveReports from './components/ResolveReports';

import ProductDetailComponent from './components/ProductDetailComponent';
import SellerProductsComponent from './components/SellerProductsComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
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
                    path="/admin-dashboard"
                    element={
                        <MainLayout>
                        <AdminDashboard />
                        </MainLayout>
                    }
                    />

                    <Route
                    path="/resolve-reports"
                    element={
                        <MainLayout>
                        <ResolveReports />
                        </MainLayout>
                    }
                    />

                    <Route
                    path="/admin-users"
                    element={
                        <MainLayout>
                        <AdminManageUsers />
                        </MainLayout>
                    }
                    />

                    <Route
                    path="/admin-marketplace"
                    element={
                        <MainLayout>
                        <AdminMarketplace />
                        </MainLayout>
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

                {/* Catch-all global wildcard redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>

        </Router>
    );
}

export default App;