export function requireRole(roles = []) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.length) return next();
    if (!roles.includes(user.role))
      return res.status(403).json({ error: "Forbidden" });

    next();
  };
}
