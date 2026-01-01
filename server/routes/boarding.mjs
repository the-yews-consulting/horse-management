import express from 'express';
import { createBoardingAssignment } from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const assignment = await createBoardingAssignment(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
