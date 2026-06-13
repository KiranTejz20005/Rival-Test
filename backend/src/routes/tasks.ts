import { Router, Request, Response } from 'express';
import * as tasksController from '../controllers/tasksController';
import { validate, validateParam } from '../middleware/validation';
import { taskCreateSchema, taskUpdateSchema, uuidParam, paginationSchema } from '../utils/validators';
import { requireAuth } from '../middleware/auth';
import { verifyAccessToken } from '../utils/jwt';
import { addClient } from '../utils/sse';

const router = Router();

router.get('/events', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = (req.query.token as string) || (authHeader && authHeader.split(' ')[1]);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized', status: 401, timestamp: new Date().toISOString() });
    return;
  }
  try {
    const decoded = verifyAccessToken(token);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('event: connected\ndata: {}\n\n');
    addClient(`sse-${Date.now()}`, decoded.sub, res);
  } catch {
    res.status(401).json({ error: 'Invalid token', status: 401, timestamp: new Date().toISOString() });
  }
});

router.use(requireAuth);

router.post('/', validate(taskCreateSchema), tasksController.createTask);
router.get('/', validate(paginationSchema, 'query'), tasksController.getTasks);
router.get('/:id', validateParam(uuidParam, 'id'), tasksController.getTask);
router.get('/:id/activity', validateParam(uuidParam, 'id'), tasksController.getTaskActivity);
router.patch('/:id', validateParam(uuidParam, 'id'), validate(taskUpdateSchema), tasksController.updateTask);
router.delete('/:id', validateParam(uuidParam, 'id'), tasksController.deleteTask);

export default router;
