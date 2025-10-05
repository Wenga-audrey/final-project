// JS file: no type-only imports

export class BaseController {
  handleSuccess(
    res,
    data,
    message,
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  handleError(res, error, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      error,
    });
  }

  handleServerError(res, error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }

  validateRequest(schema, data) {
    try {
      return schema.parse(data);
    } catch (error) {
      throw new Error(error.errors?.[0]?.message || "Validation failed");
    }
  }

  asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  requireAuth = (
    req,
    res,
    next,
  ) => {
    if (!req.user) {
      return this.handleError(res, "Authentication required", 401);
    }
    next();
  };

  requireRole = (roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return this.handleError(res, "Insufficient permissions", 403);
      }
      next();
    };
  };
}
