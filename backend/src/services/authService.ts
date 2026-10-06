import jwt from "jsonwebtoken";
import { User, IUser, UserRole } from "../models/User";
import { RegisterInput, LoginInput, UpdateProfileInput } from "../validators/authValidator";
import { ApiError } from "../utils/ApiError";
import { config } from "../config/env";

export class AuthService {
  private static generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      } as jwt.SignOptions
    );
  }

  static async register(data: RegisterInput): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, "An account with this email address already exists.");
    }

    // Role defaults to CUSTOMER if not provided or self-registering
    const userRole = data.role || UserRole.CUSTOMER;

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      phone: data.phone || "",
      role: userRole,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login(data: LoginInput): Promise<{ user: IUser; token: string }> {
    // Explicitly select password field as it is marked `select: false`
    const user = await User.findOne({ email: data.email.toLowerCase() }).select("+password");
    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated. Please contact support.");
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Remove password from user object before returning
    user.password = undefined;

    const token = this.generateToken(user);
    return { user, token };
  }

  static async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User profile not found.");
    }
    return user;
  }

  static async updateProfile(userId: string, data: UpdateProfileInput): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User profile not found.");
    }

    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;

    await user.save();
    return user;
  }
}
