import { Router } from 'express';
import { FieldController } from '../controllers/field.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { asyncWrapper } from '../middlewares/async-wrapper';

// Using mergeParams: true to allow access to parent route params like :id
const router = Router({ mergeParams: true });
const controller = new FieldController();

router.use(authenticate);
router.use(requireRole('admin'));

router.post('/', asyncWrapper(controller.addField));
router.put('/reorder', asyncWrapper(controller.reorderFields));
router.put('/:fid', asyncWrapper(controller.updateField));
router.delete('/:fid', asyncWrapper(controller.deleteField));

export default router;
