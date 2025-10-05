import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

export const errorHandler = (
  error,
  req,
  res,
  next,
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        statusCode = 409;
        message = "Resource already exists";
        break;
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid reference";
        break;
      default:
        statusCode = 400;
        message = "Database error";
    }
  }

  // Validation errors
  if (error.name === "ValidationError") {
    statusCode = 400;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  console.error(`Error ${statusCode}: ${message}`, error);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};