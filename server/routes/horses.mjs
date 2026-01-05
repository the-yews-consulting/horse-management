import express from 'express';
import {
  getAllHorses,
  getHorseById,
  createHorse,
  updateHorse,
  deleteHorse,
  getActiveAssignmentByHorseId
} from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';
import { supabase } from '../supabase.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const horses = await getAllHorses();
    res.json(horses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Media routes (must come before /:id to avoid conflicts)
router.get('/:horseId/media', async (req, res) => {
  try {
    const { horseId } = req.params;

    const { data, error } = await supabase
      .from('horse_media')
      .select('*')
      .eq('horse_id', horseId)
      .order('date_taken', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:horseId/media/:mediaId', async (req, res) => {
  try {
    const { horseId, mediaId } = req.params;

    const { data, error } = await supabase
      .from('horse_media')
      .select('*')
      .eq('id', mediaId)
      .eq('horse_id', horseId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:horseId/media', async (req, res) => {
  try {
    const { horseId } = req.params;
    const mediaData = req.body;

    const { data, error } = await supabase
      .from('horse_media')
      .insert({
        horse_id: horseId,
        media_type: mediaData.media_type,
        file_url: mediaData.file_url,
        thumbnail_url: mediaData.thumbnail_url,
        title: mediaData.title,
        description: mediaData.description,
        date_taken: mediaData.date_taken,
        is_private: mediaData.is_private || false,
        duration: mediaData.duration,
        width: mediaData.width,
        height: mediaData.height,
        file_size: mediaData.file_size
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:horseId/media/:mediaId', async (req, res) => {
  try {
    const { horseId, mediaId } = req.params;
    const updates = req.body;

    const updateData = {};
    if (updates.file_url !== undefined) updateData.file_url = updates.file_url;
    if (updates.thumbnail_url !== undefined) updateData.thumbnail_url = updates.thumbnail_url;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date_taken !== undefined) updateData.date_taken = updates.date_taken;
    if (updates.is_private !== undefined) updateData.is_private = updates.is_private;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.width !== undefined) updateData.width = updates.width;
    if (updates.height !== undefined) updateData.height = updates.height;
    if (updates.file_size !== undefined) updateData.file_size = updates.file_size;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('horse_media')
      .update(updateData)
      .eq('id', mediaId)
      .eq('horse_id', horseId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:horseId/media/:mediaId', async (req, res) => {
  try {
    const { horseId, mediaId } = req.params;

    const { error } = await supabase
      .from('horse_media')
      .delete()
      .eq('id', mediaId)
      .eq('horse_id', horseId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const horse = await getHorseById(req.params.id);
    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    const assignment = await getActiveAssignmentByHorseId(req.params.id);
    res.json({ ...horse, current_stall: assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Received horse creation request:', req.body);
    console.log('User:', req.user);
    const horse = await createHorse(req.body);
    console.log('Horse created successfully:', horse);
    res.status(201).json(horse);
  } catch (error) {
    console.error('Error creating horse:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Updating horse:', req.params.id, req.body);
    await updateHorse(req.params.id, req.body);
    const horse = await getHorseById(req.params.id);
    console.log('Horse updated successfully:', horse);
    res.json(horse);
  } catch (error) {
    console.error('Error updating horse:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await deleteHorse(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
