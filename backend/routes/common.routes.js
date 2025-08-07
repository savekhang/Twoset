const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/locations
router.get('/locations', async (req, res) => {
  const [rows] = await db.execute('SELECT id, name FROM locations');
  res.json(rows);
});

// GET /api/interests
router.get('/interests', async (req, res) => {
  const [rows] = await db.execute('SELECT id, name, icon FROM interests');
  res.json(rows);
});

module.exports = router;
