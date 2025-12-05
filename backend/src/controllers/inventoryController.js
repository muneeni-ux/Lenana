// import { db } from "../db.js";
// import { v4 as uuid } from "uuid";

// /**
//  * List inventory (only ACTIVE by default unless owner/checker token requests all)
//  */
// export const listInventory = async (req, res) => {
//   try {
//     const role = req.user?.role;
//     const showAll = role === "OWNER" || role === "CHECKER";
//     const query = showAll
//       ? "SELECT * FROM inventory ORDER BY updatedAt DESC"
//       : "SELECT * FROM inventory WHERE status='ACTIVE' ORDER BY updatedAt DESC";

//     const [rows] = await db.query(query);
//     return res.json(rows);
//   } catch (err) {
//     console.error("❌ ERROR listInventory:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Create inventory item (OWNER/MAKER can create)
//  */
// export const createInventory = async (req, res) => {
//   try {
//     const id = uuid();
//     const createdBy = req.user?.id || null;
//     const {
//       productId,
//       warehouseLocation = "Factory",
//       quantityAvailable = 0,
//       quantityReserved = 0,
//       quantityDamaged = 0,
//       daysSupplyOnHand = null,
//       lastStockCountDate = null,
//     } = req.body;

//     await db.query(
//       `INSERT INTO inventory
//        (id, productId, warehouseLocation, quantityAvailable, quantityReserved, quantityDamaged, daysSupplyOnHand, lastStockCountDate, createdBy, updatedBy)
//        VALUES (?,?,?,?,?,?,?,?,?,?)`,
//       [
//         id,
//         productId,
//         warehouseLocation,
//         Number(quantityAvailable),
//         Number(quantityReserved),
//         Number(quantityDamaged),
//         daysSupplyOnHand,
//         lastStockCountDate,
//         createdBy,
//         createdBy,
//       ]
//     );

//     console.log("Created inventory:", id, "by", createdBy);
//     res.json({ message: "Inventory created", id });
//   } catch (err) {
//     console.error("❌ ERROR createInventory:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Update inventory (owner/maker/checker depending on privilege)
//  */
// export const updateInventory = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedBy = req.user?.id || null;
//     const {
//       warehouseLocation,
//       quantityAvailable,
//       quantityReserved,
//       quantityDamaged,
//       daysSupplyOnHand,
//       lastStockCountDate,
//     } = req.body;

//     await db.query(
//       `UPDATE inventory SET
//          warehouseLocation=?, quantityAvailable=?, quantityReserved=?, quantityDamaged=?, daysSupplyOnHand=?, lastStockCountDate=?, updatedBy=?
//        WHERE id=?`,
//       [
//         warehouseLocation,
//         Number(quantityAvailable),
//         Number(quantityReserved),
//         Number(quantityDamaged),
//         daysSupplyOnHand,
//         lastStockCountDate,
//         updatedBy,
//         id,
//       ]
//     );

//     console.log("Updated inventory:", id, "by", updatedBy);
//     res.json({ message: "Inventory updated" });
//   } catch (err) {
//     console.error("❌ ERROR updateInventory:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Soft delete inventory (set status='DELETED'), only OWNER can hard-delete (but we do soft by default)
//  */
// export const deleteInventory = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedBy = req.user?.id || null;
//     // soft delete
//     await db.query(`UPDATE inventory SET status='DELETED', updatedBy=? WHERE id=?`, [
//       updatedBy,
//       id,
//     ]);

//     console.log("Soft-deleted inventory:", id, "by", updatedBy);
//     res.json({ message: "Inventory soft-deleted" });
//   } catch (err) {
//     console.error("❌ ERROR deleteInventory:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Move stock: atomically update inventory quantities and insert stock_movements log
//  * body: { inventoryId, delta, reason }
//  */
// export const moveStock = async (req, res) => {
//   const conn = await db.getConnection();
//   try {
//     const performer = req.user?.id || null;
//     const { inventoryId } = req.params;
//     const { delta, reason = "Adjustment", meta = null } = req.body;

//     await conn.beginTransaction();

//     // fetch current
//     const [rows] = await conn.query("SELECT * FROM inventory WHERE id=? FOR UPDATE", [inventoryId]);
//     if (rows.length === 0) {
//       await conn.rollback();
//       return res.status(404).json({ error: "Inventory not found" });
//     }
//     const item = rows[0];

//     const newAvailable = Math.max(0, item.quantityAvailable + Number(delta));

//     await conn.query(
//       `UPDATE inventory SET quantityAvailable=?, updatedBy=? WHERE id=?`,
//       [newAvailable, performer, inventoryId]
//     );

//     const movId = uuid();
//     await conn.query(
//       `INSERT INTO stock_movements (id, inventoryId, delta, reason, byUser, meta) VALUES (?,?,?,?,?,?)`,
//       [movId, inventoryId, Number(delta), reason, performer, meta ? JSON.stringify(meta) : null]
//     );

//     await conn.commit();
//     console.log("Moved stock:", inventoryId, delta, "by", performer, "reason:", reason);
//     res.json({ message: "Stock moved", movementId: movId, inventoryId, newAvailable });
//   } catch (err) {
//     await conn.rollback().catch(()=>{});
//     console.error("❌ ERROR moveStock:", err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     conn.release();
//   }
// };

// /**
//  * Get stock movements (with pagination)
//  */
// export const getStockMovements = async (req, res) => {
//   try {
//     const inventoryId = req.query.inventoryId || null;
//     const limit = Math.min(100, Number(req.query.limit || 50));
//     const offset = Number(req.query.offset || 0);

//     let query = "SELECT * FROM stock_movements ";
//     const params = [];
//     if (inventoryId) {
//       query += " WHERE inventoryId=? ";
//       params.push(inventoryId);
//     }
//     query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
//     params.push(limit, offset);

//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ ERROR getStockMovements:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Create inventory audit (count)
//  */
// export const createAudit = async (req, res) => {
//   try {
//     const auditId = uuid();
//     const performer = req.user?.id || null;
//     const { inventoryId, counted, notes = null } = req.body;

//     // fetch before totals
//     const [rows] = await db.query("SELECT quantityAvailable, quantityReserved, quantityDamaged FROM inventory WHERE id=?", [
//       inventoryId,
//     ]);
//     if (rows.length === 0) return res.status(404).json({ error: "Inventory not found" });
//     const item = rows[0];
//     const totalBefore = Number(item.quantityAvailable) + Number(item.quantityReserved) + Number(item.quantityDamaged);
//     const totalAfter = Number(counted);

//     // update quantityAvailable to counted - reserved - damaged (keep reserved/damaged)
//     const newAvailable = Math.max(0, totalAfter - Number(item.quantityReserved) - Number(item.quantityDamaged));
//     await db.query("UPDATE inventory SET quantityAvailable=?, lastStockCountDate=?, updatedBy=? WHERE id=?", [
//       newAvailable,
//       new Date(),
//       performer,
//       inventoryId,
//     ]);

//     // insert audit row
//     await db.query(
//       `INSERT INTO inventory_audits (id, inventoryId, counted, totalBefore, totalAfter, byUser, notes)
//        VALUES (?,?,?,?,?,?,?)`,
//       [auditId, inventoryId, counted, totalBefore, totalAfter, performer, notes]
//     );

//     // log movement as well (difference)
//     const diff = newAvailable - Number(item.quantityAvailable);
//     if (diff !== 0) {
//       await db.query(
//         `INSERT INTO stock_movements (id, inventoryId, delta, reason, byUser)
//          VALUES (?,?,?,'Audit Adjustment',?)`,
//         [uuid(), inventoryId, diff, performer]
//       );
//     }

//     res.json({ message: "Audit created", auditId, inventoryId, totalBefore, totalAfter });
//   } catch (err) {
//     console.error("❌ ERROR createAudit:", err);
//     res.status(500).json({ error: err.message });
//   }
// };
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

/**
 * List inventory (only ACTIVE by default unless owner/checker token requests all)
 */
export const listInventory = async (req, res) => {
  console.log("🔍 listInventory: Request received."); // Debug Log
  try {
    const role = req.user?.role;
    console.log(`👤 listInventory: User role is ${role}.`); // Debug Log
    const showAll = role === "OWNER" || role === "CHECKER";
    const query = showAll
      ? "SELECT * FROM inventory ORDER BY updatedAt DESC"
      : "SELECT * FROM inventory WHERE status='ACTIVE' ORDER BY updatedAt DESC";

    console.log(`📜 listInventory: Executing query: ${query}`); // Debug Log
    const [rows] = await db.query(query);
    console.log(`✅ listInventory: Found ${rows.length} rows.`); // Debug Log
    return res.json(rows);
  } catch (err) {
    console.error("❌ ERROR listInventory:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Create inventory item (OWNER/MAKER can create)
 */
export const createInventory = async (req, res) => {
  console.log("📥 createInventory: Request received. Body:", req.body); // Debug Log
  try {
    const id = uuid();
    const createdBy = req.user?.id || null;
    console.log(`🛠️ createInventory: Generated ID: ${id}, Created By: ${createdBy}`); // Debug Log

    const {
      productId,
      warehouseLocation = "Factory",
      quantityAvailable = 0,
      quantityReserved = 0,
      quantityDamaged = 0,
      daysSupplyOnHand = null,
      lastStockCountDate = null,
    } = req.body;

    const values = [
        id,
        productId,
        warehouseLocation,
        Number(quantityAvailable),
        Number(quantityReserved),
        Number(quantityDamaged),
        daysSupplyOnHand,
        lastStockCountDate,
        createdBy,
        createdBy,
      ];
    console.log("❓ createInventory: Query values (10):", values); // Debug Log

    const [result] = await db.query(
      `INSERT INTO inventory
       (id, productId, warehouseLocation, quantityAvailable, quantityReserved, quantityDamaged, daysSupplyOnHand, lastStockCountDate, createdBy, updatedBy)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      values
    );
    console.log("✔️ createInventory: SQL Result:", result); // Debug Log

    console.log("Created inventory:", id, "by", createdBy);
    res.json({ message: "Inventory created", id });
  } catch (err) {
    console.error("❌ ERROR createInventory:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update inventory (owner/maker/checker depending on privilege)
 */
export const updateInventory = async (req, res) => {
  console.log(`📥 updateInventory: Request received for ID: ${req.params.id}. Body:`, req.body); // Debug Log
  try {
    const id = req.params.id;
    const updatedBy = req.user?.id || null;
    const {
      warehouseLocation,
      quantityAvailable,
      quantityReserved,
      quantityDamaged,
      daysSupplyOnHand,
      lastStockCountDate,
    } = req.body;

    const updateValues = [
        warehouseLocation,
        Number(quantityAvailable),
        Number(quantityReserved),
        Number(quantityDamaged),
        daysSupplyOnHand,
        lastStockCountDate,
        updatedBy,
        id,
      ];
    console.log("❓ updateInventory: Query values (8):", updateValues); // Debug Log


    const [result] = await db.query(
      `UPDATE inventory SET
         warehouseLocation=?, quantityAvailable=?, quantityReserved=?, quantityDamaged=?, daysSupplyOnHand=?, lastStockCountDate=?, updatedBy=?
       WHERE id=?`,
      updateValues
    );
    console.log("✔️ updateInventory: SQL Result:", result); // Debug Log
    if (result.affectedRows === 0) {
        console.warn(`⚠️ updateInventory: No rows affected for ID ${id}. Item might not exist.`);
    }


    console.log("Updated inventory:", id, "by", updatedBy);
    res.json({ message: "Inventory updated" });
  } catch (err) {
    console.error("❌ ERROR updateInventory:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Soft delete inventory (set status='DELETED'), only OWNER can hard-delete (but we do soft by default)
 */
export const deleteInventory = async (req, res) => {
  console.log(`📥 deleteInventory: Request received for ID: ${req.params.id}.`); // Debug Log
  try {
    const id = req.params.id;
    const updatedBy = req.user?.id || null;
    console.log(`👤 deleteInventory: Performed by user ID: ${updatedBy}`); // Debug Log

    // soft delete
    const [result] = await db.query(`UPDATE inventory SET status='DELETED', updatedBy=? WHERE id=?`, [
      updatedBy,
      id,
    ]);
    console.log("✔️ deleteInventory: SQL Result:", result); // Debug Log
    if (result.affectedRows === 0) {
        console.warn(`⚠️ deleteInventory: No rows affected for ID ${id}. Item might not exist.`);
    }

    console.log("Soft-deleted inventory:", id, "by", updatedBy);
    res.json({ message: "Inventory soft-deleted" });
  } catch (err) {
    console.error("❌ ERROR deleteInventory:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Move stock: atomically update inventory quantities and insert stock_movements log
 * body: { inventoryId, delta, reason }
 */
export const moveStock = async (req, res) => {
  const conn = await db.getConnection();
  console.log(`📥 moveStock: Request received for ID: ${req.params.inventoryId}. Body:`, req.body); // Debug Log
  try {
    const performer = req.user?.id || null;
    const { inventoryId } = req.params;
    const { delta, reason = "Adjustment", meta = null } = req.body;

    console.log("🛠️ moveStock: Starting transaction..."); // Debug Log
    await conn.beginTransaction();

    // fetch current
    console.log(`🔍 moveStock: Locking inventory row for ID: ${inventoryId}`); // Debug Log
    const [rows] = await conn.query("SELECT * FROM inventory WHERE id=? FOR UPDATE", [inventoryId]);
    if (rows.length === 0) {
      await conn.rollback();
      console.warn(`⚠️ moveStock: Inventory ID ${inventoryId} not found. Rolling back.`); // Debug Log
      return res.status(404).json({ error: "Inventory not found" });
    }
    const item = rows[0];
    console.log("📈 moveStock: Current quantity available:", item.quantityAvailable); // Debug Log

    const newAvailable = Math.max(0, item.quantityAvailable + Number(delta));
    console.log(`✨ moveStock: Delta: ${delta}. New available calculated: ${newAvailable}`); // Debug Log

    const [updateResult] = await conn.query(
      `UPDATE inventory SET quantityAvailable=?, updatedBy=? WHERE id=?`,
      [newAvailable, performer, inventoryId]
    );
    console.log("✔️ moveStock: Inventory update result:", updateResult); // Debug Log

    const movId = uuid();
    console.log(`📜 moveStock: Inserting movement log with ID: ${movId}`); // Debug Log
    const [insertResult] = await conn.query(
      `INSERT INTO stock_movements (id, inventoryId, delta, reason, byUser, meta) VALUES (?,?,?,?,?,?)`,
      [movId, inventoryId, Number(delta), reason, performer, meta ? JSON.stringify(meta) : null]
    );
    console.log("✔️ moveStock: Movement log insert result:", insertResult); // Debug Log

    await conn.commit();
    console.log("✅ moveStock: Transaction committed."); // Debug Log
    console.log("Moved stock:", inventoryId, delta, "by", performer, "reason:", reason);
    res.json({ message: "Stock moved", movementId: movId, inventoryId, newAvailable });
  } catch (err) {
    console.error("❌ ERROR moveStock: Transaction failed. Attempting rollback.", err); // Debug Log
    await conn.rollback().catch((rollbackErr)=>{
        console.error("❌ ERROR moveStock: Rollback failed.", rollbackErr); // Log rollback failure
    });
    console.error("❌ ERROR moveStock:", err);
    res.status(500).json({ error: err.message });
  } finally {
    console.log("🔗 moveStock: Releasing connection."); // Debug Log
    conn.release();
  }
};

/**
 * Get stock movements (with pagination)
 */
export const getStockMovements = async (req, res) => {
  console.log("📥 getStockMovements: Request received. Query:", req.query); // Debug Log
  try {
    const inventoryId = req.query.inventoryId || null;
    const limit = Math.min(100, Number(req.query.limit || 50));
    const offset = Number(req.query.offset || 0);
    console.log(`⚙️ getStockMovements: Inventory ID: ${inventoryId}, Limit: ${limit}, Offset: ${offset}`); // Debug Log

    let query = "SELECT * FROM stock_movements ";
    const params = [];
    if (inventoryId) {
      query += " WHERE inventoryId=? ";
      params.push(inventoryId);
    }
    query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    console.log(`📜 getStockMovements: Executing query: ${query}`); // Debug Log
    console.log("❓ getStockMovements: Query parameters:", params); // Debug Log

    const [rows] = await db.query(query, params);
    console.log(`✅ getStockMovements: Found ${rows.length} movement records.`); // Debug Log
    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR getStockMovements:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create inventory audit (count)
 */
export const createAudit = async (req, res) => {
  console.log("📥 createAudit: Request received. Body:", req.body); // Debug Log
  try {
    const auditId = uuid();
    const performer = req.user?.id || null;
    const { inventoryId, counted, notes = null } = req.body;
    console.log(`🛠️ createAudit: Audit ID: ${auditId}, Performer: ${performer}, Counted: ${counted}`); // Debug Log


    // fetch before totals
    console.log(`🔍 createAudit: Fetching current inventory totals for ID: ${inventoryId}`); // Debug Log
    const [rows] = await db.query("SELECT quantityAvailable, quantityReserved, quantityDamaged FROM inventory WHERE id=?", [
      inventoryId,
    ]);
    if (rows.length === 0) {
      console.warn(`⚠️ createAudit: Inventory ID ${inventoryId} not found.`); // Debug Log
      return res.status(404).json({ error: "Inventory not found" });
    }
    const item = rows[0];
    console.log("📊 createAudit: Current quantities:", item); // Debug Log

    const totalBefore = Number(item.quantityAvailable) + Number(item.quantityReserved) + Number(item.quantityDamaged);
    const totalAfter = Number(counted);
    console.log(`✨ createAudit: Total Before: ${totalBefore}, Total After (Counted): ${totalAfter}`); // Debug Log


    // update quantityAvailable to counted - reserved - damaged (keep reserved/damaged)
    const newAvailable = Math.max(0, totalAfter - Number(item.quantityReserved) - Number(item.quantityDamaged));
    console.log(`🔄 createAudit: Calculated New Available: ${newAvailable}`); // Debug Log

    const [updateResult] = await db.query("UPDATE inventory SET quantityAvailable=?, lastStockCountDate=?, updatedBy=? WHERE id=?", [
      newAvailable,
      new Date(),
      performer,
      inventoryId,
    ]);
    console.log("✔️ createAudit: Inventory update result:", updateResult); // Debug Log


    // insert audit row
    const auditValues = [auditId, inventoryId, counted, totalBefore, totalAfter, performer, notes];
    console.log("📜 createAudit: Inserting audit record values (7):", auditValues); // Debug Log
    const [auditInsertResult] = await db.query(
      `INSERT INTO inventory_audits (id, inventoryId, counted, totalBefore, totalAfter, byUser, notes)
       VALUES (?,?,?,?,?,?,?)`,
      auditValues
    );
    console.log("✔️ createAudit: Audit insert result:", auditInsertResult); // Debug Log


    // log movement as well (difference)
    const diff = newAvailable - Number(item.quantityAvailable);
    if (diff !== 0) {
      console.log(`📊 createAudit: Difference found (${diff}). Logging stock movement.`); // Debug Log
      const [movementInsertResult] = await db.query(
        `INSERT INTO stock_movements (id, inventoryId, delta, reason, byUser)
         VALUES (?,?,?,'Audit Adjustment',?)`,
        [uuid(), inventoryId, diff, performer]
      );
      console.log("✔️ createAudit: Movement insert result:", movementInsertResult); // Debug Log
    } else {
    	console.log("📊 createAudit: No difference in available stock after audit. No movement log created."); // Debug Log
    }

    res.json({ message: "Audit created", auditId, inventoryId, totalBefore, totalAfter });
  } catch (err) {
    console.error("❌ ERROR createAudit:", err);
    res.status(500).json({ error: err.message });
  }
};