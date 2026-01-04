import express from 'express';
import { supabase } from '../supabase.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select('*, yards(name)')
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching barns:', error);
    res.status(500).json({ error: 'Failed to fetch barns' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('barns')
      .select('*, yards(name)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Barn not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching barn:', error);
    res.status(500).json({ error: 'Failed to fetch barn' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('barns')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating barn:', error);
    res.status(500).json({ error: 'Failed to create barn' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('barns')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating barn:', error);
    res.status(500).json({ error: 'Failed to update barn' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('barns')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting barn:', error);
    res.status(500).json({ error: 'Failed to delete barn' });
  }
});

export default router;
