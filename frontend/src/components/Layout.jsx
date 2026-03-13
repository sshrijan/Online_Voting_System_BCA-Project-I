import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "../context/ThemeContext.js";
import { useLanguage } from "../context/LanguageContext.js";

const Layout = ({
    children,
    user,
    setUser,
    activeTab,
    setActiveTab,
    title,
    searchTerm,
    setSearchTerm,
    showSearch = true
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();

    // Re-use logout logic if needed, but ProfileCard handles it through handleLogout prop?
    // Actually Dashboard/AdminDashboard had their own handleLogout/confirmLogout logic.
    // Let's make Layout manage the modal state for logout too if possible.

    return (
        <div className={`position-relative bg-app-neutral d-flex flex-column ${sidebarOpen ? 'sidebar-active' : ''}`} style={{ minHeight: "100vh" }}>
            {/* SIDEBAR */}
            <Sidebar
                role={user?.role}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                t={t}
                setShowEditProfileModal={setShowEditProfileModal}
                setShowChangePasswordModal={setShowChangePasswordModal}
            />

            {/* MAIN CONTENT AREA */}
            <div className="d-flex flex-column min-vh-100 flex-grow-1">
                <Navbar
                    user={user}
                    setUser={setUser}
                    t={t}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    language={language}
                    toggleLanguage={toggleLanguage}
                    setSidebarOpen={setSidebarOpen}
                    showEditProfileModal={showEditProfileModal}
                    setShowEditProfileModal={setShowEditProfileModal}
                    showChangePasswordModal={showChangePasswordModal}
                    setShowChangePasswordModal={setShowChangePasswordModal}
                    title={title}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showSearch={showSearch}
                />

                <main className="p-3 p-md-5">
                    {children}
                </main>

                <Footer language={language} />
            </div>

            {/* Logout Modal - Standard across components */}
            <div className="modal fade modal-z" id="logoutModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-4 overflow-hidden animate-modal" style={{ background: 'var(--bg-card)' }}>
                        <div className="modal-header border-0 p-5 text-center d-block bg-danger overflow-hidden" style={{ background: '#dc3545' }}>
                            <i className="bi bi-box-arrow-right text-white fs-1 mb-3 d-block"></i>
                            <h4 className="text-white fw-bold mb-1">{t.logoutConfirm}</h4>
                            <p className="text-white-50 mb-0">{t.logoutText}</p>
                        </div>
                        <div className="modal-body p-4 p-md-5">
                            <div className="d-flex gap-3">
                                <button className="btn btn-light rounded-pill flex-grow-1 py-2 fw-bold" data-bs-dismiss="modal">{t.cancel}</button>
                                <button className="btn btn-danger rounded-pill flex-grow-1 py-2 fw-bold" onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/";
                                }} data-bs-dismiss="modal">{t.logout}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
