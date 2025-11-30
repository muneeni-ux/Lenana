import { db } from "../db.js";
import { v4 as uuid } from "uuid";

/* ---------------------------------------------------------
   1️⃣ Maker Creates Stock Entry
---------------------------------------------------------- */
export const createStockIn = async (req, res) => {
  console.log("📥 Incoming Stock-In Request Body:", req.body);

  try {
    const makerId = req.user.id;
    console.log("👤 Maker ID:", makerId);

    const { category, itemName, quantity, unitCost } = req.body;

    const totalCost = quantity * unitCost;
    const recordId = "STK-" + Math.floor(Math.random() * 900 + 100);
    const id = uuid();

    console.log("🧮 Calculated Payload:", {
      id,
      recordId,
      category,
      itemName,
      quantity,
      unitCost,
      totalCost,
      makerId,
    });

    await db.query(
      `INSERT INTO stock_in
       (id, recordId, category, itemName, quantity, unitCost, totalCost, makerId)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, recordId, category, itemName, quantity, unitCost, totalCost, makerId]
    );

    console.log("✅ Successfully inserted stock record:", id);

    res.json({ message: "Stock record submitted", id, recordId });
  } catch (err) {
    console.error("❌ ERROR in createStockIn:", err.message, err.stack);
    res.status(500).json({
      error: "Failed to create stock entry",
      details: err.message,
    });
  }
};

/* ---------------------------------------------------------
   2️⃣ Fetch All Stock Records (Maker + Checker)
---------------------------------------------------------- */
export const getStockIn = async (req, res) => {
  console.log("📥 Fetching all stock_in records...");

  try {
    const [rows] = await db.query(`
      SELECT s.*, u.username AS makerName
      FROM stock_in s
      LEFT JOIN users u ON s.makerId = u.id
      ORDER BY s.createdAt DESC
    `);

    console.log(`📦 Retrieved ${rows.length} stock records`);
    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR in getStockIn:", err.message, err.stack);
    res.status(500).json({
      error: "Failed to fetch stock entries",
      details: err.message,
    });
  }
};

/* ---------------------------------------------------------
   3️⃣ Checker Approves Stock
---------------------------------------------------------- */
export const approveStock = async (req, res) => {
  console.log("📥 Approve Request:", req.params);

  try {
    const checkerId = req.user.id;
    const { id } = req.params;

    console.log("👤 Checker ID:", checkerId);
    console.log("📌 Approving Stock ID:", id);

    const [result] = await db.query(
      `UPDATE stock_in 
       SET status='APPROVED', checkerId=? 
       WHERE id=?`,
      [checkerId, id]
    );

    console.log("📝 SQL Result:", result);

    if (result.affectedRows === 0) {
      console.warn("⚠ No stock entry found for approval.");
      return res.status(404).json({ message: "Stock record not found" });
    }

    console.log("✅ Stock approved");
    res.json({ message: "Stock approved" });
  } catch (err) {
    console.error("❌ ERROR in approveStock:", err.message, err.stack);
    res.status(500).json({
      error: "Failed to approve stock",
      details: err.message,
    });
  }
};

export const getMakerStock = async (req, res) => {
  try {
    const makerId = req.user.id;
    const [rows] = await db.query(`
      SELECT s.*, u.username AS makerName
      FROM stock_in s
      LEFT JOIN users u ON s.makerId = u.id
      WHERE s.makerId = ?
      ORDER BY s.createdAt DESC
    `, [makerId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch maker stock', details: err.message });
  }
};


/* ---------------------------------------------------------
   4️⃣ Checker Rejects Stock
---------------------------------------------------------- */
export const rejectStock = async (req, res) => {
  console.log("📥 Reject Request:", req.params, req.body);

  try {
    const checkerId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    console.log("👤 Checker ID:", checkerId);
    console.log("❌ Rejection Reason:", reason);

    const [result] = await db.query(
      `UPDATE stock_in 
       SET status='REJECTED', rejectionReason=?, checkerId=?
       WHERE id=?`,
      [reason, checkerId, id]
    );

    console.log("📝 SQL Result:", result);

    if (result.affectedRows === 0) {
      console.warn("⚠ No stock entry found for rejection.");
      return res.status(404).json({ message: "Stock record not found" });
    }

    console.log("🚫 Stock rejected");
    res.json({ message: "Stock rejected" });
  } catch (err) {
    console.error("❌ ERROR in rejectStock:", err.message, err.stack);
    res.status(500).json({
      error: "Failed to reject stock",
      details: err.message,
    });
  }
};
