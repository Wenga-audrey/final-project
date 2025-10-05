import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { UserController } from "../controllers/UserController.js";

const router = Router();
const userController = new UserController();

// Get authenticated user's profile
router.get("/", authenticate, userController.getProfile);

// Update authenticated user's profile
router.put("/", authenticate, userController.updateProfile);

export default router;
