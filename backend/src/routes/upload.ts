import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import prisma from '../utils/prisma';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /\.(png|jpg|jpeg|gif|pdf|doc|docx|xlsx|csv|txt)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

router.post('/:taskId', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = req.user!.id;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return res.status(404).json({ error: 'Task not found', status: 404, timestamp: new Date().toISOString() });
  }

  if (task.userId !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden', status: 403, timestamp: new Date().toISOString() });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file provided', status: 400, timestamp: new Date().toISOString() });
  }

  const attachment = await prisma.attachment.create({
    data: {
      taskId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.filename
    }
  });

  res.status(201).json({ data: attachment });
});

router.get('/:taskId', requireAuth, async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = req.user!.id;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return res.status(404).json({ error: 'Task not found', status: 404, timestamp: new Date().toISOString() });
  }

  if (task.userId !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden', status: 403, timestamp: new Date().toISOString() });
  }

  const attachments = await prisma.attachment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: attachments });
});

router.delete('/:attachmentId', requireAuth, async (req: Request, res: Response) => {
  const { attachmentId } = req.params;

  const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) {
    return res.status(404).json({ error: 'Attachment not found', status: 404, timestamp: new Date().toISOString() });
  }

  const task = await prisma.task.findUnique({ where: { id: attachment.taskId } });
  if (!task) return res.status(404).json({ error: 'Task not found', status: 404, timestamp: new Date().toISOString() });
  if (task.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden', status: 403, timestamp: new Date().toISOString() });
  }

  const filePath = path.join(uploadDir, attachment.path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.attachment.delete({ where: { id: attachmentId } });

  res.json({ message: 'Attachment deleted' });
});

export default router;
