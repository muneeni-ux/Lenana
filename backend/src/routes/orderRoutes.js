import express from 'express';
import { 
    // Existing Core Order Imports
    createOrder, 
    updateOrder,
    approveOrder, 
    rejectOrder,
    getOrder,
    getOrders,
    getWalkInSales,
    createWalkInSale, 
    completeProductionApproval,
    
    // NEW Delivery/Driver Imports
    assignDriver,
    getDriverAssignments,
    completeDelivery
} from '../controllers/orderController.js'; 

// Assuming you have these middleware functions
import { authenticate } from '../middleware/authentication.js'; 
import { requireRole } from '../middleware/requirerole.js'; 

const router = express.Router();

// =========================================================================
// --- Walk-in Sales (Immediate Transaction) ---
// =========================================================================

// Maker/Checker: Create a new walk-in sale. Deducts stock immediately and finalizes the order.
// Route: POST /api/orders/walk-in
router.post('/walk-in', authenticate, requireRole(['MAKER', 'CHECKER']), createWalkInSale);

// Checker: View finalized walk-in sales records
// Route: GET /api/orders/walk-in
router.get('/walk-in', authenticate, requireRole(['CHECKER']), getWalkInSales);


// =========================================================================
// --- General Client Orders / Maker ---
// =========================================================================

// Maker: Create a new standard client order (initial status: SUBMITTED)
// Route: POST /api/orders
router.post('/', authenticate, requireRole(['MAKER', 'CHECKER']), createOrder);

// All: Get a list of orders (can use query params for filtering)
// Route: GET /api/orders
router.get('/', authenticate, getOrders);


// All: Get a single order's details
// Route: GET /api/orders/:orderId
router.get('/:orderId', authenticate, getOrder);

router.patch('/:orderId', authenticate, requireRole(['MAKER', 'CHECKER', 'OWNER']), updateOrder);
// =========================================================================
// --- Checker / Approval Flow ---
// =========================================================================

// Checker: Approve the order (triggers stock reservation or production batch creation)
// Driver Assignment
// Route: PATCH /api/orders/:orderId/assign  <-- Changed to PATCH
router.patch('/:orderId/assign', authenticate, requireRole(['CHECKER', 'OWNER']), assignDriver);

// Checker: Approve the order
// Route: PATCH /api/orders/:orderId/approve  <-- Changed to PATCH
router.patch('/:orderId/approve', authenticate, requireRole(['CHECKER', 'OWNER']), approveOrder);

// Checker: Reject the order
// Route: PATCH /api/orders/:orderId/reject  <-- Changed to PATCH
router.patch('/:orderId/reject', authenticate, requireRole(['CHECKER', 'OWNER']), rejectOrder);


// =========================================================================
// --- Production Flow (Inventory Update) ---
// =========================================================================

// Checker/Owner: Approves the production batch after QC is done, adding stock to inventory
// Route: POST /api/orders/production/:batchId/approve
router.post('/production/:batchId/approve', authenticate, requireRole(['CHECKER', 'OWNER']), completeProductionApproval);


// =========================================================================
// --- Delivery / Driver Flow (NEW ROUTES) ---
// =========================================================================

// Driver: Fetches all orders assigned specifically to the authenticated driver.
// Route: GET /api/orders/deliveries/mine
router.get('/deliveries/mine', authenticate, requireRole(['DRIVER']), getDriverAssignments);

// Driver: Marks an assigned order as delivered and finalizes stock movement.
// Route: POST /api/orders/deliveries/:orderId/complete
router.post('/deliveries/:orderId/complete', authenticate, requireRole(['DRIVER']), completeDelivery);

export default router;