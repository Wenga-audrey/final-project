import { verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

export const authenticate = async (
  req,
  res,
  next,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access token required" });
    }

    const token = authHeader.substring(7);

    // Log the token for debugging
    console.log("Received token:", token.substring(0, 20) + "..."); // Log only first 20 chars for security

    let decoded;
    try {
      decoded = verifyToken(token);
      console.log("Decoded token:", decoded);
    } catch (verifyError) {
      console.error("Token verification error:", verifyError.message);
      return res.status(401).json({ error: "Invalid or expired token - verification failed: " + verifyError.message });
    }

    // Check if required fields are present
    if (!decoded.userId) {
      console.error("Token missing userId:", decoded);
      return res.status(401).json({ error: "Invalid token - missing userId" });
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.error("User not found for userId:", decoded.userId);
      return res.status(401).json({ error: "Invalid token - user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(401).json({ error: "Invalid or expired token - " + error.message });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

export const requireAdmin = requireRole(["SUPER_ADMIN"]);
export const requireInstructor = requireRole(["TEACHER", "SUPER_ADMIN"]);