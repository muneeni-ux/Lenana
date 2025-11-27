const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

async function submitStockIn(req, res) {
  const { recordId, category, itemName, quantity, unitCost } = req.body;
  const id = uuidv4();
  try {
    await pool.query(
      `INSERT INTO stock_in (id, recordId, category, itemName, quantity, unitCost, totalCost, status, createdBy)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, recordId, category, itemName || null, quantity, unitCost, quantity * unitCost, 'PENDING_REVIEW', req.user.id]
    );
    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'submit failed' });
  }
}

async function approveStockIn(req, res) {
  const id = req.params.id; // stock_in.id
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[rec]] = await conn.query('SELECT * FROM stock_in WHERE id=? FOR UPDATE', [id]);
    if (!rec) throw new Error('record not found');

    // mark approved
    await conn.query('UPDATE stock_in SET status=?, reviewedBy=?, reviewedAt=NOW(), reviewNotes=? WHERE id=?', ['APPROVED', req.user.id, req.body.reviewNotes || '', id]);

    // OPTIONAL: integrate to inventory based on category-itemName mapping.
    // If category is a product (e.g., 'Bottles') map itemName to productId (lookup by SKU or name).
    // For simplicity, assume itemName === productName and find product.
    const [[product]] = await conn.query('SELECT * FROM products WHERE productName = ? LIMIT 1', [rec.itemName || rec.category]);

    if (product) {
      // ensure inventory row
      const [[inv]] = await conn.query('SELECT * FROM inventory WHERE productId=? FOR UPDATE', [product.id]);
      if (!inv) {
        const invId = uuidv4();
        await conn.query('INSERT INTO inventory (id, productId, quantityAvailable, quantityReserved, quantityDamaged) VALUES (?,?,?,?,?)', [invId, product.id, rec.quantity, 0, 0]);
      } else {
        await conn.query('UPDATE inventory SET quantityAvailable = quantityAvailable + ? WHERE id = ?', [rec.quantity, inv.id]);
      }

      // log stock movement as PURCHASE
      await conn.query(`INSERT INTO stock_movements (id,movementId,productId,movementType,quantityIn,referenceId,referenceType,notes,createdBy) VALUES (?,?,?,?,?,?,?,?,?)`,
        [uuidv4(), 'MV-' + Math.floor(Math.random()*900000), product.id, 'PURCHASE', rec.quantity, rec.recordId, 'STOCK_IN', `Stock in approved: ${rec.recordId}`, req.user.id]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'approve failed' });
  } finally {
    conn.release();
  }
}

module.exports = { submitStockIn, approveStockIn };
