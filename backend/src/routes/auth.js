import express from "express";
import jwt from "jsonwebtoken";
import {
  signupOwner,
  loginUser,
  createUser,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";

import { requireRole } from "../middleware/requireRole.js";
import { authenticate } from "../middleware/authentication.js";

const router = express.Router();

// decode JWT
router.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
});

router.post("/owner/signup", signupOwner);
router.post("/login", loginUser);

// profile update
router.put("/update-profile", authenticate, updateProfile);

// change password
router.put("/change-password", authenticate, changePassword);

// owner create user
router.post("/create-user", authenticate, requireRole(["OWNER"]), createUser);

// owner get all users
router.get("/users", authenticate, requireRole(["OWNER"]), getAllUsers);

// owner delete user
router.delete("/delete-user/:id", authenticate, requireRole(["OWNER"]), deleteUser);

export default router;
