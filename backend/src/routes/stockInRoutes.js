import express from "express";
import {
  createStockIn,
  getStockIn,
  approveStock,
  rejectStock,
  getMakerStock
} from "../controllers/stockInController.js";

import { authenticate } from "../middleware/authentication.js";
import { requireRole } from "../middleware/requirerole.js";

const router = express.Router();

// Maker submits
router.post(
  "/",
  authenticate,
  requireRole(["MAKER"]),
  createStockIn
);

// Everyone can view (but you may restrict)
router.get(
  "/",
  authenticate,
  getStockIn
);

// routes/stockInRoutes.js
router.get(
  "/mine",
  authenticate,             // ✅ ensures req.user exists
  requireRole(["MAKER"]),   // optional: only makers can fetch their own stock
  getMakerStock
);



// Checker approves
router.put(
  "/approve/:id",
  authenticate,
  requireRole(["CHECKER", "OWNER"]),
  approveStock
);

// Checker rejects
router.put(
  "/reject/:id",
  authenticate,
  requireRole(["CHECKER", "OWNER"]),
  rejectStock
);

export default router;
