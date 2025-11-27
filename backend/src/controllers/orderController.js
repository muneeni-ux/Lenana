const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * PUT /api/orders/:id/approve
 * Checker approves an order and optionally assign driver:
 * body: { driverId (optional), vehicle_reg (optional), assignDelivery: boolean }
 */
async function approveOrder(req, res) {
  const id = req.params.id;
  const { driverId, vehicle_reg, assignDelivery } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // mark approved
    await conn.query(
      `UPDATE orders SET status='APPROVED', approvedBy=?, approvalDate=NOW(), updatedAt=NOW() WHERE id=?`,
      [req.user.id, id]
    );

    if (assignDelivery && driverId) {
      // create delivery record
      // fetch driver info & order denormalized client
      const [[driver]] = await conn.query('SELECT * FROM users WHERE id=?', [driverId]);
      const [[order]] = await conn.query('SELECT * FROM orders WHERE id=?', [id]);
      const delId = uuidv4();
      await conn.query(
        `INSERT INTO deliveries (id, order_id, client_name, delivery_date, status, driver_id, driver_name, vehicle_reg)
         VALUES (?,?,?,?,?,?,?,?)`,
        [delId, id, order.clientId /* optionally denormalize name */, order.deliveryDate, 'PENDING', driverId, driver ? (driver.firstName + ' ' + driver.lastName) : '', vehicle_reg || '']
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

module.exports = { approveOrder };
