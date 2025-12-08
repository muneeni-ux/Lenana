import { db } from "../db.js";
import { v4 as uuid } from "uuid";

// --- Helper Functions for Number Generation ---

/**
 * Generates the next sequential Order ID (e.g., ORD-0001).
 * Requires a connection for transactional safety.
 */
const generateOrderNumber = async (connection) => {
    try {
        // Query the last sequential ID using LIKE 'ORD-%' and ordering by createdAt
        const [rows] = await connection.query(
            "SELECT id FROM orders WHERE id LIKE 'ORD-%' ORDER BY createdAt DESC LIMIT 1"
        );
        let nextNumber = 1;
        if (rows.length > 0) {
            const lastId = rows[0].id;
            // Extract the number part from 'ORD-XXXX'
            const lastNum = lastId.match(/\d+$/);
            if (lastNum) nextNumber = parseInt(lastNum[0]) + 1;
        }
        // Format as ORD-0001 (using 4 digits for padding)
        return `ORD-${String(nextNumber).padStart(4, '0')}`;
    } catch (err) {
        console.error("❌ ERROR generateOrderNumber:", err);
        // Fallback to a safe, unique, but non-sequential ID on error
        return `ORD-ERR-${uuid().substring(0, 4)}`;
    }
};

// --- Helper Functions for Invoicing ---
const generateInvoiceNumber = async (connection) => {
    try {
        const [rows] = await connection.query(
            "SELECT invoiceNumber FROM invoices ORDER BY createdAt DESC LIMIT 1"
        );
        let nextNumber = 1;
        if (rows.length > 0) {
            const lastNum = rows[0].invoiceNumber.match(/\d+$/);
            if (lastNum) nextNumber = parseInt(lastNum[0]) + 1;
        }
        return `INV-${String(nextNumber).padStart(4, '0')}`;
    } catch (err) {
        console.error("❌ ERROR generateInvoiceNumber:", err);
        return `INV-ERR-${uuid().substring(0, 4)}`;
    }
};

const calculateDueDate = (dateString, days = 10) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const getConsolidatedInventory = async (conn, productId) => {
    // Locks the row for update to prevent race conditions during inventory checks/updates
    const [invRows] = await conn.query(
        `SELECT SUM(quantityAvailable) AS totalAvailable, SUM(quantityReserved) AS totalReserved, MAX(id) AS primaryInventoryId
          FROM inventory WHERE productId = ? FOR UPDATE`,
        [productId]
    );
    return invRows[0] || { totalAvailable: 0, totalReserved: 0, primaryInventoryId: null };
};

// =========================================================================
// --- CORE ORDER ROUTES ---
// =========================================================================

export const createOrder = async (req, res) => {
    const conn = await db.getConnection(); // Get connection for transaction
    try {
        await conn.beginTransaction();
        const userId = req.user.id;

        const {
            clientId,
            clientName,
            deliveryAddress,
            deliveryDate,
            placementType,
            specialInstructions,
            customBrandingRequirements,
            status,
            orderTotalKsh,
            totalProductionCostKsh,
            grossProfitKsh,
            grossMarginPercent,
            items
        } = req.body;

        // 1. Generate Sequential Order ID (ORD-0001...)
        const orderId = await generateOrderNumber(conn);
        const now = new Date();

        await conn.query(
            `INSERT INTO orders (
              id, clientId, clientName, orderDate, deliveryDate, deliveryAddress,
              placementType, status, specialInstructions, customBrandingRequirements,
              createdBy, orderTotalKsh, totalProductionCostKsh, grossProfitKsh,
              grossMarginPercent
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                orderId,
                clientId,
                clientName,
                now,                      // orderDate (DATETIME)
                deliveryDate,             // DATETIME
                deliveryAddress,
                placementType,
                status || "DRAFT", // Default to DRAFT
                specialInstructions,
                customBrandingRequirements,
                userId,
                orderTotalKsh,
                totalProductionCostKsh,
                grossProfitKsh,
                grossMarginPercent
            ]
        );

        // 2. Insert items
        const itemInsertValues = items.map(it => [
            uuid(),
            orderId,
            it.productId,
            it.productName || 'N/A', // Assuming productName is passed or default to 'N/A'
            it.quantity,
            it.unitPriceKsh,
            it.lineTotalKsh,
            it.productionCostPerUnitKsh,
            it.lineProductionCostKsh,
            it.lineGrossProfitKsh,
            it.lineMarginPercent
        ]);

        if (itemInsertValues.length > 0) {
            await conn.query(
                `INSERT INTO order_items (
                  id, orderId, productId, productName, quantity, unitPriceKsh,
                  lineTotalKsh, productionCostPerUnitKsh,
                  lineProductionCostKsh, lineGrossProfitKsh,
                  lineMarginPercent
                ) VALUES ?`, [itemInsertValues]
            );
        }
        
        await conn.commit();

        return res.json({ message: "Order created", orderId, status: status || "DRAFT" });
    } catch (err) {
        console.error("❌ createOrder:", err);
        await conn.rollback();
        return res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

// -------------------------------------------------------------------------
// --- NEW CORE ROUTE: updateOrder (Handles status changes like DRAFT -> SUBMITTED) ---
// -------------------------------------------------------------------------

/**
 * Updates an existing order, primarily used for changing status (e.g., DRAFT to SUBMITTED).
 * @route PATCH /api/orders/:orderId
 */
export const updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const { status, ...updates } = req.body;
    const userId = req.user.id;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const updateFields = [];
        const updateValues = [];

        // Add fields from the request body to the update list
        for (const key in updates) {
            if (updates[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        }

        // Handle Status Change separately for validation (e.g., DRAFT to SUBMITTED)
        if (status) {
            // Check current status before allowing change (optional but recommended)
            const [orderRows] = await conn.query(
                `SELECT status FROM orders WHERE id = ? FOR UPDATE`,
                [orderId]
            );

            if (orderRows.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Order not found." });
            }

            const currentStatus = orderRows[0].status;

            // Simple validation example: only allow submitting from DRAFT
            if (currentStatus === 'DRAFT' && status === 'SUBMITTED') {
                updateFields.push('status = ?');
                updateValues.push(status);
            } else if (currentStatus === 'DRAFT' && status !== 'SUBMITTED') {
                 // Allow other fields to be updated in DRAFT mode without changing status
                 // But prevent unsupported status changes
                 if (status) {
                     await conn.rollback();
                     return res.status(400).json({ error: `Cannot change status from ${currentStatus} directly to ${status}.` });
                 }
            } else if (status && status !== currentStatus) {
                // Prevent general status changes unless through specific approval routes (like /approve)
                 await conn.rollback();
                 return res.status(400).json({ error: `Order is already ${currentStatus}. Status changes must use specific endpoints.` });
            }
        }
        
        if (updateFields.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: "No valid fields provided for update." });
        }
        
        // Add updatedBy field and the orderId to the query parameters
        updateFields.push('updatedBy = ?');
        updateValues.push(userId);
        updateValues.push(orderId);

        const updateQuery = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;

        const [result] = await conn.query(updateQuery, updateValues);

        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Order not found or no changes were made." });
        }

        await conn.commit();
        res.json({ success: true, message: `Order ${orderId} updated. New status: ${status || 'UNCHANGED'}` });
        
    } catch (err) {
        console.error(`❌ ERROR updateOrder ${orderId}:`, err);
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

// -------------------------------------------------------------------------
// --- CORE ROUTE: createWalkInSale (Uses sequential ID via generateOrderNumber) ---
// -------------------------------------------------------------------------

export const createWalkInSale = async (req, res) => {
    const saleData = req.body;
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();
        
        // 1. Generate Sequential Order ID (ORD-0001...)
        const orderId = await generateOrderNumber(conn); 

        // 2. Fetch product details and calculate totals
        const productDetails = await Promise.all(saleData.items.map(async item => {
            const [prodRows] = await conn.query(
                `SELECT productName, unitCostKsh, totalCostPerUnitKsh FROM products WHERE id = ?`, 
                [item.productId]
            );
            if (prodRows.length === 0) throw new Error(`Product ${item.productId} not found.`);
            
            const prod = prodRows[0];
            
            const sellingPriceKsh = prod.unitCostKsh; 
            const productionCostPerUnitKsh = prod.totalCostPerUnitKsh || 0; 
            
            // Calculate Line Totals and Margins
            const lineTotalKsh = sellingPriceKsh * item.quantity;
            const lineProductionCostKsh = productionCostPerUnitKsh * item.quantity;
            const lineGrossProfitKsh = lineTotalKsh - lineProductionCostKsh;
            const lineMarginPercent = lineTotalKsh > 0 ? (lineGrossProfitKsh / lineTotalKsh) * 100 : 0;
            
            return { 
                ...item, 
                productName: prod.productName, 
                unitPriceKsh: sellingPriceKsh,  
                productionCostPerUnitKsh,
                lineTotalKsh, 
                lineProductionCostKsh, 
                lineGrossProfitKsh, 
                lineMarginPercent 
            };
        }));
        
        // Calculate Order Totals
        const orderTotalKsh = productDetails.reduce((sum, item) => sum + item.lineTotalKsh, 0);
        const totalProductionCostKsh = productDetails.reduce((sum, item) => sum + item.lineProductionCostKsh, 0);
        const grossProfitKsh = orderTotalKsh - totalProductionCostKsh;
        const grossMarginPercent = orderTotalKsh > 0 ? (grossProfitKsh / orderTotalKsh) * 100 : 0;

        // 3. Inventory Check and Deduction (for Walk-In Sale/DELIVERED status)
        for (const item of productDetails) {
            const inv = await getConsolidatedInventory(conn, item.productId);
            if (inv.totalAvailable < item.quantity) {
                await conn.rollback();
                return res.status(400).json({ error: `Insufficient stock for ${item.productName}. Available: ${inv.totalAvailable}, Required: ${item.quantity}` });
            }
            const [invRows] = await conn.query(`SELECT id FROM inventory WHERE productId = ? LIMIT 1 FOR UPDATE`, [item.productId]);
            const primaryInvId = invRows.length > 0 ? invRows[0].id : null;
            
            if (primaryInvId) {
                // Deduct from available stock immediately
                await conn.query(`UPDATE inventory SET quantityAvailable = quantityAvailable - ?, updatedBy = ? WHERE id = ?`,
                                 [item.quantity, req.user.id, primaryInvId]);
            } else {
                await conn.rollback();
                return res.status(404).json({ error: `Inventory record not found for product ${item.productName}.` });
            }
        }

        // 4. Insert Order Record (using sequential ID)
        await conn.query(
            `INSERT INTO orders 
             (id, clientId, clientName, orderDate, deliveryDate, deliveryAddress,
             placementType, status, createdBy, orderTotalKsh, totalProductionCostKsh, grossProfitKsh, grossMarginPercent)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [orderId, null, saleData.customerName, saleData.date || new Date().toISOString().split("T")[0],
             saleData.date || new Date().toISOString().split("T")[0], "Walk-in/Cash Sale", "WALK_IN",
             "DELIVERED", req.user.id, orderTotalKsh, totalProductionCostKsh, grossProfitKsh, grossMarginPercent]
        );

        // 5. Insert Order Items
        const itemInsertValues = productDetails.map(item => [
            uuid(), orderId, item.productId, item.productName, item.quantity, item.unitPriceKsh,
            item.lineTotalKsh, item.productionCostPerUnitKsh, item.lineProductionCostKsh,
            item.lineGrossProfitKsh, item.lineMarginPercent
        ]);
        if (itemInsertValues.length > 0) {
            await conn.query(
                `INSERT INTO order_items 
                  (id, orderId, productId, productName, quantity, unitPriceKsh, lineTotalKsh,
                  productionCostPerUnitKsh, lineProductionCostKsh, lineGrossProfitKsh, lineMarginPercent)
                  VALUES ?`, [itemInsertValues]
            );
        }

        // 6. Create Invoice Record 
        const invoiceId = uuid();
        const invoiceNumber = await generateInvoiceNumber(conn);
        const invoiceDate = new Date().toISOString().split('T')[0];
        const dueDate = calculateDueDate(invoiceDate);
        const createdBy = req.user.id;

        await conn.query(
            `INSERT INTO invoices 
             (id, invoiceNumber, orderId, clientId, clientName, invoiceDate, dueDate, invoiceTotalKsh, status, createdBy, updatedBy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PAID', ?, ?)`,
            [invoiceId, invoiceNumber, orderId, null, saleData.customerName, invoiceDate, dueDate, orderTotalKsh, createdBy, createdBy]
        );

        // 7. Insert Invoice Items
        const invoiceItemValues = productDetails.map(item => [
            uuid(), invoiceId, item.productId, item.productName, item.quantity, item.unitPriceKsh, item.lineTotalKsh
        ]);
        if (invoiceItemValues.length > 0) {
            await conn.query(
                `INSERT INTO invoice_items 
                  (id, invoiceId, productId, productName, quantity, unitPriceKsh, lineTotalKsh)
                  VALUES ?`, [invoiceItemValues]
            );
        }

        // 8. Final Commit
        await conn.query(`UPDATE orders SET invoiceId = ? WHERE id = ?`, [invoiceId, orderId]);
        await conn.commit();
        res.json({ success: true, orderId, invoiceId, status: "DELIVERED" });
    } catch (err) {
        console.error("❌ ERROR createWalkInSale: Transaction failed. Rolling back.", err);
        await conn.rollback();
        if (err.message.includes('Insufficient stock')) return res.status(400).json({ error: err.message });
        res.status(500).json({ error: "Failed to record walk-in sale." });
    } finally {
        conn.release();
    }
};

// ... (approveOrder, rejectOrder, completeProductionApproval, getOrders, getOrder, getWalkInSales, assignDriver, getDriverAssignments, completeDelivery, getDrivers remain unchanged)
// [The rest of the unchanged functions would follow here for brevity]
// ...
export const approveOrder = async (req, res) => {
    // ... (Approval logic remains unchanged)
    const { orderId } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [orderRows] = await conn.query(`SELECT * FROM orders WHERE id = ? FOR UPDATE`, [orderId]);
        if (orderRows.length === 0) { await conn.rollback(); return res.status(404).json({ error: "Order not found" }); }
        const order = orderRows[0];
        const [items] = await conn.query(`SELECT * FROM order_items WHERE orderId = ?`, [orderId]);

        let productionRequired = false, batchIds = [], insufficientStockItems = [];
        for (const item of items) {
            const inv = await getConsolidatedInventory(conn, item.productId);
            const available = inv.totalAvailable, required = item.quantity;
            if (available < required) {
                productionRequired = true;
                const deficit = required - available;
                const batchId = uuid();
                await conn.query(
                    `INSERT INTO production_batches (id, orderId, productId, requiredQty, availableStockUsed, productionQuantity, status)
                     VALUES (?,?,?,?,?,?,?)`,
                    [batchId, orderId, item.productId, required, available, deficit, 'PENDING_PRODUCTION']
                );
                batchIds.push(batchId);
                insufficientStockItems.push({ productId: item.productId, deficit });
            }
        }

        if (productionRequired) {
            await conn.query(`UPDATE orders SET status = 'PRODUCTION_REQUIRED', approvedBy = ?, approvalDate = NOW() WHERE id = ?`, [req.user.id, orderId]);
            await conn.commit();
            return res.json({ success: true, message: "Order requires production. Production batches created.", status: 'PRODUCTION_REQUIRED', batches: batchIds, deficits: insufficientStockItems });
        }

        // If no production is required, reserve stock
        for (const item of items) {
            const [invRows] = await conn.query(`SELECT id FROM inventory WHERE productId = ? LIMIT 1 FOR UPDATE`, [item.productId]);
            const primaryInvId = invRows.length > 0 ? invRows[0].id : null;
            if (primaryInvId) {
                // Move from AVAILABLE to RESERVED
                await conn.query(`UPDATE inventory SET quantityAvailable = quantityAvailable - ?, quantityReserved = quantityReserved + ?, updatedBy = ? WHERE id = ?`,
                                 [item.quantity, item.quantity, req.user.id, primaryInvId]);
            }
        }

        const invoiceId = uuid();
        const invoiceNumber = await generateInvoiceNumber(conn); 
        const invoiceDate = new Date().toISOString().split('T')[0];
        const dueDate = calculateDueDate(invoiceDate);
        const createdBy = req.user.id;

        await conn.query(
            `INSERT INTO invoices (id, invoiceNumber, orderId, clientId, clientName, invoiceDate, dueDate, invoiceTotalKsh, status, createdBy, updatedBy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SENT', ?, ?)`,
            [invoiceId, invoiceNumber, orderId, order.clientId, order.clientName, invoiceDate, dueDate, order.orderTotalKsh, createdBy, createdBy]
        );

        const invoiceItemRows = await conn.query(`SELECT productId, productName, quantity, unitPriceKsh, lineTotalKsh FROM order_items WHERE orderId = ?`, [orderId]);
        const invoiceItemValues = invoiceItemRows[0].map(item => [uuid(), invoiceId, item.productId, item.productName, item.quantity, item.unitPriceKsh, item.lineTotalKsh]);
        
        if (invoiceItemValues.length > 0) {
            await conn.query(`INSERT INTO invoice_items (id, invoiceId, productId, productName, quantity, unitPriceKsh, lineTotalKsh) VALUES ?`, [invoiceItemValues]);
        }
        await conn.query(`UPDATE orders SET status = 'APPROVED', invoiceId = ?, approvedBy = ?, approvalDate = NOW() WHERE id = ?`, [invoiceId, req.user.id, orderId]);
        await conn.commit();
        res.json({ success: true, message: "Order approved, stock reserved, and invoice created.", status: 'APPROVED', invoiceId, invoiceNumber });
    } catch (err) {
        console.error("❌ ERROR approveOrder: Transaction failed. Rolling back.", err);
        await conn.rollback();
        res.status(500).json({ error: "Order approval failed due to a system error." });
    } finally {
        conn.release();
    }
};

export const rejectOrder = async (req, res) => {
    const { orderId } = req.params;
    const { rejectionReason } = req.body;
    // NOTE: It is a good idea to check for rejectionReason, especially since it's a PATCH.
    if (!rejectionReason) {
        return res.status(400).json({ error: "A rejection reason is required to reject the order." });
    }
    
    try {
        const [result] = await db.query(`
            UPDATE orders 
            SET status = 'REJECTED', 
                rejectionReason = ?, 
                approvedBy = ?, 
                approvalDate = NOW(),
                updatedBy = ?
            WHERE id = ? AND status != 'REJECTED'
        `,
        // NOTE: Added updatedBy field and condition to prevent double rejection
        [rejectionReason, req.user.id, req.user.id, orderId]); 
        
        if (result.affectedRows === 0) return res.status(404).json({ error: "Order not found or is already rejected." });
        
        res.json({ success: true, message: "Order rejected.", status: 'REJECTED' });
    } catch (err) {
        console.error("❌ ERROR rejectOrder:", err);
        res.status(500).json({ error: "Failed to reject order" });
    }
};

export const completeProductionApproval = async (req, res) => {
    // ... (Production approval logic remains unchanged)
    const { batchId } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [batchRows] = await conn.query(`SELECT * FROM production_batches WHERE id = ? FOR UPDATE`, [batchId]);
        if (batchRows.length === 0) { await conn.rollback(); return res.status(404).json({ error: "Production batch not found" }); }
        const batch = batchRows[0];
        const producedQty = batch.productionQuantity;
        if (batch.status !== 'PENDING_QC') { await conn.rollback(); return res.status(400).json({ error: "Batch must be marked as PENDING_QC before approval." }); }

        const [invRows] = await conn.query(`SELECT id FROM inventory WHERE productId = ? LIMIT 1 FOR UPDATE`, [batch.productId]);
        const primaryInvId = invRows.length > 0 ? invRows[0].id : null;
        if (!primaryInvId) { await conn.rollback(); return res.status(404).json({ error: "Inventory record for product not found." }); }

        await conn.query(`UPDATE inventory SET quantityAvailable = quantityAvailable + ?, updatedBy = ? WHERE id = ?`, [producedQty, req.user.id, primaryInvId]);
        await conn.query(`UPDATE production_batches SET status = 'COMPLETED', completedBy = ?, completionDate = NOW() WHERE id = ?`, [req.user.id, batchId]);

        if (batch.orderId) {
            const [pendingBatches] = await conn.query(`SELECT COUNT(*) as count FROM production_batches WHERE orderId = ? AND status != 'COMPLETED'`, [batch.orderId]);
            if (pendingBatches[0].count === 0) {
                // All production complete, set order status to ready for delivery assignment
                await conn.query(`UPDATE orders SET status = 'READY_FOR_DELIVERY' WHERE id = ?`, [batch.orderId]);
            }
        }

        await conn.commit();
        res.json({ success: true, message: "Production approved. Inventory updated." });
    } catch (err) {
        console.error("❌ ERROR completeProductionApproval: Transaction failed. Rolling back.", err);
        await conn.rollback();
        res.status(500).json({ error: "Production approval failed." });
    } finally {
        conn.release();
    }
};

// ... (getOrders, getOrder, getWalkInSales)
// Assuming 'db' is your MySQL connection pool or similar database utility
// and 'query' returns [rows, fields]

/**
 * Fetches all orders (up to 100) and includes their associated items.
 */
export const getOrders = async (req, res) => {
    try {
        // 1. Fetch the main list of orders
        const [orders] = await db.query(`SELECT * FROM orders ORDER BY createdAt DESC LIMIT 100`);

        // If no orders are found, return early
        if (orders.length === 0) {
            return res.json([]);
        }

        // 2. Map over the orders and fetch items for each one concurrently
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                // Fetch all items associated with the current order ID
                const [items] = await db.query(`SELECT * FROM order_items WHERE orderId = ?`, [order.id]);
                
                // Return the order object with the 'items' array attached
                return {
                    ...order,
                    items: items, // <-- Attaches the item data
                };
            })
        );

        // 3. Send the complete list back to the frontend
        res.json(ordersWithItems);
    } catch (err) {
        console.error("❌ ERROR getOrders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

/**
 * Fetches a single order by ID and includes its associated items.
 * (This function was already mostly correct and only needed minor refinement)
 */
export const getOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const [orderRows] = await db.query(`SELECT * FROM orders WHERE id = ?`, [orderId]);
        
        if (orderRows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        // Fetch all items associated with the order ID
        const [itemRows] = await db.query(`SELECT * FROM order_items WHERE orderId = ?`, [orderId]);
        
        // Combine order data with the fetched items
        res.json({ 
            ...orderRows[0], 
            items: itemRows // <-- Attaches the item data
        });
    } catch (err) {
        console.error("❌ ERROR getOrder:", err);
        res.status(500).json({ error: "Failed to fetch order" });
    }
};

export const getWalkInSales = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM orders WHERE placementType = 'WALK_IN' AND status = 'DELIVERED' ORDER BY orderDate DESC`);
        res.json(rows);
    } catch (err) {
        console.error("❌ ERROR getWalkInSales:", err);
        res.status(500).json({ error: "Failed to fetch walk-in sales" });
    }
};

// =========================================================================
// --- DELIVERY / DRIVER ROUTES (CHECKER / DRIVER INTERFACE) ---
// =========================================================================

/**
 * Checker: Assigns a driver to an order that is APPROVED or READY_FOR_DELIVERY.
 * @route POST /api/orders/:orderId/assign
 */
export const assignDriver = async (req, res) => {
    const { orderId } = req.params;
    const { driverId, expectedDeliveryDate } = req.body;
    const conn = await db.getConnection();

    if (!driverId || !expectedDeliveryDate) {
        return res.status(400).json({ error: "Driver ID and Expected Delivery Date are required." });
    }

    try {
        await conn.beginTransaction();

        // 1. Validate driver exists
        const [driverRows] = await conn.query(
            `SELECT id, CONCAT(firstName, ' ', lastName) AS name 
             FROM users 
             WHERE id = ? AND role = 'DRIVER' AND isActive = 1`, 
            [driverId]
        );
        
        if (driverRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Active Driver not found with the specified ID." });
        }
        const driver = driverRows[0];
        
        // 2. Define allowed statuses for assignment
        const allowedStatuses = ['APPROVED', 'READY_FOR_DELIVERY'];
        
        // 3. Update the order status, assignedDriverId, and delivery date
        const updateQuery = `
            UPDATE orders
            SET status = 'OUT_FOR_DELIVERY', 
                assignedDriverId = ?, 
                deliveryDate = ?,
                updatedBy = ?
            WHERE id = ? AND status IN (?)
        `;
        // NOTE: Changed status from 'ASSIGNED' to 'OUT_FOR_DELIVERY' as assignment usually means delivery is imminent.
        // If ASSIGNED is required, change it back, but OUT_FOR_DELIVERY is more common here.

        const [result] = await conn.query(updateQuery, [
            driverId,
            expectedDeliveryDate,
            req.user.id, // User performing the assignment (Checker/Owner)
            orderId,
            allowedStatuses
        ]);

        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(400).json({ error: "Order not found or not ready for assignment (must be APPROVED or READY_FOR_DELIVERY)." });
        }

        await conn.commit();
        res.json({
            success: true,
            message: `Order ${orderId} successfully assigned to ${driver.name}.`,
            status: 'OUT_FOR_DELIVERY',
            assignedDriver: driver
        });

    } catch (err) {
        console.error("❌ ERROR assignDriver: Transaction failed. Rolling back.", err);
        await conn.rollback();
        res.status(500).json({ error: "Failed to assign driver due to a system error." });
    } finally {
        conn.release();
    }
}

// -------------------------------------------------------------------------

/**
 * Driver: Fetches all orders assigned specifically to the authenticated driver.
 * @route GET /api/orders/deliveries/mine
 */
export const getDriverAssignments = async (req, res) => {
    const driverId = req.user.id; // ID of the logged-in driver

    try {
        // Fetch orders assigned to this driver that are not yet DELIVERED or REJECTED
        const [orders] = await db.query(
            `SELECT 
                o.id, o.clientName, o.deliveryAddress, o.deliveryDate, o.status, o.specialInstructions as note,
                oi.productName, oi.quantity AS qty
            FROM orders o
            JOIN order_items oi ON o.id = oi.orderId
            WHERE o.assignedDriverId = ? AND o.status IN ('ASSIGNED', 'DISPATCHED', 'READY_FOR_DELIVERY')
            ORDER BY o.deliveryDate ASC, o.clientName ASC`,
            [driverId]
        );

        // Group the flat results by order ID to match the required frontend format
        const groupedOrders = orders.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    client: row.clientName,
                    address: row.deliveryAddress,
                    // Format date for frontend display
                    deliveryDate: row.deliveryDate ? new Date(row.deliveryDate).toISOString().split('T')[0] : null,
                    status: row.status,
                    note: row.note,
                    items: [],
                };
            }
            // Push individual items into the order's items array
            acc[row.id].items.push({ product: row.productName, qty: row.qty });
            return acc;
        }, {});

        res.json(Object.values(groupedOrders));
    } catch (err) {
        console.error("❌ ERROR getDriverAssignments:", err);
        res.status(500).json({ error: "Failed to fetch driver assignments." });
    }
};

// -------------------------------------------------------------------------

/**
 * Driver: Marks an order as delivered and finalizes stock movement.
 * @route POST /api/orders/deliveries/:orderId/complete
 */
export const completeDelivery = async (req, res) => {
    const { orderId } = req.params;
    const driverId = req.user.id; // Authenticated driver

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Verify order exists, is assigned to this driver, and is not already delivered
        const [orderRows] = await conn.query(
            `SELECT status FROM orders WHERE id = ? AND assignedDriverId = ? FOR UPDATE`, 
            [orderId, driverId]
        );
        
        if (orderRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: "Order not found or not assigned to you." });
        }
        
        const currentStatus = orderRows[0].status;
        if (currentStatus === 'DELIVERED') {
            await conn.rollback();
            return res.status(400).json({ error: "Order is already marked as delivered." });
        }
        
        // 2. Release reserved stock
        const [items] = await conn.query(`SELECT productId, quantity FROM order_items WHERE orderId = ?`, [orderId]);
        
        for (const item of items) {
            const [invRows] = await conn.query(`SELECT id FROM inventory WHERE productId = ? LIMIT 1 FOR UPDATE`, [item.productId]);
            const primaryInvId = invRows.length > 0 ? invRows[0].id : null;

            if (primaryInvId) {
                // Reduce the reserved quantity
                await conn.query(
                    `UPDATE inventory 
                     SET quantityReserved = GREATEST(0, quantityReserved - ?), 
                         updatedBy = ? 
                     WHERE id = ?`,
                    [item.quantity, driverId, primaryInvId]
                );
            } else {
                 console.warn(`Inventory record missing for product ${item.productId} in order ${orderId}`);
            }
        }
        // 3. Update Order Status
        const deliveredOn = new Date().toISOString().split('T')[0];
        await conn.query(
            `UPDATE orders 
             SET status = 'DELIVERED', 
                 deliveredOn = ?, 
                 updatedBy = ? 
             WHERE id = ?`, 
             [deliveredOn, driverId, orderId]
        );
        
        await conn.commit();
        
        // --------------------------------------------------------------------
        // ⭐ NEW WEBSOCKET INTEGRATION ⭐
        // --------------------------------------------------------------------
        // Use req.io to emit a real-time event to all connected clients
        req.io.emit('order:delivered', {
            orderId: orderId,
            status: 'DELIVERED',
            deliveredBy: driverId,
            deliveredOn: deliveredOn,
            message: `Order ${orderId} delivered by driver ${driverId}`
        });
        // --------------------------------------------------------------------

        res.json({ success: true, orderId, status: 'DELIVERED', deliveredOn });

    } catch (err) {
        console.error("❌ ERROR completeDelivery: Transaction failed. Rolling back.", err);
        await conn.rollback();
        res.status(500).json({ error: "Failed to complete delivery due to a system error." });
    } finally {
        conn.release();
    }
};
