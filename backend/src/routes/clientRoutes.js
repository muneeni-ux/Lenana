import express from "express";
import { createClient, getClients, updateClient,deleteClient } from "../controllers/clientController.js";
import { authenticate } from "../middleware/authentication.js";
import { requireRole } from "../middleware/requirerole.js";

const router = express.Router();

router.get("/", authenticate, getClients);
router.post("/", authenticate, requireRole(["MAKER", "CHECKER", "OWNER"]), createClient);
router.put("/:id", authenticate, requireRole(["CHECKER", "OWNER"]), updateClient);
router.delete("/:id", authenticate, requireRole(["OWNER"]), deleteClient);

export default router;
