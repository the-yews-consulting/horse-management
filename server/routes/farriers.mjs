import express from 'express';
import { getAllFarriers, getFarrierById, createFarrier, updateFarrier, deleteFarrier } from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const farriers = await getAllFarriers();
    res.json(farriers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const farrier = await getFarrierById(req.params.id);
    if (!farrier) {
      return res.status(404).json({ error: 'Farrier not found' });
    }
    res.json(farrier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const farrier = await createFarrier(req.body);
    res.status(201).json(farrier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await updateFarrier(req.params.id, req.body);
    const farrier = await getFarrierById(req.params.id);
    res.json(farrier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await deleteFarrier(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
