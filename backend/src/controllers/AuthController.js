import jwt from "jsonwebtoken";
import { z } from "zod";
import { BaseController } from "./BaseController.js";
import { UserModel } from "../models/UserModel.js";
import { generateToken } from "../lib/jwt.js";
import { sendLoginNotification } from "../utils/notifications.js";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum(["LEARNER", "TEACHER", "PREP_ADMIN", "SUPER_ADMIN"]).optional(),
  currentLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  examTargets: z.array(z.string()).optional(),
  learningGoals: z.string().optional(),
  availableHours: z.number().min(1).max(24).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export class AuthController extends BaseController {
  register = this.asyncHandler(async (req, res) => {
    try {
      const validatedData = this.validateRequest(registerSchema, req.body);

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(validatedData.email);
      if (existingUser) {
        return this.handleError(
          res,
          "User already exists with this email",
          409,
        );
      }

      // Create new user
      const user = await UserModel.create(validatedData);
      console.log("Created user:", user);

      // Generate JWT token with expected payload shape
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      console.log("Generating token with payload:", tokenPayload);
      const token = generateToken(tokenPayload);
      console.log("Generated token for registration:", token.substring(0, 20) + "...");

      return this.handleSuccess(
        res,
        {
          user,
          token,
        },
        "User registered successfully",
        201,
      );
    } catch (error) {
      return this.handleError(res, error.message);
    }
  });

  login = this.asyncHandler(async (req, res) => {
    try {
      const { email, password } = this.validateRequest(loginSchema, req.body);

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return this.handleError(res, "Invalid email or password", 401);
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(
        password,
        user.password,
      );
      if (!isValidPassword) {
        return this.handleError(res, "Invalid email or password", 401);
      }

      // Generate JWT token with expected payload shape
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      console.log("Generating token with payload:", tokenPayload);
      const token = generateToken(tokenPayload);
      console.log("Generated token for login:", token.substring(0, 20) + "...");

      // Send login notification (in the background, don't block the response)
      sendLoginNotification(user.id).catch(error => {
        console.error('Failed to send login notification:', error);
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return this.handleSuccess(
        res,
        {
          user: userWithoutPassword,
          token,
        },
        "Login successful",
      );
    } catch (error) {
      return this.handleError(res, error.message);
    }
  });

  getProfile = this.asyncHandler(async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return this.handleError(res, "User not found", 404);
      }

      return this.handleSuccess(res, { user });
    } catch (error) {
      return this.handleServerError(res, error);
    }
  });

  updateProfile = this.asyncHandler(async (req, res) => {
    try {
      const updateSchema = z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        phone: z.string().optional(),
        avatar: z.string().url().optional(),
        currentLevel: z
          .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
          .optional(),
        examTargets: z.array(z.string()).optional(),
        learningGoals: z.string().optional(),
        availableHours: z.number().min(1).max(24).optional(),
        preferredTimes: z.array(z.string()).optional(),
      });

      const validatedData = this.validateRequest(updateSchema, req.body);

      const updatedUser = await UserModel.update(req.user.id, validatedData);

      return this.handleSuccess(
        res,
        { user: updatedUser },
        "Profile updated successfully",
      );
    } catch (error) {
      return this.handleError(res, error.message);
    }
  });

  forgotPassword = this.asyncHandler(async (req, res) => {
    try {
      const { email } = this.validateRequest(forgotPasswordSchema, req.body);

      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return this.handleSuccess(
          res,
          null,
          "If the email exists, a reset link has been sent",
        );
      }

      // Generate a shorter reset token (instead of using full JWT)
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Save reset token to database
      await UserModel.setResetToken(email, resetToken);

      // Send email with reset link
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      // Import email service
      const { sendEmail } = await import("../lib/email.js");

      const emailSent = await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Mindboost Learning",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Mindboost Learning</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
              
              <p>Hello ${user.firstName},</p>
              
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div style="background: #e9ecef; padding: 10px; border-radius: 4px; word-break: break-all;">
                ${resetUrl}
              </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2024 Mindboost Learning Platform</p>
            </div>
          </div>
        `,
        text: `Password Reset Request

Hello ${user.firstName},

We received a request to reset your password. Visit this link to create a new password: ${resetUrl}

This link will expire in 1 hour. If you didn't request this, please ignore this email.`
      });

      return this.handleSuccess(
        res,
        null,
        emailSent
          ? "Password reset link sent to your email"
          : "Failed to send email, but token is generated. Contact support.",
      );
    } catch (error) {
      return this.handleError(res, error.message);
    }
  });

  resetPassword = this.asyncHandler(async (req, res) => {
    try {
      const { token, password } = this.validateRequest(
        resetPasswordSchema,
        req.body,
      );

      // Verify reset token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return this.handleError(res, "Invalid or expired reset token", 401);
      }

      // Find user by reset token
      const user = await UserModel.findByResetToken(token);
      if (!user || user.id !== decoded.id) {
        return this.handleError(res, "Invalid or expired reset token", 401);
      }

      // Update password and clear reset token
      await UserModel.updatePassword(user.id, password);
      await UserModel.clearResetToken(user.id);

      return this.handleSuccess(res, null, "Password reset successfully");
    } catch (error) {
      return this.handleError(res, error.message);
    }
  });

  verifyToken = this.asyncHandler(async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return this.handleError(res, "User not found", 404);
      }

      return this.handleSuccess(
        res,
        {
          user,
          valid: true,
        },
        "Token is valid",
      );
    } catch (error) {
      return this.handleServerError(res, error);
    }
  });

  logout = this.asyncHandler(async (req, res) => {
    // Since we're using stateless JWT, logout is handled on the client side
    // by removing the token from storage
    return this.handleSuccess(res, null, "Logged out successfully");
  });
}
