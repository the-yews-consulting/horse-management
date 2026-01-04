import express from 'express';
import { supabase } from '../supabase.mjs';
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

router.get('/:listType', async (req, res) => {
  try {
    const table = validateListType(req.params.listType);
    let orderBy;

    if (table === 'horse_colours') {
      orderBy = { column: 'abbreviation', ascending: true };
    } else if (table === 'horse_statuses') {
      orderBy = { column: 'description', ascending: true };
    } else {
      orderBy = { column: 'abbreviation', ascending: true };
    }

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const formattedData = data.map(row => ({
      ...row,
      isDefault: row.is_default,
      isDead: row.is_dead,
      selectedByDefault: row.selected_by_default
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching list items:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:listType', async (req, res) => {
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

    if (isDefault) {
      await supabase
        .from(table)
        .update({ is_default: false });
    }

    let insertData;
    if (isStatusTable) {
      insertData = {
        description,
        is_default: isDefault || false,
        is_dead: isDead || false,
        selected_by_default: selectedByDefault !== undefined ? selectedByDefault : true
      };
    } else if (isColourTable) {
      insertData = {
        name,
        abbreviation,
        is_default: isDefault || false
      };
    } else {
      insertData = {
        name,
        abbreviation,
        is_default: isDefault || false
      };
    }

    const { data, error } = await supabase
      .from(table)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      ...data,
      isDefault: data.is_default,
      isDead: data.is_dead,
      selectedByDefault: data.selected_by_default
    });
  } catch (error) {
    console.error('Error creating list item:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:listType/:id', async (req, res) => {
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
      await supabase
        .from(table)
        .update({ is_default: false });
    }

    let updateData;
    if (isStatusTable) {
      updateData = {
        description,
        is_default: isDefault || false,
        is_dead: isDead || false,
        selected_by_default: selectedByDefault !== undefined ? selectedByDefault : true
      };
    } else if (isColourTable) {
      updateData = {
        name,
        abbreviation,
        is_default: isDefault || false
      };
    } else {
      updateData = {
        name,
        abbreviation,
        is_default: isDefault || false
      };
    }

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      ...data,
      isDefault: data.is_default,
      isDead: data.is_dead,
      selectedByDefault: data.selected_by_default
    });
  } catch (error) {
    console.error('Error updating list item:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:listType/:id', async (req, res) => {
  try {
    const table = validateListType(req.params.listType);
    const { id } = req.params;

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting list item:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
