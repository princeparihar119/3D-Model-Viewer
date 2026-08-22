import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login";
import Register from "./components/Register";
import ModelList from "./components/ModelList";
import ModelViewer from "./components/ModelViewer";
import ModelUpload from "./components/ModelUpload";
import Footer from "./components/Footer";
import ToastMessage from "./components/ToastMessage";

import "./css/App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [selectedModel, setSelectedModel] = useState(null);
  const [wireframe, setWireframe] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#202020");
  const [showUpload, setShowUpload] = useState(false);

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: "", type: "success" });
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await axios.get("http://localhost:8080/api/auth/me", {
          withCredentials: true,
        });
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/auth/logout",
        {},
        { withCredentials: true },
      );

      setIsLoggedIn(false);
      setSelectedModel(null);
      setShowUpload(false);
      showToast("Logout successful", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Logout failed", "danger");
    }
  };

  if (checkingAuth) {
    return (
      <div className="auth-loading d-flex flex-column align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Checking authentication...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={clearToast}
      />

      <div className="app-container d-flex flex-column min-vh-100">
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Login
                  onLogin={() => {
                    setIsLoggedIn(true);
                    showToast("Welcome back!", "success");
                  }}
                  showToast={showToast}
                />
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Register showToast={showToast} />
              )
            }
          />
          <Route
            path="/"
            element={
              !isLoggedIn ? (
                <Navigate to="/login" replace />
              ) : (
                <>
                  <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
                    <div className="container-fluid">
                      <span
                        className="navbar-brand fw-bold"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setShowUpload(false);
                          setSelectedModel(null);
                        }}
                      >
                        3D Model Viewer
                      </span>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          className={`btn ${
                            !showUpload ? "btn-light" : "btn-outline-light"
                          }`}
                          onClick={() => {
                            setShowUpload(false);
                            setSelectedModel(null);
                          }}
                        >
                          Models
                        </button>

                        <button
                          className={`btn ${
                            showUpload ? "btn-primary" : "btn-outline-light"
                          }`}
                          onClick={() => {
                            setShowUpload(true);
                            setSelectedModel(null);
                          }}
                        >
                          + Upload Model
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </nav>
                  <main className="container py-4 flex-grow-1">
                    {showUpload ? (
                      <section>
                        <h2 className="mb-4 fw-bold">Upload 3D Model</h2>
                        <ModelUpload
                          onUploadSuccess={() => {
                            showToast(
                              "3D model uploaded successfully",
                              "success",
                            );
                            setShowUpload(false);
                          }}
                          showToast={showToast}
                        />
                      </section>
                    ) : (
                      <>
                        <ModelList
                          onSelectModel={setSelectedModel}
                          showToast={showToast}
                        />

                        {selectedModel && (
                          <div className="mt-4">
                            <div className="model-settings d-flex align-items-center gap-3 mb-3">
                              <button
                                className="btn btn-dark"
                                onClick={() => setWireframe(!wireframe)}
                              >
                                {wireframe
                                  ? "Disable Wireframe"
                                  : "Enable Wireframe"}
                              </button>

                              <label className="background-control d-flex align-items-center gap-2 mb-0">
                                <span>Background</span>
                                <input
                                  type="color"
                                  className="form-control form-control-color"
                                  value={backgroundColor}
                                  onChange={(e) =>
                                    setBackgroundColor(e.target.value)
                                  }
                                />
                              </label>
                            </div>

                            <ModelViewer
                              modelId={selectedModel._id}
                              modelUrl={selectedModel.fileUrl}
                              wireframe={wireframe}
                              backgroundColor={backgroundColor}
                              showToast={showToast}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </main>
                  <Footer />
                </>
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
