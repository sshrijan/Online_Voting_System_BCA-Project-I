import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import ElectionTimer from "./ElectionTimer";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [user, setUser] = useState(null);
  const [voterName, setVoterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t, partyTranslations } = useLanguage();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ fullName: "", dob: "", voterId: "" });
  const [passwordFormData, setPasswordFormData] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [electionEndDate, setElectionEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState("castVote");
  const [editProfileErrors, setEditProfileErrors] = useState({});
  const [editProfileTouched, setEditProfileTouched] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await fetch("/api/me", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          if (data.role !== "admin") {
            setUser(data);
            setVoterName(data.fullName || data.email);
            // If user has already voted, redirect to dashboard
            if (data.votedFor) {
              navigate("/dashboard");
            }
          } else {
            navigate("/");
          }
        } else {
          // Handle token expiration or invalid token
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/");
      } finally { setLoading(false); }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setEditFormData({
        fullName: user.fullName || "",
        dob: user.dob || "",
        voterId: user.voterId || ""
      });
    }
  }, [user]);

  // Validation functions
  const validateEditProfileName = (name) => {
    if (!name) return "Full name is required";
    if (name.trim().length < 3) return "Name must be at least 3 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  const validateEditProfileDob = (dob) => {
    if (!dob) return "Date of birth is required (BS: YYYY-MM-DD)";
    const bsDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dob.match(bsDateRegex);
    if (!match) return "Use format YYYY-MM-DD (e.g. 2058-06-15)";
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (year < 1970 || year > 2065) return "BS year must be between 1970 and 2065";
    if (month < 1 || month > 12) return "Month must be between 01 and 12";
    if (day < 1 || day > 32) return "Day must be between 01 and 32";
    const currentBsYear = new Date().getFullYear() + 56;
    if (year > currentBsYear - 18) return "You must be at least 18 years old";
    return "";
  };

  const validateEditProfileVoterId = (voterId) => {
    if (!voterId) return "Voter ID is required";
    if (!/^\d{8}$/.test(voterId)) return "Voter ID must be exactly 8 digits";
    return "";
  };

  const validateCurrentPassword = (password) => {
    if (!password) return "Current password is required";
    return "";
  };

  const validateNewPassword = (password) => {
    if (!password) return "New password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must include uppercase letter";
    if (!/[a-z]/.test(password)) return "Must include lowercase letter";
    if (!/\d/.test(password)) return "Must include a number";
    if (!/\W/.test(password)) return "Must include a special character";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, newPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== newPassword) return "Passwords do not match";
    return "";
  };

  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const digits = value.replace(/\D/g, "").slice(0, 8);
      let formatted = digits;
      if (digits.length <= 4) {
        formatted = digits;
      } else if (digits.length <= 6) {
        formatted = digits.slice(0, 4) + "-" + digits.slice(4);
      } else {
        formatted = digits.slice(0, 4) + "-" + digits.slice(4, 6) + "-" + digits.slice(6);
      }
      setEditFormData({ ...editFormData, [name]: formatted });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }

    if (editProfileTouched[name]) {
      let error = "";
      if (name === "fullName") error = validateEditProfileName(value);
      else if (name === "dob") error = validateEditProfileDob(value);
      else if (name === "voterId") error = validateEditProfileVoterId(value);
      setEditProfileErrors({ ...editProfileErrors, [name]: error });
    }
  };

  const handleEditProfileBlur = (e) => {
    const { name, value } = e.target;
    setEditProfileTouched({ ...editProfileTouched, [name]: true });
    let error = "";
    if (name === "fullName") error = validateEditProfileName(value);
    else if (name === "dob") error = validateEditProfileDob(value);
    else if (name === "voterId") error = validateEditProfileVoterId(value);
    setEditProfileErrors({ ...editProfileErrors, [name]: error });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData({ ...passwordFormData, [name]: value });

    if (passwordTouched[name]) {
      let error = "";
      if (name === "currentPassword") error = validateCurrentPassword(value);
      else if (name === "newPassword") error = validateNewPassword(value);
      else if (name === "confirmNewPassword") error = validateConfirmPassword(value, passwordFormData.newPassword);
      setPasswordErrors({ ...passwordErrors, [name]: error });
    }
  };

  const handlePasswordBlur = (e) => {
    const { name, value } = e.target;
    setPasswordTouched({ ...passwordTouched, [name]: true });
    let error = "";
    if (name === "currentPassword") error = validateCurrentPassword(value);
    else if (name === "newPassword") error = validateNewPassword(value);
    else if (name === "confirmNewPassword") error = validateConfirmPassword(value, passwordFormData.newPassword);
    setPasswordErrors({ ...passwordErrors, [name]: error });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const fullNameError = validateEditProfileName(editFormData.fullName);
    const dobError = validateEditProfileDob(editFormData.dob);
    const voterIdError = validateEditProfileVoterId(editFormData.voterId);

    setEditProfileErrors({
      fullName: fullNameError,
      dob: dobError,
      voterId: voterIdError
    });
    setEditProfileTouched({
      fullName: true,
      dob: true,
      voterId: true
    });

    if (fullNameError || dobError || voterIdError) return;

    setModalLoading(true);
    setModalError("");
    setModalSuccess("");

    const formDataToSend = new FormData();
    formDataToSend.append("fullName", editFormData.fullName.toLowerCase());
    formDataToSend.append("dob", editFormData.dob);
    formDataToSend.append("voterId", editFormData.voterId);
    if (editProfileImage) formDataToSend.append("profileImage", editProfileImage);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formDataToSend
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        setModalSuccess(t.profileSuccess);
        setTimeout(() => setShowEditProfileModal(false), 1500);
      } else {
        setModalError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setModalError("Network error. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const currentPasswordError = validateCurrentPassword(passwordFormData.currentPassword);
    const newPasswordError = validateNewPassword(passwordFormData.newPassword);
    const confirmPasswordError = validateConfirmPassword(passwordFormData.confirmNewPassword, passwordFormData.newPassword);

    setPasswordErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmNewPassword: confirmPasswordError
    });
    setPasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmNewPassword: true
    });

    if (currentPasswordError || newPasswordError || confirmPasswordError) return;

    setModalLoading(true);
    setModalError("");
    setModalSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setModalSuccess(t.passwordSuccess);
        setPasswordFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        setTimeout(() => setShowChangePasswordModal(false), 1500);
      } else {
        setModalError(data.error || "Failed to change password");
      }
    } catch (err) {
      console.error("Password change error:", err);
      setModalError("Network error. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/candidates");
        const data = await response.json();
        if (response.ok) {
          // Handle both old format (array) and new format (object with success flag)
          const candidatesList = Array.isArray(data) ? data : (data.candidates || []);
          setCandidates(candidatesList);
        }
      } catch (error) { 
        console.error("Error fetching candidates:", error); 
      }
    };
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        if (response.ok && data.electionEndDate) {
          setElectionEndDate(data.electionEndDate);
        }
      } catch (error) { 
        console.error("Error fetching settings:", error); 
      }
    };

    if (user) {
      fetchCandidates();
      fetchSettings();
    }
  }, [user]);

  const isElectionNotStarted = !electionEndDate;
  const isElectionEnded = !isElectionNotStarted && new Date().getTime() > new Date(electionEndDate).getTime();
  const isVotingActive = !isElectionNotStarted && !isElectionEnded;

  const handleVote = async () => {
    if (isElectionNotStarted) {
      alert(t.voteNotStarted || "Voting has not started yet.");
      return;
    }
    if (isElectionEnded) {
      alert(t.timeEnded || "Election time has ended. You can no longer vote.");
      return;
    }
    if (!selectedCandidate) {
      alert("Please select a candidate to vote for!");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required. Please login again.");
      navigate("/");
      return;
    }
    
    try {
      const response = await fetch(`/api/candidates/vote/${selectedCandidate._id}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(t.success);
        // Update user in state to reflect the vote
        setUser(data.user);
        // Navigate to dashboard
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        const errorMsg = data.error || "Error casting vote";
        alert(errorMsg);
        
        // If it's an authentication error, clear token and redirect
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Vote error:", error);
      alert("Error casting vote. Please check your connection and try again.");
    }
  };

  const handleLogout = () => {
    if (window.bootstrap) {
      const modal = new window.bootstrap.Modal(document.getElementById('logoutModal'));
      modal.show();
    }
  };

  const confirmLogout = () => {
    const modal = document.getElementById('logoutModal');
    if (modal && window.bootstrap) {
      const bsModal = window.bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("language");
    setTimeout(() => navigate("/"), 300);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    if (tab === "home") {
      navigate("/dashboard");
    }
  };

  if (loading) return <Loading />;
  if (!user) return null;

  return (
    <>
      <style>{`
                .text-app-dark { color: var(--text-main); transition: color 0.3s; }
                .text-app-muted { color: var(--text-muted); transition: color 0.3s; }
                .avatar-size { width: 45px; height: 45px; object-fit: cover; }
                
                .header-modern {
                    background: var(--header-bg);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border-bottom: 1px solid var(--border-color);
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .header-z { z-index: 1070; }
                .sidebar-z { z-index: 1080; }
                .header-height { height: 75px; }

                .sidebar-modern {
                  width: 280px;
                  height: 100vh;
                  position: fixed;
                  top: 0;
                  left: 0;
                  background: var(--sidebar-bg);
                  color: #ffffff;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  transform: translateX(-100%);
                  box-shadow: 20px 0 50px rgba(0,0,0,0.2);
                  overflow-y: auto;
                }
                .sidebar-modern.open { transform: translateX(0); }
                .sidebar-header {
                  padding: 30px 24px;
                  border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .sidebar-brand {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  font-family: var(--font-heading);
                  font-weight: 700;
                  font-size: var(--fs-h4);
                  color: #ffffff;
                }
                .sidebar-content { padding: 24px 16px; }
                .nav-link-modern {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 14px 16px;
                  border-radius: 14px;
                  color: rgba(255,255,255,0.6);
                  font-family: var(--font-body);
                  font-weight: 500;
                  transition: all 0.2s ease;
                  margin-bottom: 8px;
                  text-decoration: none !important;
                  border: none;
                  background: transparent;
                  width: 100%;
                  text-align: left;
                }
                .nav-link-modern:hover { background: rgba(255,255,255,0.05); color: #ffffff; }
                .nav-link-modern.active {
                  background: linear-gradient(135deg, #4364F7 0%, #6FB1FC 100%);
                  color: #ffffff;
                  font-weight: 600;
                  box-shadow: 0 10px 20px rgba(67, 100, 247, 0.3);
                }
                .sidebar-overlay {
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4);
                  backdrop-filter: blur(4px); z-index: 1075; opacity: 0; visibility: hidden; transition: all 0.3s ease;
                }
                .sidebar-overlay.show { opacity: 1; visibility: visible; }

                .nav-sub-item {
                  display: flex; align-items: center; gap: 10px; padding: 10px 14px 10px 46px;
                  border-radius: 10px; color: rgba(255,255,255,0.5); font-weight: 500;
                  font-size: var(--fs-small); transition: all 0.2s ease; cursor: pointer;
                  border: none; background: transparent; width: 100%; text-align: left;
                  text-decoration: none !important;
                }
                .nav-sub-item:hover { background: rgba(255,255,255,0.05); color: #ffffff; }
                .nav-settings-arrow { margin-left: auto; transition: transform 0.25s ease; }
                .nav-settings-arrow.open { transform: rotate(180deg); }

                .search-pill {
                  background: var(--input-bg); border-radius: 50px; border: 1px solid transparent;
                  padding: 8px 20px; transition: all 0.3s;
                }
                .search-pill:focus-within { background: var(--bg-card); border-color: #4364F7; }
                .search-pill input { font-family: var(--font-body); font-size: var(--fs-small); }

                .footer-modern {
                    background: var(--footer-bg);
                    border-top: 1px solid var(--border-color);
                    padding: 48px 0 24px; transition: background-color 0.3s;
                    margin-top: auto; font-family: var(--font-body);
                }

                .card-modern {
                    background: var(--bg-card); border-radius: 20px; border: none;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: all 0.3s ease;
                    overflow: hidden; font-family: var(--font-body);
                    position: relative; z-index: 1;
                }
                .card-modern:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 10; }
                .card-modern.selected { border: 2px solid #4364F7; background: #f1f4ff; z-index: 5; }
                [data-theme='dark'] .card-modern.selected { background: #2a3b50; }

                .row {
                    position: relative; z-index: 1;
                }
                
                main {
                    position: relative; z-index: 0;
                }


                .profile-dropdown-menu {
                  background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color);
                  min-width: 320px; border-radius: 24px; overflow-x: hidden; overflow-y: auto; max-height: 80vh; 
                  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                  font-family: var(--font-body);
                }
                .profile-dropdown-header {
                  background: linear-gradient(135deg, #4364F7 0%, #6FB1FC 100%);
                  padding: 30px 24px; text-align: center; color: white;
                  font-family: var(--font-heading);
                }
                .profile-dropdown-avatar {
                  width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
                  border: 4px solid rgba(255,255,255,0.2); margin-bottom: 12px;
                  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                }
                .profile-dropdown-body { background: var(--bg-card); padding: 12px; }
                .profile-menu-item {
                  display: flex; align-items: center; gap: 12px; padding: 12px 16px;
                  border-radius: 12px; color: var(--text-main); text-decoration: none;
                  transition: all 0.2s; cursor: pointer; border: none; background: transparent; width: 100%;
                  text-align: left; font-weight: 500;
                }
                .profile-menu-item:hover { background: rgba(0,0,0,0.05); transform: translateX(5px); }
                [data-theme='dark'] .profile-menu-item:hover { background: rgba(255,255,255,0.05); }
                
                .profile-menu-item i {
                  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
                  border-radius: 10px; background: rgba(67, 100, 247, 0.1); color: #4364F7;
                  font-size: 1.1rem;
                }
                .profile-menu-item.logout-item i { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
                .profile-menu-item.logout-item:hover { color: #dc3545; }

                .profile-info-row { 
                  padding: 12px 16px; border-bottom: 1px solid var(--border-color);
                  display: flex; flex-direction: column; gap: 4px;
                }
                .profile-info-label { color: var(--text-muted); font-size: var(--fs-xsmall); font-weight: 600; text-transform: uppercase; }
                .profile-info-value { color: var(--text-main); font-weight: 500; }

                .lang-btn {
                  padding: 6px 12px; border-radius: 10px; border: 1px solid var(--border-color);
                  background: var(--bg-card); color: var(--text-main); font-family: var(--font-heading);
                  font-weight: 600; font-size: var(--fs-xsmall); transition: all 0.2s; cursor: pointer;
                }
                .lang-btn:hover { background: #4364F7; color: white; }
                .toggle-btn {
                  width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border-color);
                  background: var(--bg-card); color: var(--text-main); display: flex;
                  align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer;
                }
                .toggle-btn:hover { background: #4364F7; color: white; border-color: #4364F7; transform: translateY(-2px); }

                @media (max-width: 768px) {
                  .header-modern { height: 65px !important; }
                  .header-height { height: 65px !important; }
                  main { padding: 12px !important; }
                  .card-modern { margin: 0; }
                  .row { margin-left: -6px !important; margin-right: -6px !important; }
                  .row > * { padding-left: 6px !important; padding-right: 6px !important; }
                }

                @media (max-width: 576px) {
                  main { padding: 10px !important; }
                  .card-img-top { height: 180px !important; }
                  h1 { font-size: 1.5rem !important; }
                  h4 { font-size: 1.1rem !important; }
                  .profile-dropdown-menu { min-width: 280px !important; }
                }
      `}</style>

      <div className="position-relative bg-app-neutral d-flex flex-column" style={{ minHeight: "100vh" }}>
        {/* Sidebar component for navigation */}
        <Sidebar
          role="user"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          t={t}
          setShowEditProfileModal={setShowEditProfileModal}
          setShowChangePasswordModal={setShowChangePasswordModal}
        />

        <div className="d-flex flex-column min-vh-100 flex-grow-1">
          <header className="header-modern px-3 d-flex justify-content-between align-items-center shadow-sm position-sticky top-0 header-height header-z">
            {/* Left: sidebar toggle */}
            <div className="d-flex align-items-center flex-shrink-0">
              <button className="btn me-2 text-app-dark d-flex align-items-center justify-content-center p-1 border-0 bg-transparent" onClick={() => setSidebarOpen(true)}>
                <i className="bi bi-text-left fs-2"></i>
              </button>
             
              <h5 className="mb-0 fw-bold d-lg-none text-app-dark">{t.dashboard}</h5>
            </div>

            {/* Center: title + search */}
            <div className="d-none d-lg-flex align-items-center gap-3 flex-grow-1 justify-content-center">
              <h2 className="mb-0 fw-bold text-app-dark text-nowrap">{t.panel}</h2>
              <div className="search-pill d-flex align-items-center gap-2">
                <i className="bi bi-search text-app-muted"></i>
                <input type="text" className="border-0 bg-transparent text-app-dark outline-none" placeholder={t.searchPlaceholder}
                  style={{ width: '180px', fontSize: '0.85rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 gap-md-3 flex-shrink-0">
              <div className="d-flex align-items-center gap-2">
                <button className="lang-btn shadow-sm" onClick={toggleLanguage}>
                  {language === 'en' ? 'नेपाली' : 'English'}
                </button>
                <button className="toggle-btn shadow-sm" onClick={toggleTheme}>
                  <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                </button>
              </div>

              {/* Profile Card Component */}
              <div className="dropdown">
                <div className="d-flex align-items-center gap-2 dropdown-toggle bg-light bg-opacity-10 p-1 pe-3 rounded-pill border shadow-sm transition-all text-app-dark"
                  style={{ cursor: 'pointer' }} data-bs-toggle="dropdown" id="userDropdown">
                  <img src={user.profileImage ? user.profileImage : "admin.jpg"} alt="Avatar" className="rounded-circle shadow-sm avatar-size border border-2 border-white object-fit-cover" />
                  <div className="d-none d-md-block">
                    <div className="fw-bold small" style={{ lineHeight: 1.2 }}>{user.fullName?.split(' ')[0] || 'User'}</div>
                    <div className="text-app-muted" style={{ fontSize: '0.65rem' }}>{t.account}</div>
                  </div>
                  <i className="bi bi-chevron-down small ms-1 text-app-muted"></i>
                </div>
                <div className="dropdown-menu dropdown-menu-end profile-dropdown-menu mt-2 shadow-lg border-0">
                  <div className="profile-dropdown-header">
                    <img src={user.profileImage ? user.profileImage : "admin.jpg"} alt="Avatar" className="profile-dropdown-avatar" />
                    <h5 className="fw-bold mb-0 text-white">{user.fullName || user.email}</h5>
                    <div className="badge rounded-pill bg-dark bg-opacity-20 text-white mt-2 px-3 py-1" style={{ fontSize: '0.7rem' }}>
                      {t.role}
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
                        <span className="profile-info-value">{t.verified}</span>
                        <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                      </div>
                    </div>

                    <button className="profile-menu-item">
                      <i className="bi bi-person-fill"></i>
                      <span>{t.profile}</span>
                    </button>
                    <button className="profile-menu-item" onClick={() => setShowEditProfileModal(true)}>
                      <i className="bi bi-person-lines-fill"></i>
                      <span>{t.editProfile}</span>
                    </button>
                    <button className="profile-menu-item" onClick={() => setShowChangePasswordModal(true)}>
                      <i className="bi bi-key-fill"></i>
                      <span>{t.changePassword}</span>
                    </button>
                    <button className="profile-menu-item">
                      <i className="bi bi-question-circle-fill"></i>
                      <span>{t.support}</span>
                    </button>

                    <div className="border-top my-2 mx-2"></div>

                    <button className="profile-menu-item logout-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i>
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-3 p-md-5">
            <div className="mb-5">
              <h1 className="fw-bold text-app-dark mb-1">{t.ballotPaper}</h1>
              <p className="text-app-muted">{t.selectCandidate}</p>
            </div>

            <div className="mb-5">
              <ElectionTimer targetDate={electionEndDate} t={t} type="user" />
            </div>

            <div className="mb-5">
              <h4 className="fw-bold text-app-dark mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-person-check-fill text-primary"></i> {t.chooseCandidate}
              </h4>
              <div className="row g-4">
                {candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <div key={candidate._id} className="col-12 col-md-4">
                    <div className={`card card-modern h-100 ${selectedCandidate && selectedCandidate._id === candidate._id ? 'selected shadow-lg' : ''} ${!isVotingActive ? 'opacity-75' : ''}`}
                        onClick={() => isVotingActive && setSelectedCandidate(candidate)}
                        style={{ cursor: isVotingActive ? 'pointer' : 'not-allowed' }}>
                        <div className="position-relative">
                          <img src={candidate.candidatePhoto ? candidate.candidatePhoto : "admin.jpg"} className="card-img-top" style={{ height: "240px", objectFit: "cover" }} alt={candidate.name} />
                          {selectedCandidate && selectedCandidate._id === candidate._id && (
                            <div className="position-absolute top-0 end-0 m-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-check-lg fs-4"></i>
                            </div>
                          )}
                          <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                            <h5 className="fw-bold mb-0">{candidate.name}</h5>
                            <div className="small opacity-75">{partyTranslations[language][candidate.party] || candidate.party}</div>
                          </div>
                        </div>
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between mb-3">
                            <div>
                              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>{t.party}</div>
                              <div className="fw-bold text-app-dark">{partyTranslations[language][candidate.party] || candidate.party}</div>
                            </div>
                            <div className="text-end">
                              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>{t.age}</div>
                              <div className="fw-bold text-app-dark">{candidate.age} {t.yrs}</div>
                            </div>
                          </div>
                          <button
                            className={`btn ${
                              isElectionEnded ? 'btn-secondary' :
                              isElectionNotStarted ? 'btn-warning' :
                              'btn-primary'
                            } w-100 rounded-pill py-2 fw-bold shadow-blue mt-2`}
                            data-bs-toggle="modal"
                            data-bs-target={isVotingActive ? "#confirmVoteModal" : ""}
                            onClick={() => isVotingActive && setSelectedCandidate(candidate)}
                            disabled={!isVotingActive}
                          >
                            {isElectionEnded ? t.timeEnded : isElectionNotStarted ? t.voteNotStarted : t.castVote}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <div className="text-app-muted mb-3"><i className="bi bi-inbox fs-1"></i></div>
                    <p className="text-app-muted">{t.noCandidates}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center sticky-bottom pb-4" style={{ zIndex: 5 }}>
              <button
                className={`btn ${
                isElectionEnded ? 'btn-secondary' :
                isElectionNotStarted ? 'btn-warning' :
                'btn-primary'
              } rounded-pill px-5 py-3 fw-bold shadow-lg`}
                data-bs-toggle="modal"
                data-bs-target={isVotingActive ? "#confirmVoteModal" : ""}
                disabled={!selectedCandidate || !isVotingActive}
              >
                <i className="bi bi-send-fill me-2"></i>{isElectionEnded ? t.timeEnded : isElectionNotStarted ? t.voteNotStarted : t.castMyVote}
              </button>
              {(!selectedCandidate && isVotingActive) && <div className="mt-2 text-primary small fw-bold">{t.selectAbove}</div>}
              {isElectionEnded && <div className="mt-2 text-danger small fw-bold">{t.timeEnded}</div>}
              {isElectionNotStarted && <div className="mt-2 text-warning small fw-bold">{t.voteNotStarted}</div>}
            </div>
          </main>

          <Footer language={language} />
        </div>

        <div className="modal fade" id="logoutModal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="profile-dropdown-header py-4 bg-danger" style={{ background: '#dc3545' }}>
                <div className="d-inline-flex p-3 rounded-circle bg-white text-danger mb-3 shadow-sm"><i className="bi bi-box-arrow-right fs-3"></i></div>
                <h4 className="text-white fw-bold mb-0">{t.logoutConfirm}</h4>
              </div>
              <div className="modal-body p-5 text-center bg-light">
                <p className="text-app-muted mb-4">{t.logoutText}</p>
                <div className="d-flex gap-3">
                  <button className="btn btn-light rounded-pill flex-grow-1 py-2 fw-bold text-app-dark" data-bs-dismiss="modal">{t.cancel}</button>
                  <button className="btn btn-danger rounded-pill flex-grow-1 py-2 fw-bold shadow-sm" onClick={confirmLogout}>{t.logout}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Vote Modal */}
        <div className="modal fade" id="confirmVoteModal" tabIndex="-1" aria-labelledby="confirmVoteModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="profile-dropdown-header py-4 bg-primary">
                <div className="d-inline-flex p-3 rounded-circle bg-white text-primary mb-3 shadow-sm"><i className="bi bi-patch-check-fill fs-3"></i></div>
                <h4 className="text-white fw-bold mb-0">{t.confirmVote}</h4>
              </div>
              <div className="modal-body p-5 text-center bg-light">
                {selectedCandidate && (
                  <>
                    <p className="text-app-muted mb-4">{t.confirmText} <span className="fw-bold text-primary">{selectedCandidate.name}</span>?</p>
                    <p className="text-danger small fw-bold mb-4">{t.irreversible}</p>
                  </>
                )}
                <div className="d-flex gap-3">
                  <button className="btn btn-light rounded-pill flex-grow-1 py-2 fw-bold text-app-dark" data-bs-dismiss="modal">{t.cancel}</button>
                  <button className="btn btn-primary rounded-pill flex-grow-1 py-2 fw-bold shadow-sm" onClick={handleVote} data-bs-dismiss="modal">{t.castMyVote}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfileModal && (
          <div className="modal fade show d-block modal-z" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <div className="modal-header border-bottom p-4 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0 text-app-dark">{t.editProfile}</h5>
                  <button className="btn-close" onClick={() => setShowEditProfileModal(false)}></button>
                </div>
                <form onSubmit={handleUpdateProfile}>
                  <div className="modal-body p-4">
                    {modalError && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-1"></i>{modalError}</div>}
                    {modalSuccess && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-1"></i>{modalSuccess}</div>}

                    <div className="mb-3 text-center">
                      <div className="position-relative d-inline-block">
                        <img src={user.profileImage ? user.profileImage : "admin.jpg"}
                          className="rounded-circle border border-4 border-white shadow-sm"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }} alt="Avatar" />
                        <label className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle cursor-pointer shadow-sm" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-camera-fill"></i>
                          <input type="file" className="d-none" onChange={(e) => setEditProfileImage(e.target.files[0])} accept="image/*" />
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-app-muted">{t.fullNameLabel}</label>
                      <input type="text" className={`form-control rounded-pill bg-light border-0 px-4 ${editProfileErrors.fullName && editProfileTouched.fullName ? 'border-danger border' : ''}`}
                        placeholder={t.fullNamePlaceholder}
                        value={editFormData.fullName} 
                        onChange={handleEditProfileChange}
                        onBlur={handleEditProfileBlur}
                        name="fullName" />
                      {editProfileErrors.fullName && editProfileTouched.fullName && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{editProfileErrors.fullName}</span>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-app-muted">{t.dobLabel}</label>
                      <input type="text" className={`form-control rounded-pill bg-light border-0 px-4 ${editProfileErrors.dob && editProfileTouched.dob ? 'border-danger border' : ''}`}
                        placeholder={t.dobPlaceholder}
                        value={editFormData.dob} 
                        onChange={handleEditProfileChange}
                        onBlur={handleEditProfileBlur}
                        name="dob" />
                      {editProfileErrors.dob && editProfileTouched.dob && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{editProfileErrors.dob}</span>}
                    </div>
                    <div className="mb-0">
                      <label className="form-label small fw-bold text-app-muted">{t.voterIdLabel}</label>
                      <input type="text" className={`form-control rounded-pill bg-light border-0 px-4 ${editProfileErrors.voterId && editProfileTouched.voterId ? 'border-danger border' : ''}`}
                        placeholder={t.voterIdPlaceholder}
                        value={editFormData.voterId} 
                        onChange={handleEditProfileChange}
                        onBlur={handleEditProfileBlur}
                        name="voterId" />
                      {editProfileErrors.voterId && editProfileTouched.voterId && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{editProfileErrors.voterId}</span>}
                    </div>
                  </div>
                  <div className="modal-footer border-top p-4 d-flex gap-2">
                    <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowEditProfileModal(false)}>{t.cancel}</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 flex-grow-1" disabled={modalLoading || Object.values(editProfileErrors).some(e => e)}>
                      {modalLoading ? "..." : t.saveChanges}
                    </button>
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
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <div className="modal-header border-bottom p-4 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0 text-app-dark">{t.changePassword}</h5>
                  <button className="btn-close" onClick={() => setShowChangePasswordModal(false)}></button>
                </div>
                <form onSubmit={handleChangePassword}>
                  <div className="modal-body p-4">
                    {modalError && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-1"></i>{modalError}</div>}
                    {modalSuccess && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-1"></i>{modalSuccess}</div>}

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-app-muted">{t.currentPassword}</label>
                      <div className="position-relative">
                        <input type={showPasswords.current ? "text" : "password"} name="currentPassword"
                          className={`form-control rounded-pill bg-light border-0 px-4 pe-5 ${passwordErrors.currentPassword && passwordTouched.currentPassword ? 'border-danger border' : ''}`}
                          placeholder="••••••••"
                          value={passwordFormData.currentPassword} 
                          onChange={handlePasswordChange}
                          onBlur={handlePasswordBlur} />
                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-muted me-2"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                          <i className={`bi ${showPasswords.current ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                      {passwordErrors.currentPassword && passwordTouched.currentPassword && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{passwordErrors.currentPassword}</span>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-app-muted">{t.newPassword}</label>
                      <div className="position-relative">
                        <input type={showPasswords.new ? "text" : "password"} name="newPassword"
                          className={`form-control rounded-pill bg-light border-0 px-4 pe-5 ${passwordErrors.newPassword && passwordTouched.newPassword ? 'border-danger border' : ''}`}
                          placeholder="••••••••"
                          value={passwordFormData.newPassword} 
                          onChange={handlePasswordChange}
                          onBlur={handlePasswordBlur} />
                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-muted me-2"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                          <i className={`bi ${showPasswords.new ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                      {passwordErrors.newPassword && passwordTouched.newPassword && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{passwordErrors.newPassword}</span>}
                      <div className="mt-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        {t.passwordValidationMsg}
                      </div>
                    </div>
                    <div className="mb-0">
                      <label className="form-label small fw-bold text-app-muted">{t.confirmNewPassword}</label>
                      <div className="position-relative">
                        <input type={showPasswords.confirm ? "text" : "password"} name="confirmNewPassword"
                          className={`form-control rounded-pill bg-light border-0 px-4 pe-5 ${passwordErrors.confirmNewPassword && passwordTouched.confirmNewPassword ? 'border-danger border' : ''}`}
                          placeholder="••••••••"
                          value={passwordFormData.confirmNewPassword} 
                          onChange={handlePasswordChange}
                          onBlur={handlePasswordBlur} />
                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-muted me-2"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                          <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                      {passwordErrors.confirmNewPassword && passwordTouched.confirmNewPassword && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{passwordErrors.confirmNewPassword}</span>}
                    </div>
                  </div>
                  <div className="modal-footer border-top p-4 d-flex gap-2">
                    <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowChangePasswordModal(false)}>{t.cancel}</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 flex-grow-1" disabled={modalLoading || Object.values(passwordErrors).some(e => e)}>
                      {modalLoading ? "..." : t.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Vote;