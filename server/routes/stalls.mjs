import express from 'express';
import { supabase } from '../supabase.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .select('*, barns(name), yards(name)')
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching stalls:', error);
    res.status(500).json({ error: 'Failed to fetch stalls' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .select('*, barns(name), yards(name)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Stall not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching stall:', error);
    res.status(500).json({ error: 'Failed to fetch stall' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { data: insertData, error: insertError } = await supabase
      .from('stalls')
      .insert([req.body])
      .select()
      .single();

    if (insertError) throw insertError;

    const { data, error } = await supabase
      .from('stalls')
      .select('*, barns(name), yards(name)')
      .eq('id', insertData.id)
      .maybeSingle();

    if (error) throw error;
    res.status(201).json(data || insertData);
  } catch (error) {
    console.error('Error creating stall:', error);
    res.status(500).json({ error: 'Failed to create stall' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error: updateError } = await supabase
      .from('stalls')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    const { data, error } = await supabase
      .from('stalls')
      .select('*, barns(name), yards(name)')
      .eq('id', req.params.id)
      .maybeSingle();

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
