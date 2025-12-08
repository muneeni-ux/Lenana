import { db } from "../db.js";
import { v4 as uuid } from "uuid";

// --- Helper Functions ---

/**
 * Helper to generate a sequential invoice number (e.g., INV-0001).
 * NOTE: For production, this should ideally be handled by an auto-increment column 
 * or a stored procedure to ensure sequence integrity. Using a basic MAX(invoiceNumber) 
 * approach here, wrapped in a transaction if needed.
 */
const generateInvoiceNumber = async (connection) => {
    try {
        const [rows] = await connection.query(
            "SELECT invoiceNumber FROM invoices ORDER BY createdAt DESC LIMIT 1"
        );
        
        let nextNumber = 1;
        if (rows.length > 0) {
            const lastNum = rows[0].invoiceNumber.match(/\d+$/);
            if (lastNum) {
                nextNumber = parseInt(lastNum[0]) + 1;
            }
        }
        return `INV-${String(nextNumber).padStart(4, '0')}`;
    } catch (err) {
        // Fallback or re-throw after logging
        console.error("❌ ERROR generateInvoiceNumber:", err);
        return `INV-${uuid().substring(0, 4)}`; // Safe, unique fallback
    }
};

/**
 * Helper to calculate the due date (e.g., 10 days after invoice date).
 * @param {string} dateString - The invoice date (YYYY-MM-DD).
 * @param {number} days - The number of days until due.
 */
const calculateDueDate = (dateString, days = 10) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Helper to fetch a single invoice by its user-facing ID.
 */
const getInvoiceByInvoiceId = async (invoiceId, connection = db) => {
    try {
        const [rows] = await connection.query(
            "SELECT * FROM invoices WHERE id = ?",
            [invoiceId]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        console.error("❌ ERROR getInvoiceByInvoiceId:", err);
        return null; 
    }
};

// --- Controller Logic ---

/**
 * GET /api/invoices
 * Fetches and filters a list of invoices.
 */
export const getInvoices = async (req, res) => {
    console.log("🔍 getInvoices: Request received.");
    const { search, status } = req.query;

    let query = "SELECT * FROM invoices WHERE 1=1 AND status != 'DELETED'";
    const params = [];

    // Filter by Status
    if (status && status !== 'ALL') {
        query += " AND status = ?";
        params.push(status.toUpperCase());
    }

    // Filter by Search (Invoice Number or Client Name)
    if (search) {
        const s = `%${search.toLowerCase()}%`;
        query += " AND (LOWER(invoiceNumber) LIKE ? OR LOWER(clientName) LIKE ?)";
        params.push(s, s);
    }

    query += " ORDER BY invoiceDate DESC, createdAt DESC";

    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("❌ ERROR getInvoices:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/invoices/:invoiceId
 * Fetches a single invoice and its line items.
 */
export const getInvoiceDetails = async (req, res) => {
    const { invoiceId } = req.params;
    console.log(`🔍 getInvoiceDetails: Request for ID: ${invoiceId}`);
    try {
        // 1. Fetch Invoice Header
        const invoice = await getInvoiceByInvoiceId(invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        // 2. Fetch Invoice Items
        const [items] = await db.query(
            "SELECT * FROM invoice_items WHERE invoiceId = ?",
            [invoiceId]
        );

        // 3. Combine and Respond
        res.json({
            ...invoice,
            items: items
        });

    } catch (err) {
        console.error("❌ ERROR getInvoiceDetails:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/invoices/from-order/:orderId
 * Creates a new DRAFT invoice from an approved order.
 * *** CRITICAL: Uses a database transaction. ***
 */
export const createInvoiceFromOrder = async (req, res) => {
    const { orderId } = req.params;
    const createdBy = req.user.username;
    const invoiceId = uuid();
    let connection;

    console.log(`📥 createInvoiceFromOrder: Attempting to create invoice for Order ID: ${orderId}`);

    try {
        // 1. Start Transaction
        connection = await db.getConnection();
        await connection.beginTransaction();
        console.log("🛠️ Transaction started.");

        // 2. Fetch Order and Items
        // Assuming 'orders' table has status, clientId, clientName, orderTotalKsh, and 'order_items' table exists.
        const [orderRows] = await connection.query(
            "SELECT * FROM orders WHERE id = ?",
            [orderId]
        );

        if (orderRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Order not found." });
        }
        const order = orderRows[0];
        
        // Basic business validation: only create invoice for approved/completed orders
        if (order.status !== 'APPROVED' && order.status !== 'COMPLETED') {
             await connection.rollback();
             return res.status(400).json({ message: `Cannot create invoice. Order status is ${order.status}.` });
        }
        
        // Check if invoice already exists for this order
        const [existing] = await connection.query(
             "SELECT id FROM invoices WHERE orderId = ? AND status != 'DELETED'",
             [orderId]
        );
        if (existing.length > 0) {
             await connection.rollback();
             return res.status(409).json({ message: "Invoice already exists for this order." });
        }


        const [itemRows] = await connection.query(
            "SELECT productId, productName, quantity, unitPriceKsh, lineTotalKsh FROM order_items WHERE orderId = ?",
            [orderId]
        );

        if (itemRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: "Order has no line items." });
        }

        // 3. Generate Invoice Header Data
        const invoiceNumber = await generateInvoiceNumber(connection);
        const invoiceDate = new Date().toISOString().split('T')[0];
        const dueDate = calculateDueDate(invoiceDate);
        
        // The total is taken from the already calculated order total for integrity
        const invoiceTotalKsh = order.orderTotalKsh; 

        // 4. Insert Invoice Header
        await connection.query(
            `INSERT INTO invoices (
                id, invoiceNumber, orderId, clientId, clientName, invoiceDate, dueDate, 
                invoiceTotalKsh, status, createdBy, updatedBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`,
            [
                invoiceId, invoiceNumber, orderId, order.clientId, order.clientName, 
                invoiceDate, dueDate, invoiceTotalKsh, createdBy, createdBy
            ]
        );

        // 5. Insert Invoice Line Items (Batch Insert)
        const itemValues = itemRows.map(item => [
            uuid(), // id
            invoiceId, // invoiceId (link back to new header)
            item.productId,
            item.productName, // Denormalized from Order Item
            item.quantity,
            item.unitPriceKsh,
            item.lineTotalKsh
        ]);

        if (itemValues.length > 0) {
            await connection.query(
                `INSERT INTO invoice_items (
                    id, invoiceId, productId, productName, quantity, unitPriceKsh, lineTotalKsh
                ) VALUES ?`,
                [itemValues]
            );
        }

        // 6. Commit Transaction and Update Order Status (Optional but recommended)
        // Set the linked order status to 'INVOICED' to prevent duplicate invoicing
        await connection.query(
             "UPDATE orders SET status = 'INVOICED', updatedBy = ? WHERE id = ?",
             [createdBy, orderId]
        );

        await connection.commit();
        console.log(`✅ Invoice ${invoiceNumber} created and transaction committed.`);
        res.status(201).json({ 
            message: `Invoice ${invoiceNumber} created successfully and linked to Order ${orderId}.`, 
            invoiceId,
            invoiceNumber 
        });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error("❌ ERROR createInvoiceFromOrder:", err);
        res.status(500).json({ error: err.message || "Failed to create invoice. Transaction rolled back." });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * POST /api/invoices/:invoiceId/send
 * Updates a DRAFT invoice status to SENT.
 */
export const markInvoiceSent = async (req, res) => {
    const { invoiceId } = req.params;
    const updatedBy = req.user.username;

    try {
        const [result] = await db.query(
            "UPDATE invoices SET status = 'SENT', updatedBy = ? WHERE id = ? AND status = 'DRAFT'",
            [updatedBy, invoiceId]
        );

        if (result.affectedRows === 0) {
            const invoice = await getInvoiceByInvoiceId(invoiceId);
            if (!invoice) return res.status(404).json({ message: "Invoice not found." });
            return res.status(400).json({ message: `Invoice is currently in ${invoice.status} status. Only DRAFT invoices can be marked SENT.` });
        }

        res.json({ message: "Invoice marked as SENT." });
    } catch (err) {
        console.error("❌ ERROR markInvoiceSent:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/invoices/:invoiceId/pay
 * Updates an invoice status to PAID.
 */
export const markInvoicePaid = async (req, res) => {
    const { invoiceId } = req.params;
    const updatedBy = req.user.username;

    try {
        const [result] = await db.query(
            "UPDATE invoices SET status = 'PAID', updatedBy = ?, paymentDate = NOW() WHERE id = ? AND status IN ('SENT', 'DRAFT')",
            [updatedBy, invoiceId]
        );

        if (result.affectedRows === 0) {
            const invoice = await getInvoiceByInvoiceId(invoiceId);
            if (!invoice) return res.status(404).json({ message: "Invoice not found." });
            return res.status(400).json({ message: `Invoice is already ${invoice.status}.` });
        }

        res.json({ message: "Invoice marked as PAID." });
    } catch (err) {
        console.error("❌ ERROR markInvoicePaid:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE /api/invoices/:invoiceId
 * Soft deletes/archives an invoice by setting status to 'DELETED'.
 */
export const deleteInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    const updatedBy = req.user.username;

    try {
        const [result] = await db.query(
            "UPDATE invoices SET status = 'DELETED', updatedBy = ? WHERE id = ? AND status != 'DELETED'",
            [updatedBy, invoiceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Invoice not found or already deleted." });
        }

        res.json({ message: "Invoice soft-deleted." });
    } catch (err) {
        console.error("❌ ERROR deleteInvoice:", err);
        res.status(500).json({ error: err.message });
    }
};