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
    db.all(`
      SELECT id, name, abbreviation, is_default as isDefault, created_at, updated_at
      FROM ${table}
      ORDER BY name ASC
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
    const { name, abbreviation, isDefault } = req.body;

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

    db.run(`
      INSERT INTO ${table} (id, name, abbreviation, is_default)
      VALUES (?, ?, ?, ?)
    `, [id, name, abbreviation, isDefault ? 1 : 0], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get(`
        SELECT id, name, abbreviation, is_default as isDefault, created_at, updated_at
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
    const { name, abbreviation, isDefault } = req.body;

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

    db.run(`
      UPDATE ${table}
      SET name = ?, abbreviation = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, abbreviation, isDefault ? 1 : 0, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get(`
        SELECT id, name, abbreviation, is_default as isDefault, created_at, updated_at
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
