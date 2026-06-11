import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorize';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.post('/users/batch', adminController.createUsersBatch);
router.post('/users', adminController.createUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.get('/users/:id/tasks', adminController.getUserTasks);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivityLogs);
router.get('/auth-logs', adminController.getAuthLogs);

export default router;