import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
    role = "user",
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    t,
    setShowEditProfileModal,
    setShowChangePasswordModal
}) => {
    const navigate = useNavigate();
    const [sidebarSettingsOpen, setSidebarSettingsOpen] = useState(false);

    return (
        <>
            <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`sidebar-modern sidebar-z ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        {role === 'admin' ? (
                            <>
                                <i className="bi bi-shield-lock-fill"></i>
                                <span className="text-white">Admin Panel</span>
                            </>
                        ) : (
                            <>
                                <img src="logo.jpg" alt="Logo" className="me-2 rounded-circle border-primary shadow-sm" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                <span className="text-white">Election Commission</span>
                            </>
                        )}
                    </div>
                    <button className="btn btn-link text-white-50 position-absolute top-0 end-0 m-3" onClick={() => setSidebarOpen(false)}>
                        <i className="bi bi-x-lg fs-4"></i>
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="text-white-50 small fw-bold text-uppercase mb-3 px-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                        {role === 'admin' ? t.management : t.menu}
                    </div>

                    {role === 'admin' ? (
                        <>
                            <button className={`nav-link-modern ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab("home"); setSidebarOpen(false); }}>
                                <i className="bi bi-house-fill fs-5"></i> Home
                            </button>
                            <button className={`nav-link-modern ${activeTab === 'results' ? 'active' : ''}`} onClick={() => { setActiveTab("results"); setSidebarOpen(false); }}>
                                <i className="bi bi-graph-up-arrow fs-5"></i> {t.electionResults}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={`nav-link-modern ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab("home"); setSidebarOpen(false); }}>
                                <i className="bi bi-house-fill fs-5"></i> Home
                            </button>
                            <button className={`nav-link-modern ${activeTab === 'vote' ? 'active' : ''}`} onClick={() => { navigate("/vote"); setSidebarOpen(false); }}>
                                <i className="bi bi-pencil-square fs-5"></i> {t.castVote}
                            </button>
                            <button className={`nav-link-modern ${activeTab === 'results' ? 'active' : ''}`} onClick={() => { setActiveTab("results"); setSidebarOpen(false); }}>
                                <i className="bi bi-bar-chart-fill fs-5"></i> {t.results}
                            </button>
                        </>
                    )}

                    <button className="nav-link-modern d-flex align-items-center w-100"
                        onClick={() => setSidebarSettingsOpen(prev => !prev)}>
                        <i className="bi bi-gear-fill fs-5"></i>
                        <span className="flex-grow-1 text-start ms-1">{t.settings}</span>
                        <i className={`bi bi-chevron-down nav-settings-arrow ${sidebarSettingsOpen ? 'open' : ''}`}></i>
                    </button>
                    {sidebarSettingsOpen && (
                        <div className="pb-1">
                            <button className="nav-sub-item" onClick={() => { setShowEditProfileModal(true); setSidebarOpen(false); }}>
                                <i className="bi bi-person-lines-fill"></i> {t.editProfile}
                            </button>
                            <button className="nav-sub-item" onClick={() => { setShowChangePasswordModal(true); setSidebarOpen(false); }}>
                                <i className="bi bi-key-fill"></i> {t.changePassword}
                            </button>
                        </div>
                    )}
                </div>

                
            </aside>
        </>
    );
};

export default Sidebar;
