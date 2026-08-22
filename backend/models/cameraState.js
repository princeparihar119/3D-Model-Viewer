import mongoose from "mongoose";

const cameraStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model",
      required: true,
    },

    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
      z: {
        type: Number,
        required: true,
      },
    },

    target: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
      z: {
        type: Number,
        required: true,
      },
    },

    zoom: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

cameraStateSchema.index(
  { user: 1, model: 1 },
  { unique: true }
);

const CameraState = mongoose.model(
  "CameraState",
  cameraStateSchema
);

export default CameraState;