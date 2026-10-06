import { Router } from "express";
import authRoutes from "./authRoutes";
import { ApiResponse } from "../utils/ApiResponse";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.status(200).json(
    new ApiResponse("CrumbOS Core API is healthy", {
      status: "online",
      timestamp: new Date().toISOString(),
    })
  );
});

// Mount modules
router.use("/auth", authRoutes);

export default router;
