import express from "express";

import {
  uploadModel,
  getModels,
  getModelById,
  deleteModel,
  renameModel,
} from "../controllers/modelController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getModels);

router.get("/:id", authMiddleware, getModelById);
//upload 3d files
router.post(
  "/upload",
  authMiddleware,
  upload.single("model"),
  uploadModel
);

router.put("/:id", authMiddleware, renameModel);

router.delete("/:id", authMiddleware, deleteModel);

export default router;