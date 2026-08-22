import cloudinary from "../config/cloudinary.js";
import Model from "../models/model.js";

export const uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a .glb or .obj file",
      });
    }

    const file = req.file;

    const fileType = file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    // Upload Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw", // store 3d file in cloudinary
          folder: "3d-viewer/models",
          public_id: `${Date.now()}-${file.originalname
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "-")}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });

    // save to db
    const model = await Model.create({
      name: file.originalname,
      fileUrl: uploadResult.secure_url,
      fileType,
      uploadedBy: req.userId,
    });

    return res.status(201).json({
      message: "3D model uploaded successfully",
      model: {
        id: model._id,
        name: model.name,
        fileUrl: model.fileUrl,
        fileType: model.fileType,
        uploadedBy: model.uploadedBy,
        createdAt: model.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload Model Error:", error);

    return res.status(500).json({
      message: "Failed to upload 3D model",
      error: error.message,
    });
  }
};

// only user data see
export const getModels = async (req, res) => {
  try {
    const models = await Model.find({
      uploadedBy: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: models.length,
      models,
    });
  } catch (error) {
    console.error("Get Models Error:", error);

    return res.status(500).json({
      message: "Failed to fetch models",
    });
  }
};

export const getModelById = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await Model.findOne({
      _id: id,
      uploadedBy: req.userId, // another user known a id but not access another user model
    });

    if (!model) {
      return res.status(404).json({
        message: "Model not found",
      });
    }

    return res.status(200).json({
      model,
    });
  } catch (error) {
    console.error("Get Model Error:", error);

    return res.status(500).json({
      message: "Failed to fetch model",
    });
  }
};

export const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await Model.findOne({
      _id: id,
      uploadedBy: req.userId,
    });

    if (!model) {
      return res.status(404).json({
        message: "Model not found",
      });
    }

    // Delete file Cloudinary
    const publicId = model.fileUrl
      .split("/upload/")[1]
      .split(".")[0]
      .replace(/^v\d+\//, "");

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
    await Model.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Model deleted successfully",
    });
  } catch (error) {
    console.error("Delete Model Error:", error);

    return res.status(500).json({
      message: "Failed to delete model",
      error: error.message,
    });
  }
};

export const renameModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Model name is required",
      });
    }

    const model = await Model.findOne({
      _id: id,
      uploadedBy: req.userId,
    });

    if (!model) {
      return res.status(404).json({
        message: "Model not found",
      });
    }

    model.name = name.trim();

    await model.save();

    return res.status(200).json({
      message: "Model renamed successfully",
      model,
    });
  } catch (error) {
    console.error("Rename Model Error:", error);

    return res.status(500).json({
      message: "Failed to rename model",
    });
  }
};