import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/authValidator";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

router.post(
  "/logout",
  asyncHandler(AuthController.logout)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(AuthController.getMe)
);

router.put(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(AuthController.updateMe)
);

export default router;
