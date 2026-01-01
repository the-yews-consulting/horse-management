import express from 'express';
import { getAllVets, getVetById, createVet, updateVet, deleteVet } from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const vets = await getAllVets();
    res.json(vets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vet = await getVetById(req.params.id);
    if (!vet) {
      return res.status(404).json({ error: 'Vet not found' });
    }
    res.json(vet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const vet = await createVet(req.body);
    res.status(201).json(vet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await updateVet(req.params.id, req.body);
    const vet = await getVetById(req.params.id);
    res.json(vet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await deleteVet(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
