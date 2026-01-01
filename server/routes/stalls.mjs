import express from 'express';
import {
  getAllStalls,
  getStallById,
  createStall,
  updateStall,
  deleteStall,
  getActiveAssignmentsByStallId,
  getSensorsByStallId,
  getCamerasByStallId
} from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const stalls = await getAllStalls();
    res.json(stalls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const stall = await getStallById(req.params.id);
    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' });
    }

    const assignments = await getActiveAssignmentsByStallId(req.params.id);
    const sensors = await getSensorsByStallId(req.params.id);
    const cameras = await getCamerasByStallId(req.params.id);

    res.json({ ...stall, assignments, sensors, cameras });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const stall = await createStall(req.body);
    res.status(201).json(stall);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await updateStall(req.params.id, req.body);
    const stall = await getStallById(req.params.id);
    res.json(stall);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await deleteStall(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
