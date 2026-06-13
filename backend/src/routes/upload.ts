import { Router, Request, Response, NextFunction } from 'express';
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

const allowedExtensions = /\.(png|jpg|jpeg|gif|pdf|doc|docx|xlsx|csv|txt)$/i;
const allowedMimes = [
  'image/png', 'image/jpeg', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv', 'text/plain'
];

const fileFilter = (_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedExtensions.test(path.extname(file.originalname)) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PNG, JPG, GIF, PDF, DOC, DOCX, XLSX, CSV, TXT'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

function handleMulterError(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File too large. Maximum size is 10 MB',
      LIMIT_FILE_COUNT: 'Too many files',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field'
    };
    return res.status(400).json({
      error: messages[err.code] || err.message,
      status: 400,
      timestamp: new Date().toISOString()
    });
  }
  if (err instanceof Error) {
    return res.status(400).json({
      error: err.message,
      status: 400,
      timestamp: new Date().toISOString()
    });
  }
  next(err);
}

const router = Router();

router.post('/:taskId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, async (req: Request, res: Response) => {
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
