import express from 'express';
import crypto from 'crypto';
import { db } from '../database.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

const TABLES = {
  breeds: 'horse_breeds',
  colours: 'horse_colours',
  genders: 'horse_genders',
  statuses: 'horse_statuses'
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
    let columns, orderBy;

    if (table === 'horse_colours') {
      columns = 'id, name, abbreviation, description, is_default as isDefault, created_at, updated_at';
      orderBy = 'abbreviation ASC';
    } else if (table === 'horse_statuses') {
      columns = 'id, description, is_default as isDefault, is_dead as isDead, selected_by_default as selectedByDefault, created_at, updated_at';
      orderBy = 'description ASC';
    } else {
      columns = 'id, name, abbreviation, is_default as isDefault, created_at, updated_at';
      orderBy = 'abbreviation ASC';
    }

    db.all(`
      SELECT ${columns}
      FROM ${table}
      ORDER BY ${orderBy}
    `, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows.map(row => ({
        ...row,
        isDefault: row.isDefault === 1,
        isDead: row.isDead === 1,
        selectedByDefault: row.selectedByDefault === 1
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
    const { name, abbreviation, description, isDefault, isDead, selectedByDefault } = req.body;

    const isStatusTable = table === 'horse_statuses';
    const isColourTable = table === 'horse_colours';

    if (isStatusTable) {
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
    } else {
      if (!name || !abbreviation) {
        return res.status(400).json({ error: 'Name and abbreviation are required' });
      }
    }

    const id = crypto.randomUUID();

    if (isDefault) {
      db.run(`UPDATE ${table} SET is_default = 0`, (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
    }

    let insertQuery, insertParams;
    if (isStatusTable) {
      insertQuery = `INSERT INTO ${table} (id, description, is_default, is_dead, selected_by_default) VALUES (?, ?, ?, ?, ?)`;
      insertParams = [id, description, isDefault ? 1 : 0, isDead ? 1 : 0, selectedByDefault ? 1 : 0];
    } else if (isColourTable) {
      insertQuery = `INSERT INTO ${table} (id, name, abbreviation, description, is_default) VALUES (?, ?, ?, ?, ?)`;
      insertParams = [id, name, abbreviation, description || name, isDefault ? 1 : 0];
    } else {
      insertQuery = `INSERT INTO ${table} (id, name, abbreviation, is_default) VALUES (?, ?, ?, ?)`;
      insertParams = [id, name, abbreviation, isDefault ? 1 : 0];
    }

    db.run(insertQuery, insertParams, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let selectColumns;
      if (isStatusTable) {
        selectColumns = 'id, description, is_default as isDefault, is_dead as isDead, selected_by_default as selectedByDefault, created_at, updated_at';
      } else if (isColourTable) {
        selectColumns = 'id, name, abbreviation, description, is_default as isDefault, created_at, updated_at';
      } else {
        selectColumns = 'id, name, abbreviation, is_default as isDefault, created_at, updated_at';
      }

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
          isDefault: row.isDefault === 1,
          isDead: row.isDead === 1,
          selectedByDefault: row.selectedByDefault === 1
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
    const { name, abbreviation, description, isDefault, isDead, selectedByDefault } = req.body;

    const isStatusTable = table === 'horse_statuses';
    const isColourTable = table === 'horse_colours';

    if (isStatusTable) {
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
    } else {
      if (!name || !abbreviation) {
        return res.status(400).json({ error: 'Name and abbreviation are required' });
      }
    }

    if (isDefault) {
      db.run(`UPDATE ${table} SET is_default = 0`, (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
    }

    let updateQuery, updateParams;
    if (isStatusTable) {
      updateQuery = `UPDATE ${table} SET description = ?, is_default = ?, is_dead = ?, selected_by_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      updateParams = [description, isDefault ? 1 : 0, isDead ? 1 : 0, selectedByDefault ? 1 : 0, id];
    } else if (isColourTable) {
      updateQuery = `UPDATE ${table} SET name = ?, abbreviation = ?, description = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      updateParams = [name, abbreviation, description || name, isDefault ? 1 : 0, id];
    } else {
      updateQuery = `UPDATE ${table} SET name = ?, abbreviation = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      updateParams = [name, abbreviation, isDefault ? 1 : 0, id];
    }

    db.run(updateQuery, updateParams, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let selectColumns;
      if (isStatusTable) {
        selectColumns = 'id, description, is_default as isDefault, is_dead as isDead, selected_by_default as selectedByDefault, created_at, updated_at';
      } else if (isColourTable) {
        selectColumns = 'id, name, abbreviation, description, is_default as isDefault, created_at, updated_at';
      } else {
        selectColumns = 'id, name, abbreviation, is_default as isDefault, created_at, updated_at';
      }

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
          isDefault: row.isDefault === 1,
          isDead: row.isDead === 1,
          selectedByDefault: row.selectedByDefault === 1
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
