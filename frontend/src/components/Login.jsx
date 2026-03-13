import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "email" ? value.toLowerCase() : value
    });
    if (touched[name]) {
      setErrors({ ...errors, [name]: name === "email" ? validateEmail(value) : validatePassword(value) });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: name === "email" ? validateEmail(value) : validatePassword(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok && data.success && data.token) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Navigate based on role
        const redirectPath = data.user.role === "admin" ? "/admin" : "/dashboard";
        navigate(redirectPath);
      } else {
        const errorMsg = data.error || "Login failed. Please try again.";
        alert(errorMsg);
        setErrors({ email: "", password: "" });
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>

      {/* Decorative Elements */}
      <div className="position-absolute" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(67, 100, 247, 0.15) 0%, transparent 70%)', top: '-100px', left: '-100px' }}></div>
      <div className="position-absolute" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(111, 177, 252, 0.1) 0%, transparent 70%)', bottom: '-150px', right: '-150px' }}></div>

      <div className="container" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7 col-sm-10">
            <div className="text-center mb-5 animate__animated animate__fadeInDown">

              <h1 className="text-white fw-bold display-6">Sign In</h1>

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
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i class="bi bi-envelope-at text-primary"></i>
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ boxShadow: 'none' }}
                      />
                    </div>
                    {errors.email && touched.email && <span className="text-danger small mt-2 d-block"><i className="bi bi-exclamation-circle me-1"></i>{errors.email}</span>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-0 ps-0 pe-3 border-bottom rounded-0 border-white-10">
                        <i className="bi bi-lock text-primary"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white p-3 ps-0"
                        placeholder="Enter Your Password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ boxShadow: 'none' }}
                      />
                      <button type="button" className="btn bg-transparent border-0 border-bottom rounded-0 border-white-10 text-white-50 px-3"
                        onClick={() => setShowPassword(!showPassword)}>
                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                      </button>
                    </div>
                    {errors.password && touched.password && <span className="text-danger small mt-2 d-block"><i className="bi bi-exclamation-circle me-1"></i>{errors.password}</span>}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-5">
                    <div className="form-check">
                      <input className="form-check-input bg-transparent border-white-10" type="checkbox" id="remember" />
                      <label className="form-check-label text-white-50 small" htmlFor="remember">Stay signed in</label>
                    </div>

                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold mb-4 shadow-lg transform transition-all d-flex align-items-center justify-content-center gap-2"
                    disabled={isLoading}
                    style={{ background: 'linear-gradient(135deg, #4364F7 0%, #6FB1FC 100%)', border: 'none' }}
                    onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.target.style.filter = 'none'}>
                    {isLoading ? <><span className="spinner-border spinner-border-sm"></span> Authenticating...</> : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>}
                  </button>
                </form>

                <div className="text-center">
                  <span className="text-white-50 small">New to EC Nepal? </span>
                  <Link to="/signup" className="text-white fw-bold text-decoration-none ms-1 hover-underline">Register</Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-5 text-white-50 small">
              © 2082 Election Commission Nepal
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .border-white-10 { border-color: rgba(255,255,255,0.1) !important; }
        .hover-underline:hover { text-decoration: underline !important; }
        .text-white-50 { color: rgba(255,255,255,0.5) !important; }
        .transition-all { transition: all 0.3s ease; }
        .input-group-text i { font-size: 1.1rem; }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        .form-check-input:checked { background-color: #4364F7; border-color: #4364F7; }
        
        h1 { font-family: var(--font-heading); font-weight: 800; }
        .form-label { font-family: var(--font-body); font-weight: 600; font-size: var(--fs-xsmall); }
        .form-control { font-family: var(--font-body); font-size: var(--fs-body); }
        .btn { font-family: var(--font-heading); }
      `}</style>
    </div>
  );
};

export default Login;