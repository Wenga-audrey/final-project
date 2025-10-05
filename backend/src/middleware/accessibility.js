// JS file: no type-only imports

// Example: Middleware to set accessibility headers for keyboard navigation
export function setAccessibilityHeaders(req, res, next) {
  res.setHeader("Access-Control-Allow-Headers", "TabIndex, ARIA-Role, ARIA-Label");
  next();
}