const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productionController');
const { requireRole } = require('../middleware/auth');

// maker creates batch
router.post('/', requireRole(['MAKER','OWNER']), ctrl.createBatch);

// maker marks produced (must be maker/owner who owns batch)
router.post('/:id/mark-produced', requireRole(['MAKER','OWNER']), ctrl.markProduced);

// checker does QC
router.post('/:id/qc', requireRole(['CHECKER','OWNER']), ctrl.qcBatch);

module.exports = router;
