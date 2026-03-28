import React, { useState, useEffect } from "react";

const ProfileCard = ({
    user,
    setUser,
    t,
    showEditProfileModal,
    setShowEditProfileModal,
    showChangePasswordModal,
    setShowChangePasswordModal,
    roleText,
    badgeText,
    defaultImage = "men.jpg"
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [editFormData, setEditFormData] = useState({ fullName: "", dob: "", voterId: "" });
    const [passwordFormData, setPasswordFormData] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    const [editProfileImage, setEditProfileImage] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        if (user) {
            setEditFormData({
                fullName: user.fullName || "",
                dob: user.dob || "",
                voterId: user.voterId || ""
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError("");
        setModalSuccess("");

        const formDataToSend = new FormData();
        formDataToSend.append("fullName", editFormData.fullName);
        formDataToSend.append("dob", editFormData.dob);
        formDataToSend.append("voterId", editFormData.voterId);
        if (editProfileImage) formDataToSend.append("profileImage", editProfileImage);

        try {
            const response = await fetch("/api/update-profile", {
                method: "PUT",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
                body: formDataToSend
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setModalSuccess(t.success || "Profile updated successfully");
                setTimeout(() => setShowEditProfileModal(false), 1500);
            } else {
                setModalError(data.error);
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setModalError("Network error. Please try again.");
        } finally {
            setModalLoading(false);
        }
    };

    const validatePassword = (password) => {
        return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /\W/.test(password);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
            setModalError("Passwords do not match");
            return;
        }
        if (!validatePassword(passwordFormData.newPassword)) {
            setModalError(t.passwordValidationMsg);
            return;
        }

        setModalLoading(true);
        setModalError("");
        setModalSuccess("");

        try {
            const response = await fetch("/api/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    currentPassword: passwordFormData.currentPassword,
                    newPassword: passwordFormData.newPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                setModalSuccess(t.passwordSuccess);
                setPasswordFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                setTimeout(() => setShowChangePasswordModal(false), 1500);
            } else {
                setModalError(data.error);
            }
        } catch (err) {
            console.error("Password change error:", err);
            setModalError("Network error. Please try again.");
        } finally {
            setModalLoading(false);
        }
    };

    if (!user) return null;
    const profileImg = user.profileImage ? `http://localhost:3001${user.profileImage}` : defaultImage;

    return (
        <>
            <div className="dropdown">
                <div className="d-flex align-items-center gap-2 dropdown-toggle bg-light bg-opacity-10 p-1 pe-3 rounded-pill border shadow-sm text-app-dark"
                    style={{ cursor: 'pointer' }} data-bs-toggle="dropdown">
                    <img src={profileImg} alt="Avatar" className="rounded-circle avatar-size border border-2 border-white object-fit-cover shadow-sm" />
                    <div className="d-none d-md-block">
                        <div className="fw-bold small" style={{ lineHeight: 1.2 }}>{user.fullName?.split(' ')[0] || (user.role === 'admin' ? t.admin : 'User')}</div>
                        <div className="text-app-muted fw-normal" style={{ fontSize: '0.65rem' }}>{roleText || t.account}</div>
                    </div>
                </div>

                <div className="dropdown-menu dropdown-menu-end profile-dropdown-menu mt-2 shadow-lg border-0">
                    <div className="profile-dropdown-header text-center">
                        <img src={profileImg} alt="Avatar" className="profile-dropdown-avatar" />
                        <h5 className="fw-bold mb-0 text-white">{user.fullName || (user.role === 'admin' ? 'Admin' : user.email)}</h5>
                        <div className="badge rounded-pill bg-dark bg-opacity-20 text-white mt-2 px-3 py-1" style={{ fontSize: '0.7rem' }}>
                            {badgeText || (user.role === 'admin' ? t.admin : t.role)}
                        </div>
                    </div>

                    <div className="profile-dropdown-body">
                        <div className="profile-info-row">
                            <span className="profile-info-label">{t.email}</span>
                            <span className="profile-info-value text-truncate">{user.email}</span>
                        </div>
                        <div className="profile-info-row mb-2">
                            <span className="profile-info-label">Status</span>
                            <div className="d-flex align-items-center gap-2">
                                <span className="profile-info-value">{user.role === 'admin' ? t.administrator : t.verified}</span>
                                <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                            </div>
                        </div>

                        <div className="profile-menu-item" onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}>
                            <i className="bi bi-gear-fill"></i>
                            <span>{t.settings}</span>
                            <i className={`bi bi-chevron-${showSettings ? 'up' : 'down'} ms-auto small`}></i>
                        </div>

                        {showSettings && (
                            <div className="ps-3 bg-light bg-opacity-10 rounded-3 mx-2 my-1">
                                <button className="profile-menu-item py-2 border-0 bg-transparent w-100 text-start" onClick={() => setShowEditProfileModal(true)}>
                                    <i className="bi bi-person-lines-fill" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}></i>
                                    <span style={{ fontSize: '0.9rem' }}>{t.editProfile}</span>
                                </button>
                                <button className="profile-menu-item py-2 border-0 bg-transparent w-100 text-start" onClick={() => setShowChangePasswordModal(true)}>
                                    <i className="bi bi-key-fill" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}></i>
                                    <span style={{ fontSize: '0.9rem' }}>{t.changePassword}</span>
                                </button>
                            </div>
                        )}

                        {user.role !== 'admin' && (
                            <button className="profile-menu-item">
                                <i className="bi bi-question-circle-fill"></i>
                                <span>{t.support}</span>
                            </button>
                        )}

                        <div className="border-top my-2 mx-2"></div>

                        <button className="profile-menu-item logout-item" data-bs-toggle="modal" data-bs-target="#logoutModal">
                            <i className="bi bi-box-arrow-right"></i>
                            <span>{t.logout}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditProfileModal && (
                <div className="modal fade show d-block modal-z" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-card">
                            <div className="profile-dropdown-header py-4">
                                <h4 className="text-white fw-bold mb-0">{t.editProfile}</h4>
                            </div>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="modal-body p-4">
                                    {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}
                                    {modalSuccess && <div className="alert alert-success py-2 small">{modalSuccess}</div>}

                                    <div className="mb-3 text-center">
                                        <div className="position-relative d-inline-block">
                                            <img src={profileImg} className="rounded-circle border border-4 border-white shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover' }} alt="Avatar" />
                                            <label className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle cursor-pointer shadow-sm" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="bi bi-camera-fill"></i>
                                                <input type="file" className="d-none" onChange={(e) => setEditProfileImage(e.target.files[0])} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-app-muted">{t.fullNameLabel}</label>
                                        <input type="text" className="form-control rounded-pill bg-light border-0 px-4" value={editFormData.fullName} onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })} placeholder="Enter Your Fullname"/>
                                    </div>
                                    {user.role !== 'admin' && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-app-muted">{t.dobLabel}</label>
                                                <input type="text" className="form-control rounded-pill bg-light border-0 px-4" value={editFormData.dob} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} placeholder="Enter Your Date of Birth"/>
                                            </div>
                                            <div className="mb-0">
                                                <label className="form-label small fw-bold text-app-muted">{t.voterIdLabel}</label>
                                                <input type="text" className="form-control rounded-pill bg-light border-0 px-4" value={editFormData.voterId} onChange={(e) => setEditFormData({ ...editFormData, voterId: e.target.value })} placeholder="Enter Your Voter ID" />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer border-top p-4 d-flex gap-2">
                                    <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowEditProfileModal(false)}>{t.cancel}</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 flex-grow-1" disabled={modalLoading}>{modalLoading ? "..." : t.saveChanges}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <div className="modal fade show d-block modal-z" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-card">
                            <div className="profile-dropdown-header py-4">
                                <h4 className="text-white fw-bold mb-0">{t.changePassword}</h4>
                            </div>
                            <form onSubmit={handleChangePassword}>
                                <div className="modal-body p-4">
                                    {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}
                                    {modalSuccess && <div className="alert alert-success py-2 small">{modalSuccess}</div>}

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-app-muted">{t.currentPassword}</label>
                                        <div className="position-relative">
                                            <input type={showPasswords.current ? "text" : "password"} className="form-control rounded-pill bg-light border-0 px-4 pe-5" placeholder="Enter Current Password" value={passwordFormData.currentPassword} onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })} />
                                            <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-muted me-2" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                                                <i className={`bi ${showPasswords.current ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-app-muted">{t.newPassword}</label>
                                        <div className="position-relative">
                                            <input type={showPasswords.new ? "text" : "password"} className="form-control rounded-pill bg-light border-0 px-4 pe-5" placeholder="Enter New Password" value={passwordFormData.newPassword} onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })} />
                                            <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-muted me-2" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                                                <i className={`bi ${showPasswords.new ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                            </button>
                                        </div>
                                        <div className="mt-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><i className="bi bi-info-circle me-1"></i>{t.passwordValidationMsg}</div>
                                    </div>
                                    <div className="mb-0">
                                        <label className="form-label small fw-bold text-app-muted">{t.confirmNewPassword}</label>
                                        <div className="position-relative">
                                            <input type={showPasswords.confirm ? "text" : "password"} className="form-control rounded-pill bg-light border-0 px-4 pe-5" placeholder="Confirm New Password" value={passwordFormData.confirmNewPassword} onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmNewPassword: e.target.value })} />
                                            <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-muted me-2" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                                                <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-top p-4 d-flex gap-2">
                                    <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowChangePasswordModal(false)}>{t.cancel}</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 flex-grow-1" disabled={modalLoading}>{modalLoading ? "..." : t.saveChanges}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileCard;
