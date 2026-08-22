import CameraState from "../models/cameraState.js";
import Model from "../models/Model.js";

export const saveCameraState = async (req, res) => {
  try {
    const { modelId } = req.params;

    const {
      position,
      target,
      zoom,
    } = req.body;

    const model = await Model.findById(modelId);

    if (!model) {
      return res.status(404).json({
        message: "3D model not found",
      });
    }

    if (
      !position ||
      position.x === undefined ||
      position.y === undefined ||
      position.z === undefined
    ) {
      return res.status(400).json({
        message: "Invalid camera position",
      });
    }

    if (
      !target ||
      target.x === undefined ||
      target.y === undefined ||
      target.z === undefined
    ) {
      return res.status(400).json({
        message: "Invalid camera target",
      });
    }

    const existingState = await CameraState.findOne({
      user: req.userId,
      model: modelId,
    });

    if (existingState) {
      existingState.position = position;
      existingState.target = target;

      if (zoom !== undefined) {
        existingState.zoom = zoom;
      }

      await existingState.save();

      return res.status(200).json({
        message: "Camera state updated successfully",
        cameraState: existingState,
      });
    }

    const cameraState = await CameraState.create({
      user: req.userId,
      model: modelId,
      position,
      target,
      zoom: zoom ?? 1,
    });

    return res.status(201).json({
      message: "Camera state saved successfully",
      cameraState,
    });

  } catch (error) {
    console.error("Save camera state error:", error);

    return res.status(500).json({
      message: "Failed to save camera state",
      error: error.message,
    });
  }
};


export const getCameraState = async (req, res) => {
  try {
    const { modelId } = req.params;
    const cameraState = await CameraState.findOne({
      user: req.userId,
      model: modelId,
    });

    if (!cameraState) {
      return res.status(404).json({
        message: "No saved camera state found",
      });
    }

    return res.status(200).json({
      message: "Camera state fetched successfully",
      cameraState,
    });

  } catch (error) {
    console.error("Get camera state error:", error);

    return res.status(500).json({
      message: "Failed to fetch camera state",
      error: error.message,
    });
  }
};