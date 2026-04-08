// middlewares/roles.js
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role.toUpperCase())) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
