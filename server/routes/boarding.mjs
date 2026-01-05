import express from 'express';
import { createBoardingAssignment, getAllActiveBoardingAssignments } from '../database.mjs';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const assignments = await getAllActiveBoardingAssignments();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const assignment = await createBoardingAssignment(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
