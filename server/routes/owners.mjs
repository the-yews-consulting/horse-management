import express from 'express';
import { getAllOwners, getOwnerById, createOwner, updateOwner, deleteOwner } from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const owners = await getAllOwners();
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const owner = await getOwnerById(req.params.id);
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const owner = await createOwner(req.body);
    res.status(201).json(owner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await updateOwner(req.params.id, req.body);
    const owner = await getOwnerById(req.params.id);
    res.json(owner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin', 'staff'), async (req, res) => {
  try {
    await deleteOwner(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
