import { BaseController } from "./BaseController.js";
import { UserModel } from "../models/UserModel.js";

export class UserController extends BaseController {
    // Get user profile
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

    // Update user profile
    updateProfile = this.asyncHandler(async (req, res) => {
        try {
            const updateSchema = {
                firstName: (value) => {
                    if (value !== undefined && (typeof value !== 'string' || value.length < 1)) {
                        throw new Error('First name must be a non-empty string');
                    }
                    return value;
                },
                lastName: (value) => {
                    if (value !== undefined && (typeof value !== 'string' || value.length < 1)) {
                        throw new Error('Last name must be a non-empty string');
                    }
                    return value;
                },
                phone: (value) => {
                    if (value !== undefined && typeof value !== 'string') {
                        throw new Error('Phone must be a string');
                    }
                    return value;
                },
                avatar: (value) => {
                    if (value !== undefined && typeof value !== 'string') {
                        throw new Error('Avatar must be a string');
                    }
                    return value;
                }
            };

            // Validate request data
            const validatedData = {};
            for (const [key, validator] of Object.entries(updateSchema)) {
                if (req.body[key] !== undefined) {
                    validatedData[key] = validator(req.body[key]);
                }
            }

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
}