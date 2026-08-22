import mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  fileUrl: {
    type: String,
    required: true,
  },

  fileType: {
    type: String,
    required: true,
    enum: ["glb", "obj"],
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Model =
  mongoose.models.Model ||
  mongoose.model("Model", modelSchema);

export default Model;