import express from 'express';
import { supabase } from '../supabase.mjs';
import { authenticateToken } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('floorplans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching floorplans:', error);
    res.status(500).json({ error: 'Failed to fetch floorplans' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('floorplans')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching floorplan:', error);
    res.status(500).json({ error: 'Failed to fetch floorplan' });
  }
});

router.post('/', async (req, res) => {
  try {
    const floorplan = {
      ...req.body,
      created_by: req.user.id,
    };

    const { data, error } = await supabase
      .from('floorplans')
      .insert([floorplan])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error creating floorplan:', error);
    res.status(500).json({ error: 'Failed to create floorplan' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('floorplans')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('created_by', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating floorplan:', error);
    res.status(500).json({ error: 'Failed to update floorplan' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('floorplans')
      .delete()
      .eq('id', req.params.id)
      .eq('created_by', req.user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting floorplan:', error);
    res.status(500).json({ error: 'Failed to delete floorplan' });
  }
});

export default router;
