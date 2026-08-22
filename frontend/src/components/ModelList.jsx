import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../css/ModelList.css";

const API_BASE_URL = "http://localhost:8080/api/models";
const AXIOS_CONFIG = { withCredentials: true };

const ModelList = ({ onSelectModel }) => {
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingModel, setEditingModel] = useState(null);
  const [newName, setNewName] = useState("");

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_BASE_URL, AXIOS_CONFIG);
      setModels(response.data.models || []);
    } catch (err) {
      console.error("Fetch models error:", err);
      setError(err.response?.data?.message || "Failed to fetch models");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(search.toLowerCase())
  );

  const startRename = (model) => {
    setEditingModel(model);
    setNewName(model.name);
  };

  const handleRename = async () => {
    if (!newName.trim()) {
      alert("Model name cannot be empty");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/${editingModel._id}`,
        { name: newName.trim() },
        AXIOS_CONFIG
      );

      setEditingModel(null);
      setNewName("");
      fetchModels();
    } catch (err) {
      console.error("Rename error:", err);
      alert(err.response?.data?.message || "Failed to rename model");
    }
  };

  const handleDelete = async (model) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${model.name}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/${model._id}`, AXIOS_CONFIG);
      setModels((prevModels) =>
        prevModels.filter((item) => item._id !== model._id)
      );
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete model");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status"></div>
        <p className="mt-3">Loading models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button
          className="btn btn-sm btn-danger ms-3"
          onClick={fetchModels}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="model-list-container">
      <div className="model-list-header">
        <div>
          <h2>Your 3D Models</h2>
          <p>Total Models: {models.length}</p>
        </div>

        <div className="search-box">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <div className="no-models">
          <h4>No models found</h4>
          <p>Try searching with another name.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredModels.map((model) => (
            <div className="col-md-6 col-lg-4" key={model._id}>
              <div className="model-card">
                <div className="model-card-body">
                  <h5 className="model-name">{model.name}</h5>

                  <p className="model-type">
                    Type: {model.fileType?.toUpperCase()}
                  </p>

                  <p className="model-date">
                    Uploaded:{" "}
                    {new Date(model.createdAt).toLocaleDateString()}
                  </p>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => onSelectModel(model)}
                    >
                      👁 View Model
                    </button>

                    <button
                      className="btn btn-warning"
                      onClick={() => startRename(model)}
                    >
                      ✏️ Rename
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(model)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingModel && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rename Model</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingModel(null)}
                ></button>
              </div>

              <div className="modal-body">
                <label className="form-label">Model Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingModel(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleRename}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelList;