import { db } from "../db.js";
import { v4 as uuid } from "uuid";

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
    const orderId = uuid();
    const { items, ...orderData } = req.body;
    try {
        await db.query(
            `INSERT INTO orders 
             (id, clientId, clientName, orderDate, deliveryDate, deliveryAddress,
              placementType, status, specialInstructions, customBrandingRequirements,
              createdBy, orderTotalKsh, totalProductionCostKsh, grossProfitKsh, grossMarginPercent)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                orderId, orderData.clientId, orderData.clientName, orderData.orderDate || new Date(),
                orderData.deliveryDate, orderData.deliveryAddress, orderData.placementType || "MANUAL_ENTRY",
                "SUBMITTED", orderData.specialInstructions, orderData.customBrandingRequirements,
                req.user.id, orderData.orderTotalKsh, orderData.totalProductionCostKsh,
                orderData.grossProfitKsh, orderData.grossMarginPercent,
            ]
        );
        for (const item of items) {
            await db.query(
                `INSERT INTO order_items 
                 (id, orderId, productId, productName, quantity, unitPriceKsh, lineTotalKsh,
                  productionCostPerUnitKsh, lineProductionCostKsh, lineGrossProfitKsh, lineMarginPercent)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    uuid(), orderId, item.productId, item.productName, item.quantity, item.unitPriceKsh,
                    item.lineTotalKsh, item.productionCostPerUnitKsh, item.lineProductionCostKsh,
                    item.lineGrossProfitKsh, item.lineMarginPercent
                ]
            );
        }
        res.json({ success: true, orderId, status: "SUBMITTED" });
    } catch (err) {
        console.error("❌ ERROR createOrder:", err);
        res.status(500).json({ error: "Failed to create order" });
    }
};

export const createWalkInSale = async (req, res) => {
    // ... (Walk-in sale logic remains unchanged: stock deduction, order creation, invoice, status DELIVERED)
    const saleData = req.body;
    const orderId = uuid();
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const productDetails = await Promise.all(saleData.items.map(async item => {
            const [prodRows] = await conn.query(
                `SELECT name, unitPriceKsh, productionCostPerUnitKsh FROM products WHERE id = ?`, 
                [item.productId]
            );
            if (prodRows.length === 0) throw new Error(`Product ${item.productId} not found.`);
            const prod = prodRows[0];
            const lineTotalKsh = prod.unitPriceKsh * item.quantity;
            const productionCostPerUnitKsh = prod.productionCostPerUnitKsh || 0;
            const lineProductionCostKsh = productionCostPerUnitKsh * item.quantity;
            const lineGrossProfitKsh = lineTotalKsh - lineProductionCostKsh;
            const lineMarginPercent = lineTotalKsh > 0 ? (lineGrossProfitKsh / lineTotalKsh) * 100 : 0;
            return { ...item, productName: prod.name, unitPriceKsh: prod.unitPriceKsh, productionCostPerUnitKsh,
                          lineTotalKsh, lineProductionCostKsh, lineGrossProfitKsh, lineMarginPercent };
        }));
        const orderTotalKsh = productDetails.reduce((sum, item) => sum + item.lineTotalKsh, 0);
        const totalProductionCostKsh = productDetails.reduce((sum, item) => sum + item.lineProductionCostKsh, 0);
        const grossProfitKsh = orderTotalKsh - totalProductionCostKsh;
        const grossMarginPercent = orderTotalKsh > 0 ? (grossProfitKsh / orderTotalKsh) * 100 : 0;

        for (const item of productDetails) {
            const inv = await getConsolidatedInventory(conn, item.productId);
            if (inv.totalAvailable < item.quantity) {
                await conn.rollback();
                return res.status(400).json({ error: `Insufficient stock for ${item.productName}. Available: ${inv.totalAvailable}, Required: ${item.quantity}` });
            }
            const [invRows] = await conn.query(`SELECT id FROM inventory WHERE productId = ? LIMIT 1 FOR UPDATE`, [item.productId]);
            const primaryInvId = invRows.length > 0 ? invRows[0].id : null;
            if (primaryInvId) {
                await conn.query(`UPDATE inventory SET quantityAvailable = quantityAvailable - ?, updatedBy = ? WHERE id = ?`,
                                 [item.quantity, req.user.id, primaryInvId]);
            } else {
                await conn.rollback();
                return res.status(404).json({ error: `Inventory record not found for product ${item.productName}.` });
            }
        }

        await conn.query(
            `INSERT INTO orders 
             (id, clientId, clientName, orderDate, deliveryDate, deliveryAddress,
              placementType, status, createdBy, orderTotalKsh, totalProductionCostKsh, grossProfitKsh, grossMarginPercent)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [orderId, null, saleData.customerName, saleData.date || new Date().toISOString().split("T")[0],
             saleData.date || new Date().toISOString().split("T")[0], "Walk-in/Cash Sale", "WALK_IN",
             "DELIVERED", req.user.id, orderTotalKsh, totalProductionCostKsh, grossProfitKsh, grossMarginPercent]
        );

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

// ... (approveOrder, rejectOrder, completeProductionApproval, getOrders, getOrder, getWalkInSales remain unchanged)
export const approveOrder = async (req, res) => {
    // ... (Approval logic remains unchanged: Reserves stock or creates production batch, sets status to APPROVED or PRODUCTION_REQUIRED)
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

        const invoiceItemValues = items.map(item => [uuid(), invoiceId, item.productId, item.productName, item.quantity, item.unitPriceKsh, item.lineTotalKsh]);
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
    // ... (Rejection logic remains unchanged)
    const { orderId } = req.params;
    const { rejectionReason } = req.body;
    try {
        const [result] = await db.query(`UPDATE orders SET status = 'REJECTED', rejectionReason = ?, approvedBy = ?, approvalDate = NOW() WHERE id = ?`,
                                         [rejectionReason, req.user.id, orderId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Order not found" });
        res.json({ success: true, message: "Order rejected.", status: 'REJECTED' });
    } catch (err) {
        console.error("❌ ERROR rejectOrder:", err);
        res.status(500).json({ error: "Failed to reject order" });
    }
};

export const completeProductionApproval = async (req, res) => {
    // ... (Production approval logic remains unchanged: Adds stock to AVAILABLE, updates batch status, updates order status to READY_FOR_DELIVERY if all batches complete)
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

// ... (getOrders, getOrder, getWalkInSales remain unchanged)
export const getOrders = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM orders ORDER BY createdAt DESC LIMIT 100`);
        res.json(rows);
    } catch (err) {
        console.error("❌ ERROR getOrders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

export const getOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const [orderRows] = await db.query(`SELECT * FROM orders WHERE id = ?`, [orderId]);
        if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });
        const [itemRows] = await db.query(`SELECT * FROM order_items WHERE orderId = ?`, [orderId]);
        res.json({ ...orderRows[0], items: itemRows });
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
 * Transitions order status to 'ASSIGNED' and sets the expected delivery date.
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

        // 1. Validate driver exists in the 'users' table and has the 'DRIVER' role
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
            SET status = 'ASSIGNED', 
                assignedDriverId = ?, 
                deliveryDate = ?,
                updatedBy = ?
            WHERE id = ? AND status IN (?)
        `;

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
            status: 'ASSIGNED',
            assignedDriver: driver
        });

    } catch (err) {
        console.error("❌ ERROR assignDriver: Transaction failed. Rolling back.", err);
        await conn.rollback();
        res.status(500).json({ error: "Failed to assign driver due to a system error." });
    } finally {
        conn.release();
    }
};

// -------------------------------------------------------------------------

/**
 * Driver: Fetches all orders assigned specifically to the authenticated driver.
 * @route GET /api/orders/deliveries/mine
 */
export const getDriverAssignments = async (req, res) => {
    const driverId = req.user.id; // ID of the logged-in driver

    try {
        // Fetch orders assigned to this driver that are not yet DELIVERED or REJECTED
        // We use a JOIN to get order items for the list display
        const [orders] = await db.query(
            `SELECT 
                o.id, o.clientName, o.deliveryAddress, o.deliveryDate, o.status, o.specialInstructions as note,
                p.name AS productName, oi.quantity AS qty
            FROM orders o
            JOIN order_items oi ON o.id = oi.orderId
            JOIN products p ON oi.productId = p.id
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
                    deliveryDate: row.deliveryDate ? row.deliveryDate.toISOString().split('T')[0] : null,
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
        // Stock was reserved (AVAILABLE -> RESERVED) during the APPROVE step.
        // We now finalize the consumption by reducing the RESERVED quantity.
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
                 // In a real system, you might log this error but still complete the order update
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
        
        // NOTE: In a complete implementation, a WebSocket event would be emitted here 
        // to notify the "Checker" interface (`ManageDelivery.jsx`) in real-time.

        res.json({ success: true, orderId, status: 'DELIVERED', deliveredOn });

    } catch (err) {
        console.error("❌ ERROR completeDelivery: Transaction failed. Rolling back.", err);
        await conn.rollback();
        res.status(500).json({ error: "Failed to complete delivery due to a system error." });
    } finally {
        conn.release();
    }
};

export const getDrivers = async (req, res) => {
    try {
        // Query the 'users' table, filtering for active drivers
        const [drivers] = await db.query(
            `SELECT id, CONCAT(firstName, ' ', lastName) AS name, phone AS phone_number 
             FROM users 
             WHERE role = 'DRIVER' AND isActive = 1 
             ORDER BY firstName`
        );
        res.status(200).json(drivers);
    } catch (err) {
        console.error("❌ ERROR getDrivers:", err);
        res.status(500).json({ error: "Failed to fetch drivers." });
    }
};