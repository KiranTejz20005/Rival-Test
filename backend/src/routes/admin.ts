import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorize';
import { validate, validateParam } from '../middleware/validation';
import { uuidParam, paginationSchema, adminCreateUserSchema, adminBatchUsersSchema, adminUpdateUserSchema } from '../utils/validators';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.post('/users/batch', validate(adminBatchUsersSchema), adminController.createUsersBatch);
router.post('/users', validate(adminCreateUserSchema), adminController.createUser);
router.get('/users', validate(paginationSchema, 'query'), adminController.getUsers);
router.get('/users/:id', validateParam(uuidParam, 'id'), adminController.getUserById);
router.get('/users/:id/tasks', validateParam(uuidParam, 'id'), validate(paginationSchema, 'query'), adminController.getUserTasks);
router.patch('/users/:id', validateParam(uuidParam, 'id'), validate(adminUpdateUserSchema), adminController.updateUser);
router.delete('/users/:id', validateParam(uuidParam, 'id'), adminController.deleteUser);

router.get('/stats', adminController.getStats);
router.get('/activity', validate(paginationSchema, 'query'), adminController.getActivityLogs);
router.get('/auth-logs', validate(paginationSchema, 'query'), adminController.getAuthLogs);

export default router;