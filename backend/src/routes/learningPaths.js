import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// TODO: Implement learning paths routes
// This is a placeholder for learning paths functionality

export default router;