import express from 'express';
import { supabase } from '../supabase.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: stalls, error: stallsError } = await supabase
      .from('stalls')
      .select('*')
      .order('name');

    if (stallsError) throw stallsError;

    const { data: barns } = await supabase
      .from('barns')
      .select('id, name');

    const { data: yards } = await supabase
      .from('yards')
      .select('id, name');

    const barnsMap = (barns || []).reduce((acc, barn) => {
      acc[barn.id] = barn;
      return acc;
    }, {});

    const yardsMap = (yards || []).reduce((acc, yard) => {
      acc[yard.id] = yard;
      return acc;
    }, {});

    const enrichedStalls = stalls.map(stall => ({
      ...stall,
      barns: stall.barn_id ? barnsMap[stall.barn_id] : null,
      yards: stall.paddock_id ? yardsMap[stall.paddock_id] : null
    }));

    res.json(enrichedStalls);
  } catch (error) {
    console.error('Error fetching stalls:', error);
    res.status(500).json({ error: 'Failed to fetch stalls' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: stall, error: stallError } = await supabase
      .from('stalls')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (stallError) throw stallError;
    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' });
    }

    if (stall.barn_id) {
      const { data: barn } = await supabase
        .from('barns')
        .select('id, name')
        .eq('id', stall.barn_id)
        .maybeSingle();
      stall.barns = barn;
    }

    if (stall.paddock_id) {
      const { data: yard } = await supabase
        .from('yards')
        .select('id, name')
        .eq('id', stall.paddock_id)
        .maybeSingle();
      stall.yards = yard;
    }

    res.json(stall);
  } catch (error) {
    console.error('Error fetching stall:', error);
    res.status(500).json({ error: 'Failed to fetch stall' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating stall:', error);
    res.status(500).json({ error: 'Failed to create stall' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating stall:', error);
    res.status(500).json({ error: 'Failed to update stall' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('stalls')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting stall:', error);
    res.status(500).json({ error: 'Failed to delete stall' });
  }
});

export default router;
