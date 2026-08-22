import express from "express";

import {
  saveCameraState,
  getCameraState,
} from "../controllers/cameraController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:modelId/camera",
  authMiddleware,
  saveCameraState
);

router.get(
  "/:modelId/camera",
  authMiddleware,
  getCameraState
);

export default router;