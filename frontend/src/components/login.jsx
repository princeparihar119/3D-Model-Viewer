import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";

const Login = ({ onLogin, showToast }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = formData.email.trim();
    const password = formData.password;

    if (!trimmedEmail || !password) {
      const msg = "Email and password are required";
      setError(msg);
      if (showToast) showToast(msg, "danger");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email: trimmedEmail, password },
        { withCredentials: true },
      );

      if (onLogin) {
        onLogin(response.data.user);
      }

      if (showToast) {
        showToast("Logged in successfully!", "success");
      }

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";

      setError(errorMessage);

      if (showToast) {
        showToast(errorMessage, "danger");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="auth-card p-4 bg-white rounded shadow-sm"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="auth-header text-center mb-4">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Login to your 3D Model Viewer</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="auth-footer text-center mt-3">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register" className="text-decoration-none fw-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
