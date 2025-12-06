import express from 'express';
import {
    createBatch,
    getBatches,
    getBatchDetails,
    startProduction,
    completeProduction,
    qcApproveBatch, // Handles QC recording and final approval
    rejectBatch,
} from '../controllers/productionController.js';
import { authenticate } from '../middleware/authentication.js'; 
import { requireRole } from '../middleware/requirerole.js'; 

const router = express.Router();

// Base path: /api/production

// --- General Access (Read) ---

// All: Get a list of production batches (with query filters/sorting from frontend)
router.get('/', authenticate, getBatches);

// All: Get a single batch's details
router.get('/:batchId', authenticate, getBatchDetails);

// --- Maker Flow (Creation & Execution) ---

// Maker/Checker: Create a new production batch (Status: PENDING)
// Body: { productId: string, quantityPlanned: number }
router.post('/', authenticate, requireRole(['MAKER', 'CHECKER']), createBatch);

// Maker: Start the production process (Status: PENDING -> IN_PROGRESS)
router.post('/:batchId/start', authenticate, requireRole(['MAKER']), startProduction);

// Maker: Mark production as complete (Status: IN_PROGRESS -> COMPLETED)
// Body: { quantityCompleted: number }
router.post('/:batchId/complete', authenticate, requireRole(['MAKER']), completeProduction);


// --- Checker/Owner Flow (QC & Finalization) ---

// Checker/Owner: QC Approve the batch (Status: COMPLETED -> APPROVED)
// This is the critical step that records defective/passed quantity and **updates inventory**.
// Body: { defectiveQty: number, passedQty: number, qcNotes: string }
router.post('/:batchId/qc-approve', authenticate, requireRole(['CHECKER', 'OWNER']), qcApproveBatch);

// Checker/Owner: Reject the batch (Status: PENDING/COMPLETED -> REJECTED)
// Body: { rejectionReason: string }
router.post('/:batchId/reject', authenticate, requireRole(['CHECKER', 'OWNER']), rejectBatch);


export default router;