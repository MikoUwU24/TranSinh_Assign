import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncWrapper } from '../middlewares/async-wrapper';

const router = Router();
const controller = new SubmissionController();

// Both admin and sw can check submissions list (sw filtered automatically, admin sees all)
router.get('/', authenticate, requireRole('admin', 'sw'), asyncWrapper(controller.listSubmissions));

export default router;
