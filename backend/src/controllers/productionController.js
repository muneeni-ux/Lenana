const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/production
 * maker creates a batch (PLANNED)
 * body: { batchId, productId, orderId?, quantityPlanned, productionDate }
 */
async function createBatch(req, res) {
  const { batchId, productId, orderId, quantityPlanned, productionDate } = req.body;
  const id = uuidv4();
  try {
    await pool.query(
      `INSERT INTO production_batches (id,batchId,orderId,productId,quantityPlanned,productionDate,createdBy)
       VALUES (?,?,?,?,?,?,?)`,
      [id, batchId, orderId || null, productId, quantityPlanned, productionDate, req.user.id]
    );
    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'create failed' });
  }
}

/**
 * POST /api/production/:id/mark-produced
 * Maker indicates production completed (sets quantityCompleted, status COMPLETED, production times)
 * body: { quantityCompleted, productionStartTime, productionEndTime }
 */
async function markProduced(req, res) {
  const id = req.params.id;
  const { quantityCompleted, productionStartTime, productionEndTime } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM production_batches WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) throw new Error('Batch not found');

    const batch = rows[0];
    // update batch
    await conn.query(
      `UPDATE production_batches SET quantityCompleted=?, productionStartTime=?, productionEndTime=?, status='COMPLETED', updatedAt=NOW() WHERE id=?`,
      [quantityCompleted, productionStartTime || batch.productionStartTime, productionEndTime || new Date(), id]
    );

    // create stock movement for production IN (quantityCompleted)
    const movementId = 'MV-' + Math.floor(Math.random() * 900000);
    await conn.query(
      `INSERT INTO stock_movements (id,movementId,productId,movementType,quantityIn,referenceId,referenceType,createdBy)
       VALUES (?,?,?,?,?,?,?,?)`,
      [uuidv4(), movementId, batch.productId, 'PRODUCTION', Number(quantityCompleted), batch.batchId, 'PRODUCTION_BATCH', req.user.id]
    );

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'failed' });
  } finally {
    conn.release();
  }
}

/**
 * POST /api/production/:id/qc
 * Checker runs QC. They submit defective numbers and pass/fail.
 * body: { quantityDefective, quantityWasted, qualityCheckPassed }
 *
 * THIS endpoint will update the batch and also update inventory + stock_movements:
 * - increase inventory.quantityDamaged by quantityDefective
 * - increase inventory.quantityAvailable by (quantityCompleted - defective - wasted)
 * - add two stock_movements: PRODUCTION (in usable qty), ADJUSTMENT (defective->damaged)
 */
async function qcBatch(req, res) {
  const id = req.params.id;
  const { quantityDefective = 0, quantityWasted = 0, qualityCheckPassed = false } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[batch]] = await conn.query('SELECT * FROM production_batches WHERE id = ? FOR UPDATE', [id]);
    if (!batch) throw new Error('Batch not found');

    if (batch.status !== 'COMPLETED' && batch.status !== 'IN_PROGRESS') {
      // we allow QC only after production completed (option A - per your request)
      return res.status(400).json({ error: 'Batch must be completed (produced) before QC' });
    }

    const produced = Number(batch.quantityCompleted || 0);
    const defective = Number(quantityDefective);
    const wasted = Number(quantityWasted);
    const usable = Math.max(0, produced - defective - wasted);

    // update batch
    await conn.query(
      `UPDATE production_batches SET quantityDefective=?, quantityWasted=?, qualityCheckPassed=?, updatedAt=NOW() WHERE id=?`,
      [defective, wasted, qualityCheckPassed ? 1 : 0, id]
    );

    // find inventory row for the product
    const [[inv]] = await conn.query('SELECT * FROM inventory WHERE productId = ? FOR UPDATE', [batch.productId]);

    if (!inv) {
      // create an inventory record if absent (you may prefer to require inventory row)
      const newInvId = uuidv4();
      await conn.query(
        `INSERT INTO inventory (id,productId,quantityAvailable,quantityReserved,quantityDamaged,lastStockCountDate) VALUES (?,?,?,?,?,?)`,
        [newInvId, batch.productId, usable, 0, defective, new Date()]
      );
    } else {
      // update inventory atomically
      const newAvailable = Math.max(0, (inv.quantityAvailable || 0) + usable);
      const newDamaged = Math.max(0, (inv.quantityDamaged || 0) + defective);
      await conn.query(
        `UPDATE inventory SET quantityAvailable=?, quantityDamaged=?, lastStockCountDate=? WHERE id=?`,
        [newAvailable, newDamaged, new Date(), inv.id]
      );
    }

    // add stock movement: usable produced
    await conn.query(
      `INSERT INTO stock_movements (id,movementId,productId,movementType,quantityIn,referenceId,referenceType,notes,createdBy)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [uuidv4(), 'MV-' + Math.floor(Math.random()*900000), batch.productId, 'PRODUCTION', usable, batch.batchId, 'PRODUCTION_QC', `usable after QC: ${usable}`, req.user.id]
    );

    // add stock movement: defective -> damaged (adjustment)
    if (defective > 0) {
      await conn.query(
        `INSERT INTO stock_movements (id,movementId,productId,movementType,quantityOut,referenceId,referenceType,notes,createdBy)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [uuidv4(), 'MV-' + Math.floor(Math.random()*900000), batch.productId, 'ADJUSTMENT', defective, batch.batchId, 'PRODUCTION_QC', `defective moved to damaged`, req.user.id]
      );
    }

    // commit
    await conn.commit();
    res.json({ ok: true, usable, defective, wasted });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'qc failed' });
  } finally {
    conn.release();
  }
}

module.exports = { createBatch, markProduced, qcBatch };
