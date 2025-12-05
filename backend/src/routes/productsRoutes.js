import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

import { authenticate } from "../middleware/authentication.js";
import { requireRole } from "../middleware/requirerole.js";

const router = express.Router();

// All logged-in users can view products (role filtering applied in controller)
router.get("/", authenticate, getProducts);

// Owner + Maker can create
router.post("/", authenticate, requireRole("OWNER", "MAKER"), createProduct);

// Owner + Checker + Maker can update
router.put("/:id", authenticate, requireRole("OWNER", "CHECKER", "MAKER"), updateProduct);

// Only Owner deletes
router.delete("/:id", authenticate, requireRole("OWNER"), deleteProduct);

export default router;
