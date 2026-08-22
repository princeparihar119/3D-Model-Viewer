import { useState } from "react";
import axios from "axios";
import "../css/ModelUpload.css";

const ModelUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setMessage("");
    setIsError(false);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedExtensions = [".glb", ".gltf"];
    const fileName = selectedFile.name.toLowerCase();

    const isValid = allowedExtensions.some((extension) =>
      fileName.endsWith(extension),
    );

    if (!isValid) {
      setFile(null);
      setIsError(true);
      setMessage("Only .glb and .gltf files are allowed");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setIsError(true);
      setMessage("Please select a 3D model");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setMessage("");
      setIsError(false);

      const formData = new FormData();
      formData.append("model", file);

      const response = await axios.post(
        "http://localhost:8080/api/models/upload",
        formData,
        {
          withCredentials: true,

          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );

              setProgress(percentage);
            }
          },
        },
      );

      setMessage(response.data.message || "Model uploaded successfully");

      setFile(null);
      setProgress(100);

      if (onUploadSuccess) {
        onUploadSuccess(response.data.model);
      }
    } catch (error) {
      console.error("Upload error:", error);

      setIsError(true);

      setMessage(error.response?.data?.message || "Failed to upload model");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        <div className="upload-header">
          <div className="upload-icon">↑</div>

          <div>
            <h2>Upload 3D Model</h2>
            <p>Upload your GLB or GLTF model</p>
          </div>
        </div>

        <div className="file-box">
          <input
            id="model-file"
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <label htmlFor="model-file">
            <span className="file-upload-icon">+</span>

            <strong>Choose a 3D model</strong>

            <small>GLB or GLTF files only</small>
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div className="selected-file">
            <div>
              <strong>{file.name}</strong>

              <small>{(file.size / (1024 * 1024)).toFixed(2)} MB</small>
            </div>

            <span>✓</span>
          </div>
        )}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            "Upload Model"
          )}
        </button>
        {uploading && (
          <div className="progress-container">
            <div className="progress-info">
              <span>Uploading model...</span>
              <span>{progress}%</span>
            </div>

            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width: `${progress}%`,
                }}
              ></div>
            </div>
          </div>
        )}
        {message && (
          <div
            className={
              isError ? "upload-message error" : "upload-message success"
            }
          >
            {isError ? "⚠" : "✓"} {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelUpload;
