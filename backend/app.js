import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import modelRoutes from "./routes/modelRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//   })
// );

const allowedOrigins = [
  "http://localhost:5173",
  "https://3-d-model-viewer-murex.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/models", modelRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "3D Model Viewer API is running",
  });
});

export default app;