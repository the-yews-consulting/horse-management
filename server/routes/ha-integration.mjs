import express from 'express';
import {
  linkSensorToStall,
  unlinkSensor,
  linkCameraToStall,
  unlinkCamera
} from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.post('/sensors/link', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const sensor = await linkSensorToStall(req.body);
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/sensors/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await unlinkSensor(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cameras/link', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const camera = await linkCameraToStall(req.body);
    res.status(201).json(camera);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/cameras/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await unlinkCamera(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
