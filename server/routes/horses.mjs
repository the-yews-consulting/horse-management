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
    await updateHorse(req.params.id, req.body);
    const horse = await getHorseById(req.params.id);
    res.json(horse);
  } catch (error) {
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
