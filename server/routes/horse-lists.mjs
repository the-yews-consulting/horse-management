import express from 'express';
import crypto from 'crypto';
import { db } from '../database.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

const TABLES = {
  breeds: 'horse_breeds',
  colours: 'horse_colours',
  genders: 'horse_genders'
};

function validateListType(listType) {
  if (!TABLES[listType]) {
    throw new Error('Invalid list type');
  }
  return TABLES[listType];
}

router.get('/:listType', (req, res) => {
  try {
    const table = validateListType(req.params.listType);
    const columns = table === 'horse_colours'
      ? 'id, name, abbreviation, description, is_default as isDefault, created_at, updated_at'
      : 'id, name, abbreviation, is_default as isDefault, created_at, updated_at';

    db.all(`
      SELECT ${columns}
      FROM ${table}
      ORDER BY abbreviation ASC
    `, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows.map(row => ({
        ...row,
        isDefault: row.isDefault === 1
      })));
    });
  } catch (error) {
    console.error('Error fetching list items:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:listType', (req, res) => {
  try {
    const table = validateListType(req.params.listType);
    const { name, abbreviation, description, isDefault } = req.body;

    if (!name || !abbreviation) {
      return res.status(400).json({ error: 'Name and abbreviation are required' });
    }

    const id = crypto.randomUUID();

    if (isDefault) {
      db.run(`UPDATE ${table} SET is_default = 0`, (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
    }

    const isColourTable = table === 'horse_colours';
    const insertQuery = isColourTable
      ? `INSERT INTO ${table} (id, name, abbreviation, description, is_default) VALUES (?, ?, ?, ?, ?)`
      : `INSERT INTO ${table} (id, name, abbreviation, is_default) VALUES (?, ?, ?, ?)`;
    const insertParams = isColourTable
      ? [id, name, abbreviation, description || name, isDefault ? 1 : 0]
      : [id, name, abbreviation, isDefault ? 1 : 0];

    db.run(insertQuery, insertParams, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const selectColumns = isColourTable
        ? 'id, name, abbreviation, description, is_default as isDefault, created_at, updated_at'
        : 'id, name, abbreviation, is_default as isDefault, created_at, updated_at';

      db.get(`
        SELECT ${selectColumns}
        FROM ${table}
        WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          ...row,
          isDefault: row.isDefault === 1
        });
      });
    });
  } catch (error) {
    console.error('Error creating list item:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:listType/:id', (req, res) => {
  try {
    const table = validateListType(req.params.listType);
    const { id } = req.params;
    const { name, abbreviation, description, isDefault } = req.body;

    if (!name || !abbreviation) {
      return res.status(400).json({ error: 'Name and abbreviation are required' });
    }

    if (isDefault) {
      db.run(`UPDATE ${table} SET is_default = 0`, (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
    }

    const isColourTable = table === 'horse_colours';
    const updateQuery = isColourTable
      ? `UPDATE ${table} SET name = ?, abbreviation = ?, description = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      : `UPDATE ${table} SET name = ?, abbreviation = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const updateParams = isColourTable
      ? [name, abbreviation, description || name, isDefault ? 1 : 0, id]
      : [name, abbreviation, isDefault ? 1 : 0, id];

    db.run(updateQuery, updateParams, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const selectColumns = isColourTable
        ? 'id, name, abbreviation, description, is_default as isDefault, created_at, updated_at'
        : 'id, name, abbreviation, is_default as isDefault, created_at, updated_at';

      db.get(`
        SELECT ${selectColumns}
        FROM ${table}
        WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          ...row,
          isDefault: row.isDefault === 1
        });
      });
    });
  } catch (error) {
    console.error('Error updating list item:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:listType/:id', (req, res) => {
  try {
    const table = validateListType(req.params.listType);
    const { id } = req.params;

    db.run(`DELETE FROM ${table} WHERE id = ?`, [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error deleting list item:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
