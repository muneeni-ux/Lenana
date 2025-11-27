import express from "express";
import jwt from "jsonwebtoken";
import {
  signupOwner,
  loginUser,
  createUser,
} from "../controllers/authController.js";
import { requireRole } from "../middleware/requirerole.js";
import { authenticate } from "../middleware/authentication.js";

const router = express.Router();

// Middleware to decode token on every request
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

// Owner signup (first-time only)
router.post("/owner/signup", signupOwner);

// Login
router.post("/login", loginUser);

// Owner creates users
router.post("/create-user", authenticate, requireRole(["OWNER"]), createUser);

export default router;
