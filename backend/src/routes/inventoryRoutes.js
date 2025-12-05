import express from "express";
import {
  listInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  moveStock,
  getStockMovements,
  createAudit,
} from "../controllers/inventoryController.js";
import { authenticate } from "../middleware/authentication.js";
import { requireRole } from "../middleware/requirerole.js";

const router = express.Router();



// list (all active by default; OWNER/CHECKER see all)
router.get("/", authenticate, listInventory);

// create (maker/owner can create)
router.post("/", authenticate, requireRole(["MAKER","OWNER"]), createInventory);

// update (maker/checker/owner)
router.put("/:id", authenticate, requireRole(["MAKER","CHECKER","OWNER"]), updateInventory);

// soft-delete (owner only OR checker can mark inactive - adjust if needed)
router.delete("/:id", authenticate, requireRole(["OWNER"]), deleteInventory);

// move stock (maker/checker/owner allowed)
router.post("/:id/move", authenticate, requireRole(["MAKER","CHECKER","OWNER"]), moveStock);

// movements
router.get("/movements", authenticate, requireRole(["MAKER","CHECKER","OWNER"]), getStockMovements);

// audit
router.post("/audit", authenticate, requireRole(["MAKER","CHECKER","OWNER"]), createAudit);

export default router;
