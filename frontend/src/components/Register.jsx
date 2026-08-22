import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../css/Register.css";

const API_URL = import.meta.env.VITE_API_URL;

const Register = ({ showToast }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          name,
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      const msg = response.data?.message || "Registration successful!";
      setSuccess(msg);

      if (showToast) {
        showToast(msg, "success");
      }

      // Registration successful hone ke 1.2 sec baad login page par redirect hoga
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Register Error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
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
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted">Start using your 3D Model Viewer</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email Input */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">{success}</div>}
          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold mt-2"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <div className="auth-footer text-center mt-3">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="text-decoration-none fw-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
