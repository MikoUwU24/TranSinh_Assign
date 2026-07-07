import { Router } from 'express';
import { FormController } from '../controllers/form.controller';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncWrapper } from '../middlewares/async-wrapper';

const router = Router();
const controller = new FormController();
const submissionController = new SubmissionController();

// Forms Active (used by SW) - must define before /:id route
router.get('/active', authenticate, requireRole('admin', 'sw'), asyncWrapper(controller.getActiveForms));

// SW / Admin submit form
router.post('/:id/submit', authenticate, requireRole('admin', 'sw'), asyncWrapper(submissionController.submitForm));

// Admin-only endpoints
router.get('/', authenticate, requireRole('admin'), asyncWrapper(controller.getAllForms));
router.post('/', authenticate, requireRole('admin'), asyncWrapper(controller.createForm));
router.put('/:id', authenticate, requireRole('admin'), asyncWrapper(controller.updateForm));
router.delete('/:id', authenticate, requireRole('admin'), asyncWrapper(controller.deleteForm));

// Detail endpoint (SW and Admin need to view form schema to render/manage it)
router.get('/:id', authenticate, requireRole('admin', 'sw'), asyncWrapper(controller.getFormById));

export default router;
