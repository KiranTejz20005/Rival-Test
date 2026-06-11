import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';
import { validate, validateParam } from '../middleware/validation';
import { taskCreateSchema, taskUpdateSchema, uuidParam, paginationSchema } from '../utils/validators';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', validate(taskCreateSchema), tasksController.createTask);
router.get('/', validate(paginationSchema, 'query'), tasksController.getTasks);
router.get('/:id', validateParam(uuidParam, 'id'), tasksController.getTask);
router.get('/:id/activity', validateParam(uuidParam, 'id'), tasksController.getTaskActivity);
router.patch('/:id', validateParam(uuidParam, 'id'), validate(taskUpdateSchema), tasksController.updateTask);
router.delete('/:id', validateParam(uuidParam, 'id'), tasksController.deleteTask);

export default router;
