import "dotenv/config";

import app from "../app.js";
import connectDB from "../config/db.js";

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  await connectDB();

  isConnected = true;
};

export default async function handler(req, res) {
  try {
    await connectDatabase();

    return app(req, res);
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      message: "Database connection failed",
    });
  }
}