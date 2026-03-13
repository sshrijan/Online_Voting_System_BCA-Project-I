import React from "react";
import ProfileCard from "./ProfileCard";

const Navbar = ({
    user,
    setUser,
    t,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    setSidebarOpen,
    showEditProfileModal,
    setShowEditProfileModal,
    showChangePasswordModal,
    setShowChangePasswordModal,
    title,
    searchTerm,
    setSearchTerm,
    showSearch = true
}) => {
    return (
        <header className="header-modern px-3 d-flex justify-content-between align-items-center shadow-sm position-sticky top-0 header-height header-z">
            {/* Left: Sidebar toggle button */}
            <div className="d-flex align-items-center flex-shrink-0">
                <button className="btn me-2 text-app-dark d-flex align-items-center justify-content-center p-1 border-0 bg-transparent" onClick={() => setSidebarOpen(prev => !prev)}>
                    <i className="bi bi-text-left fs-2"></i>
                </button>

                {/* Dashboard title (mobile only) */}
                <h5 className="mb-0 fw-bold d-lg-none text-app-dark">{title || t.dashboard}</h5>
            </div>

            {/* Center: Title and search bar (desktop only) */}
            <div className="d-none d-lg-flex align-items-center gap-3 flex-grow-1 justify-content-center">
                <h2 className="mb-0 fw-bold text-app-dark text-nowrap">{title || t.panel}</h2>
                {/* Search input for filtering candidates */}
                {showSearch && (
                    <div className="search-pill d-flex align-items-center gap-2">
                        <i className="bi bi-search text-app-muted"></i>
                        <input
                            type="text"
                            className="border-0 bg-transparent text-app-dark"
                            placeholder={t.searchPlaceholder}
                            style={{ width: '180px', fontSize: '0.85rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Right: Language toggle, theme toggle, and profile menu */}
            <div className="d-flex align-items-center gap-2 gap-md-3 flex-shrink-0">
                {/* Language and theme buttons */}
                <div className="d-flex align-items-center gap-2">
                    <button className="lang-btn shadow-sm" onClick={toggleLanguage}>
                        {language === 'en' ? 'नेपाली' : 'English'}
                    </button>
                    <button className="toggle-btn shadow-sm" onClick={toggleTheme}>
                        <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                    </button>
                </div>

                {/* Profile dropdown menu component */}
                <ProfileCard
                    user={user}
                    setUser={setUser}
                    t={t}
                    showEditProfileModal={showEditProfileModal}
                    setShowEditProfileModal={setShowEditProfileModal}
                    showChangePasswordModal={showChangePasswordModal}
                    setShowChangePasswordModal={setShowChangePasswordModal}
                    roleText={user.role === 'admin' ? t.admin : t.account}
                    badgeText={user.role === 'admin' ? t.administrator : t.role}
                />
            </div>
        </header>
    );
};

export default Navbar;
