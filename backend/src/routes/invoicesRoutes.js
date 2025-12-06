import express from 'express';
import {
    getInvoices,
    getInvoiceDetails,
    createInvoiceFromOrder,
    markInvoiceSent,
    markInvoicePaid,
    deleteInvoice // Soft delete/archive
} from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/authentication.js'; 
import { requireRole } from '../middleware/requirerole.js'; 

const router = express.Router();

// Base path: /api/invoices

// --- General Access (Read) ---

// ALL: Get a list of all invoices (filterable by status, client, date)
router.get('/', authenticate, getInvoices);

// ALL: Get details for a single invoice (includes line items)
router.get('/:invoiceId', authenticate, getInvoiceDetails);


// --- Creation and Workflow (Write) ---

// CHECKER/OWNER: Creates an invoice based on a COMPLETED/APPROVED order.
// This is the core linkage between Orders and Invoices.
// Parameter: orderId from the Order table.
router.post(
    '/from-order/:orderId', 
    authenticate, 
    requireRole(['CHECKER', 'OWNER']), 
    createInvoiceFromOrder
);

// CHECKER/OWNER: Marks a DRAFT invoice as SENT.
router.post(
    '/:invoiceId/send', 
    authenticate, 
    requireRole(['CHECKER', 'OWNER']), 
    markInvoiceSent
);

// CHECKER/OWNER: Marks an invoice as PAID.
router.post(
    '/:invoiceId/pay', 
    authenticate, 
    requireRole(['CHECKER', 'OWNER']), 
    markInvoicePaid
);

// CHECKER/OWNER: Soft delete/archive an invoice (sets status to DELETED).
router.delete(
    '/:invoiceId', 
    authenticate, 
    requireRole(['CHECKER', 'OWNER']), 
    deleteInvoice
);


export default router;