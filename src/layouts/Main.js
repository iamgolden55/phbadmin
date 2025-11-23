import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";

export default function Main() {
  const { isAuthenticated, loading } = useAuth();
  const offsets = ["/apps/file-manager", "/apps/email", "/apps/calendar"];
  const { pathname } = useLocation();
  const bc = document.body.classList;

  // set sidebar to offset
  (offsets.includes(pathname)) ? bc.add("sidebar-offset") : bc.remove("sidebar-offset");

  // auto close sidebar when switching pages in mobile
  bc.remove("sidebar-show");

  // scroll to top when switching pages
  window.scrollTo(0, 0);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/pages/signin" replace />;
  }

  return (
    <React.Fragment>
      <Sidebar />
      <Outlet />
    </React.Fragment>
  )
}