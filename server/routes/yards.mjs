import express from 'express';
import { supabase } from '../supabase.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('yards')
      .select('*, farms(name)')
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching yards:', error);
    res.status(500).json({ error: 'Failed to fetch yards' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('yards')
      .select('*, farms(name)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Yard not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching yard:', error);
    res.status(500).json({ error: 'Failed to fetch yard' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('yards')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating yard:', error);
    res.status(500).json({ error: 'Failed to create yard' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('yards')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating yard:', error);
    res.status(500).json({ error: 'Failed to update yard' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('yards')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting yard:', error);
    res.status(500).json({ error: 'Failed to delete yard' });
  }
});

export default router;
