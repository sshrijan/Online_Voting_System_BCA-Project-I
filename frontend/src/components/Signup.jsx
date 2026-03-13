import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    dob: "",
    voterId: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    voterId: "",
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    dob: false,
    voterId: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const validateFullName = (name) => {
    if (!name) return "Full name is required";
    if (name.trim().length < 3) return "Name must be at least 3 characters long";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Minimum 8 characters required";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/.test(password))
      return "Include uppercase, lowercase, number, and symbol";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // DOB validation — BS (Bikram Sambat) date in YYYY-MM-DD format
  const validateDob = (dob) => {
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
    // Current BS year is approx. Gregorian year + 56/57
    const currentBsYear = new Date().getFullYear() + 56;
    if (year > currentBsYear - 18) return "You must be at least 18 years old to register";
    return "";
  };

  // Nepali Voter ID — exactly 8 digits
  const validateVoterId = (voterId) => {
    if (!voterId) return "Voter ID is required";
    if (!/^\d{8}$/.test(voterId)) return "Voter ID must be exactly 8 digits";
    return "";
  };

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // Auto-insert hyphens for BS date field as user types
    if (name === "dob") {
      const digits = value.replace(/\D/g, "").slice(0, 8);
      if (digits.length <= 4) {
        value = digits;
      } else if (digits.length <= 6) {
        value = digits.slice(0, 4) + "-" + digits.slice(4);
      } else {
        value = digits.slice(0, 4) + "-" + digits.slice(4, 6) + "-" + digits.slice(6);
      }
    }

    setFormData({
      ...formData,
      [name]: (name === "email" || name === "fullName") ? value.toLowerCase() : value
    });
    if (touched[name]) {
      let error = "";
      if (name === "fullName") error = validateFullName(value);
      else if (name === "email") error = validateEmail(value);
      else if (name === "password") error = validatePassword(value);
      else if (name === "confirmPassword") error = validateConfirmPassword(value, formData.password);
      else if (name === "dob") error = validateDob(value);
      else if (name === "voterId") error = validateVoterId(value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    let error = "";
    if (name === "fullName") error = validateFullName(value);
    else if (name === "email") error = validateEmail(value);
    else if (name === "password") error = validatePassword(value);
    else if (name === "confirmPassword") error = validateConfirmPassword(value, formData.password);
    else if (name === "dob") error = validateDob(value);
    else if (name === "voterId") error = validateVoterId(value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullNameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    const dobError = validateDob(formData.dob);
    const voterIdError = validateVoterId(formData.voterId);

    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      dob: dobError,
      voterId: voterIdError,
    });
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      dob: true,
      voterId: true,
    });

    if (fullNameError || emailError || passwordError || confirmPasswordError || dobError || voterIdError) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("dob", formData.dob);
      formDataToSend.append("voterId", formData.voterId);
      if (profileImage) formDataToSend.append("profileImage", profileImage);

      const response = await fetch("/api/register", { method: "POST", body: formDataToSend });
      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login to continue.");
        navigate("/");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>

      <div className="position-absolute" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', top: '-100px', right: '-100px' }}></div>
      <div className="position-absolute" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(67, 100, 247, 0.12) 0%, transparent 70%)', bottom: '-150px', left: '-150px' }}></div>

      <div className="container py-5" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-11">
            <div className="text-center mb-5 animate__animated animate__fadeInDown">
              <h1 className="text-white fw-bold display-6">Voter Registration</h1>
            </div>

            <div className="card border-0 shadow-2xl overflow-hidden"
              style={{
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit} className="row g-4">
                  {/* Photo Upload */}
                  <div className="col-12 text-center mb-2">
                    <label htmlFor="profileImage" className="d-inline-block position-relative cursor-pointer group">
                      <div className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden border border-2 border-white-10"
                        style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)' }}>
                        {profileImage ? (
                          <img src={URL.createObjectURL(profileImage)} alt="Preview" className="w-100 h-100 object-fit-cover" />
                        ) : (
                          <i className="bi bi-camera-fill text-white-50 fs-2"></i>
                        )}
                      </div>
                      <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center border border-2 border-slate-900" style={{ width: '30px', height: '30px' }}>
                        <i className="bi bi-plus text-white"></i>
                      </div>
                      <input type="file" id="profileImage" className="d-none" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
                    </label>
                    <div className="mt-2 text-white-50 small">Upload Profile Picture</div>
                  </div>

                  {/* Full Name */}
                  <div className="col-12">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i className="bi bi-person text-primary"></i>
                      </span>
                      <input type="text" name="fullName" className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="Enter Your Fullname" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} />
                    </div>
                    {errors.fullName && touched.fullName && <span className="text-danger small mt-2 d-block">{errors.fullName}</span>}
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}> Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i className="bi bi-envelope text-primary"></i>
                      </span>
                      <input type="email" name="email" className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="Enter Your Email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
                    </div>
                    {errors.email && touched.email && <span className="text-danger small mt-2 d-block">{errors.email}</span>}
                  </div>

                  {/* Date of Birth & Voter ID */}
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Date of Birth</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i className="bi bi-calendar-event text-primary"></i>
                      </span>
                      <input
                        type="text"
                        name="dob"
                        className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="YYYY-MM-DD (BS)"
                        value={formData.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </div>
                    {errors.dob && touched.dob && <span className="text-danger small mt-2 d-block">{errors.dob}</span>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Voter ID</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i className="bi bi-card-text text-primary"></i>
                      </span>
                      <input
                        type="text"
                        name="voterId"
                        className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="8-digit Voter ID"
                        value={formData.voterId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={8}
                        inputMode="numeric"
                      />
                    </div>
                    {errors.voterId && touched.voterId
                      ? <span className="text-danger small mt-2 d-block">{errors.voterId}</span>
                      : <span className="text-white-50 small mt-1 d-block" style={{ fontSize: '0.7rem' }}>Enter your 8-digit Voter ID number</span>
                    }
                  </div>

                  {/* Password row */}
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i className="bi bi-shield-lock text-primary"></i>
                      </span>
                      <input type={showPassword ? "text" : "password"} name="password" className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="Enter Password" value={formData.password} onChange={handleChange} onBlur={handleBlur} />
                      <button type="button" className="btn bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white-50" onClick={() => setShowPassword(!showPassword)}>
                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                      </button>
                    </div>
                    {errors.password && touched.password && <span className="text-danger small mt-2 d-block">{errors.password}</span>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i className="bi bi-shield-check text-primary"></i>
                      </span>
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
                      <button type="button" className="btn bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white-50" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && <span className="text-danger small mt-2 d-block">{errors.confirmPassword}</span>}
                  </div>

                  <div className="col-12 mt-5">
                    <div className="form-check mb-4">
                      <input className="form-check-input bg-transparent border-white-10" type="checkbox" id="terms" required />
                      <label className="form-check-label text-white-50 small" htmlFor="terms">
                        I confirm that all provided information is correct.
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold transform transition-all d-flex align-items-center justify-content-center gap-2"
                      disabled={isLoading}
                      style={{ background: 'linear-gradient(135deg, #4364F7 0%, #6FB1FC 100%)', border: 'none' }}>
                      {isLoading ? <><span className="spinner-border spinner-border-sm"></span> Creating Account...</> : <><i className="bi bi-person-check-fill"></i> Register</>}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <span className="text-white-50 small">Already registered? </span>
                  <Link to="/" className="text-white fw-bold text-decoration-none ms-1 hover-underline">Sign In Here</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .border-white-10 { border-color: rgba(255,255,255,0.1) !important; }
        .hover-underline:hover { text-decoration: underline !important; }
        .text-white-50 { color: rgba(255,255,255,0.5) !important; }
        .transition-all { transition: all 0.3s ease; }
        .cursor-pointer { cursor: pointer; }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        .form-check-input:checked { background-color: #4364F7; border-color: #4364F7; }
        input[type="file"]::-webkit-file-upload-button { display: none; }
        .dob-input::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        
        h1 { font-family: var(--font-heading); font-weight: 800; }
        .form-label { font-family: var(--font-body); font-weight: 600; font-size: var(--fs-xsmall); }
        .form-control { font-family: var(--font-body); font-size: var(--fs-body); }
        .btn { font-family: var(--font-heading); }
      `}</style>
    </div>
  );
};

export default Signup;