import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { ApiResponse } from "../utils/ApiResponse";
import { config } from "../config/env";
import { ApiError } from "../utils/ApiError";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: config.nodeEnv === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static register = async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await AuthService.register(req.body);

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json(
      new ApiResponse("Registration successful", {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      })
    );
  };

  static login = async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await AuthService.login(req.body);

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(200).json(
      new ApiResponse("Login successful", {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      })
    );
  };

  static logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.status(200).json(new ApiResponse("Logged out successfully"));
  };

  static getMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    res.status(200).json(
      new ApiResponse("User profile retrieved successfully", {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          phone: req.user.phone,
          createdAt: req.user.createdAt,
        },
      })
    );
  };

  static updateMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const updatedUser = await AuthService.updateProfile(
      req.user._id.toString(),
      req.body
    );

    res.status(200).json(
      new ApiResponse("Profile updated successfully", {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
        },
      })
    );
  };
}
