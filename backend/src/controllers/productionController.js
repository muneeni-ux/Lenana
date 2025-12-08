import { db } from "../db.js";
import { v4 as uuid } from "uuid";

// --- Helper Functions ---

/**
 * Helper to fetch a single batch by the user-facing batchId.
 * @param {string} batchId - The public facing batch identifier (e.g., BATCH-001).
 * @param {object} connection - The database connection object (db or transaction connection).
 * @returns {object|null} The batch object or null.
 */
const getBatchByBatchId = async (batchId, connection = db) => {
    try {
        const [rows] = await connection.query(
            "SELECT * FROM production_batches WHERE batchId = ?",
            [batchId]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        console.error("❌ ERROR getBatchByBatchId:", err);
        return null; 
    }
};

/**
 * Helper to get the product name for batch creation.
 * Assumes a 'products' table exists with a 'id' and 'productName' field.
 */
const getProductName = async (productId) => {
    try {
        const [rows] = await db.query(
            "SELECT productName FROM products WHERE id = ?",
            [productId]
        );
        return rows.length > 0 ? rows[0].productName : `Unknown Product (${productId})`;
    } catch (err) {
        console.error("❌ ERROR getProductName:", err);
        return `Unknown Product (${productId})`;
    }
};

// --- CRUD & Workflow Controller Logic ---

/**
 * GET /api/production/batches
 * Fetches and filters production batches.
 */
export const getBatches = async (req, res) => {
    console.log("🔍 getBatches: Production batches request received.");
    const { search, status, productId, dateFrom, dateTo, sortBy } = req.query;

    let query = "SELECT * FROM production_batches WHERE 1=1";
    const params = [];

    // Filtering logic... (kept the same as previous)
    if (status && status !== 'ALL') {
        query += " AND status = ?";
        params.push(status);
    }
    if (productId && productId !== 'All') {
        query += " AND productId = ?";
        params.push(productId);
    }
    if (search) {
        const s = `%${search.toLowerCase()}%`;
        query += " AND (LOWER(batchId) LIKE ? OR LOWER(productName) LIKE ? OR LOWER(createdBy) LIKE ?)";
        params.push(s, s, s);
    }
    if (dateFrom) {
        query += " AND productionDate >= ?";
        params.push(dateFrom);
    }
    if (dateTo) {
        query += " AND productionDate <= ?";
        params.push(dateTo);
    }

    // Sorting logic...
    switch (sortBy) {
        case 'oldest':
            query += " ORDER BY productionDate ASC, createdAt ASC";
            break;
        case 'product':
            query += " ORDER BY productName ASC";
            break;
        case 'newest':
        default:
            query += " ORDER BY productionDate DESC, createdAt DESC";
            break;
    }

    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("❌ ERROR getBatches:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/production/:batchId
 * Fetches a single production batch's details.
 */
export const getBatchDetails = async (req, res) => {
    const { batchId } = req.params;
    console.log(`🔍 getBatchDetails: Request received for Batch ID: ${batchId}.`);
    try {
        const batch = await getBatchByBatchId(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Production batch not found." });
        }
        res.json(batch);
    } catch (err) {
        console.error("❌ ERROR getBatchDetails:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/production/
 * Creates a new production batch (Status: PENDING).
 * Req.body: { productId: string, quantityPlanned: number }
 */
/**
 * POST /api/production/
 * Creates a new production batch (Status: PENDING).
 * Req.body: { productId: string, quantityPlanned: number }
 */
export const createBatch = async (req, res) => {
    const { productId, quantityPlanned } = req.body;
    const createdBy = req.user.id; // Use username for tracking creator
    
    // The internal unique 'id' is now handled by the database (auto_increment).
    // The user-facing ID is generated here:
    const batchId = `BATCH-${Math.floor(Math.random() * 90000) + 10000}`; // Simple generated user-facing ID

    console.log(`📥 createBatch: Creating new batch ${batchId} for Product ID: ${productId}`);

    if (!productId || !quantityPlanned || quantityPlanned <= 0) {
        return res.status(400).json({ message: "Invalid productId or quantityPlanned." });
    }

    try {
        const productName = await getProductName(productId);
        const productionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // ⭐ FIX APPLIED: 'id' column and its corresponding '?' value have been removed
        // from the query, relying on MySQL's auto_increment.
        const [result] = await db.query(
            `INSERT INTO production_batches (
                batchId, productId, productName, quantityPlanned, productionDate, status, createdBy
            ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
            [ batchId, productId, productName, quantityPlanned, productionDate, createdBy]
        );

        console.log("✔️ createBatch: SQL Result:", result);
        
        // Use result.insertId to get the auto-generated integer ID if needed, 
        // otherwise, just return the batchId.
        res.status(201).json({ 
            message: `Batch ${batchId} created successfully.`, 
            batchId,
            id: result.insertId // Optional: Return the auto-generated integer ID
        });
    } catch (err) {
        console.error("❌ ERROR createBatch:", err);
        // Handle unique constraint error on batchId if it's used as unique key
        if (err.code === 'ER_DUP_ENTRY') { 
             return res.status(409).json({ error: "Duplicate batch ID detected. Try again." });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/production/:batchId/start
 * Marks a PENDING batch as IN_PROGRESS.
 */
export const startProduction = async (req, res) => {
    const { batchId } = req.params;
    const productionStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`🚀 startProduction: Starting production for Batch ID: ${batchId}`);

    try {
        const [result] = await db.query(
            `UPDATE production_batches SET 
             status = 'IN_PROGRESS', 
             productionStartTime = ?
             WHERE batchId = ? AND status = 'PENDING'`,
            [productionStartTime, batchId]
        );

        if (result.affectedRows === 0) {
            const batch = await getBatchByBatchId(batchId);
            if (!batch) return res.status(404).json({ message: "Batch not found." });
            return res.status(400).json({ message: `Batch is currently in ${batch.status} status. Only PENDING batches can be started.` });
        }

        res.json({ message: `Production started for batch ${batchId}.`, batchId });
    } catch (err) {
        console.error("❌ ERROR startProduction:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/production/:batchId/complete
 * Marks an IN_PROGRESS batch as COMPLETED and records the produced quantity.
 * Req.body: { quantityCompleted: number }
 */
export const completeProduction = async (req, res) => {
    const { batchId } = req.params;
    const { quantityCompleted } = req.body;
    const productionEndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`✅ completeProduction: Completing batch ${batchId} with quantity: ${quantityCompleted}`);

    if (typeof quantityCompleted !== 'number' || quantityCompleted < 0) {
        return res.status(400).json({ message: "Invalid quantityCompleted." });
    }

    try {
        const [result] = await db.query(
            `UPDATE production_batches SET 
             status = 'COMPLETED', 
             quantityCompleted = ?,
             productionEndTime = ?
             WHERE batchId = ? AND status = 'IN_PROGRESS'`,
            [quantityCompleted, productionEndTime, batchId]
        );

        if (result.affectedRows === 0) {
            const batch = await getBatchByBatchId(batchId);
            if (!batch) return res.status(404).json({ message: "Batch not found." });
            return res.status(400).json({ message: `Batch is currently in ${batch.status} status. Only IN_PROGRESS batches can be completed.` });
        }

        res.json({ message: `Batch ${batchId} marked as COMPLETED.`, batchId });
    } catch (err) {
        console.error("❌ ERROR completeProduction:", err);
        res.status(500).json({ error: err.message });
    }
};

// ----------------------------------------------------------------------

/**
 * POST /api/production/batches/:batchId/reject
 * Marks a batch as REJECTED with a reason.
 */
export const rejectBatch = async (req, res) => {
    const { batchId } = req.params;
    const { rejectionReason } = req.body;
    const checkerUsername = req.user.username; 
    
    console.log(`📥 rejectBatch: Request received for Batch ID: ${batchId}. Rejected By: ${checkerUsername}`);

    if (!rejectionReason || rejectionReason.trim().length < 5) {
        return res.status(400).json({ message: "Rejection reason is required (min 5 chars)." });
    }

    try {
        const [result] = await db.query(
            `UPDATE production_batches SET 
             status = 'REJECTED', 
             qualityCheckPassed = FALSE, 
             rejectionReason = ?,
             qcBy = ?,
             qcDate = NOW()
             WHERE batchId = ? AND status IN ('PENDING', 'COMPLETED')`,
            [rejectionReason, checkerUsername, batchId]
        );

        if (result.affectedRows === 0) {
            const batch = await getBatchByBatchId(batchId);
            if (!batch) {
                return res.status(404).json({ message: "Batch not found." });
            }
            return res.status(400).json({ message: `Batch is already ${batch.status}. Cannot be rejected/re-rejected.` });
        }

        res.json({ message: `Batch ${batchId} marked as REJECTED.`, batchId });
    } catch (err) {
        console.error("❌ ERROR rejectBatch:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/production/:batchId/qc-approve
 * Performs Quality Check: Updates batch to APPROVED, updates inventory, and logs stock movements.
 * *** CRITICAL: Uses a database transaction to ensure atomicity. ***
 * (Renamed from approveQC to qcApproveBatch to match router)
 */
export const qcApproveBatch = async (req, res) => {
    const { batchId } = req.params;
    const { defectiveQty, passedQty, qcNotes } = req.body;
    
    // Use ID for foreign keys, Username for logging (where appropriate)
    const checkerId = req.user.id; 
    const checkerUsername = req.user.username;
    const qcDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 

    console.log(`📥 qcApproveBatch: QC approval started for Batch ID: ${batchId}.`);

    if (typeof defectiveQty !== 'number' || typeof passedQty !== 'number' || defectiveQty < 0 || passedQty < 0) {
        return res.status(400).json({ message: "Invalid defectiveQty or passedQty." });
    }
    
    let connection;
    try {
        // 1. Start Transaction
        connection = await db.getConnection(); 
        await connection.beginTransaction();

        // 2. Fetch and Validate Batch
        const batch = await getBatchByBatchId(batchId, connection);
        if (!batch) {
            await connection.rollback();
            return res.status(404).json({ message: "Batch not found." });
        }
        if (batch.status !== 'COMPLETED') {
            await connection.rollback();
            return res.status(400).json({ message: `Batch is currently in ${batch.status} status. Only COMPLETED batches can be approved QC.` });
        }

        const qtyCompleted = Number(batch.quantityCompleted || 0);
        const totalChecked = defectiveQty + passedQty;
        if (totalChecked !== qtyCompleted) {
             await connection.rollback();
             return res.status(400).json({ message: `Mismatch: Completed: ${qtyCompleted}, Checked: ${totalChecked}.` });
        }

        // 3. Update the Production Batch record
        const updateBatchQuery = `
            UPDATE production_batches SET 
            status = 'APPROVED', 
            qualityCheckPassed = TRUE, 
            defectiveQty = ?, 
            passedQty = ?, 
            qcNotes = ?, 
            qcBy = ?, 
            qcDate = ?
            WHERE batchId = ? AND status = 'COMPLETED'
        `;
        await connection.query(updateBatchQuery, [
            defectiveQty, passedQty, qcNotes, checkerUsername, qcDate, batchId
        ]);

        // --- Inventory Update ---
        const productId = batch.productId;
        const today = new Date().toISOString().split('T')[0];
        
        // 4. Update Inventory (Upsert logic: INSERT OR UPDATE)
        const upsertInventoryQuery = `
            INSERT INTO inventory (id, productId, warehouseLocation, quantityAvailable, quantityDamaged, lastStockCountDate, createdBy, updatedBy)
            VALUES (?, ?, 'Factory', ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            quantityAvailable = quantityAvailable + VALUES(quantityAvailable),
            quantityDamaged = quantityDamaged + VALUES(quantityDamaged),
            lastStockCountDate = VALUES(lastStockCountDate),
            updatedBy = ?
        `;
        await connection.query(upsertInventoryQuery, [
            uuid(), productId, passedQty, defectiveQty, today, checkerId, checkerId, checkerId // Last checkerId is for updatedBy
        ]);


        // 4.5. ⭐ CRITICAL FIX: Fetch the actual inventory.id after UPSERT
        // This ID is the primary key needed for the stock_movements foreign key constraint.
        const [inventoryRows] = await connection.query(
            `SELECT id FROM inventory WHERE productId = ?`,
            [productId]
        );
        
        if (inventoryRows.length === 0) {
            await connection.rollback();
            // Should not happen after a successful upsert
            return res.status(500).json({ message: "Inventory record not found after upsert. Transaction rolled back." });
        }
        
        // Store the correct ID for the Foreign Key constraint
        const correctInventoryId = inventoryRows[0].id; 
        
        // --- Stock Movements Log ---
        // 5. Log Stock Movements
        const movements = [];

        if (passedQty > 0) {
            movements.push([
                uuid(), 
                correctInventoryId, // ⭐ FIXED: Use the inventory.id (UUID)
                passedQty, 
                `QC passed for batch ${batchId} - Added to Available Stock`, 
                checkerId,
                qcDate
            ]);
        }
        if (defectiveQty > 0) {
            movements.push([
                uuid(), 
                correctInventoryId, // ⭐ FIXED: Use the inventory.id (UUID)
                defectiveQty, 
                `QC defective for batch ${batchId} - Added to Damaged Stock`,
                checkerId,
                qcDate
            ]);
        }

        if (movements.length > 0) {
            const insertMovementQuery = `
                INSERT INTO stock_movements (id, inventoryId, delta, reason, byUser, createdAt)
                VALUES ?
            `;
            await connection.query(insertMovementQuery, [movements]);
        }

        // 6. Commit the transaction
        await connection.commit();
        console.log(`✔️ qcApproveBatch: Batch ${batchId} approved and transaction committed.`);
        res.json({ message: `Batch ${batchId} approved and inventory updated successfully.`, batchId });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error(`❌ ERROR qcApproveBatch:`, err);
        res.status(500).json({ error: err.message || "Failed to approve QC due to a system error. Transaction rolled back." });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};