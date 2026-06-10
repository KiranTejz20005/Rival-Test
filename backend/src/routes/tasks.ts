import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';
import { validate } from '../middleware/validation';
import { taskCreateSchema, taskUpdateSchema } from '../utils/validators';
import { requireAuth } from '../middleware/auth';
import { canModifyTask } from '../middleware/authorize';

const router = Router();

router.use(requireAuth);

router.post('/', validate(taskCreateSchema), tasksController.createTask);
router.get('/', tasksController.getTasks);
router.get('/:id', tasksController.getTask);
router.patch('/:id', validate(taskUpdateSchema), tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

export default router;
