// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import DashboardComponent from './components/DashboardComponent';
import AdminLoginComponent from './components/AdminLoginComponent';

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
               <Route element={<MainLayout />}>
                <Route
                    path="/messages"
                    element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                    }
                />

                <Route
                    path="/report"
                    element={
                    <ProtectedRoute>
                        <ReportForm />
                    </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-dashboard"
                    element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                    }
                />

                <Route 
                    path="/resolve-reports" 
                    element={
                        <ProtectedRoute>
                            <ResolveReports />
                        </ProtectedRoute>
                    } 
                />
                </Route>
                
                                
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