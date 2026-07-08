import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncWrapper } from '../middlewares/async-wrapper';

const router = Router();

router.post('/login', asyncWrapper(AuthController.login));
router.post('/register', asyncWrapper(AuthController.register));
router.get('/me', authenticate, AuthController.me);

export default router;
