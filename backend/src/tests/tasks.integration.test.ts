import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Tasks Endpoints', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.activityLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'tasks@example.com', password: 'TaskPass123!' });

    if (res.status !== 201) console.error("Tasks beforeEach signup failed:", res.status, res.body);
    token = res.body.data.accessToken;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/tasks', () => {
    it('creates task with valid data', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test task', priority: 'HIGH' });
      
      if (res.status !== 201) {
        console.log('Task creation failed response body:', res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test task');
    });

    it('rejects without authentication', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test task' });
      
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Todo Task', status: 'TODO' });
      
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Done Task', status: 'DONE' });
    });

    it('returns paginated tasks for authenticated user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(2);
      expect(res.body.data).toHaveProperty('total');
    });

    it('filters by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=TODO')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.every((t: { status: string }) => t.status === 'TODO')).toBe(true);
      expect(res.body.data.tasks.length).toBe(1);
    });

    it('rejects invalid UUID param format', async () => {
      const res = await request(app)
        .get('/api/tasks/invalid-uuid')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('rejects pageSize over 100', async () => {
      const res = await request(app)
        .get('/api/tasks?pageSize=999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks/:id/activity', () => {
    let taskId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Activity test task' });
      taskId = res.body.data.id;
    });

    it('returns activity for existing task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}/activity`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 404 for non-existent task UUID', async () => {
      const res = await request(app)
        .get('/api/tasks/00000000-0000-0000-0000-000000000000/activity')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('rejects without authentication', async () => {
      const res = await request(app).get(`/api/tasks/${taskId}/activity`);
      expect(res.status).toBe(401);
    });
  });
});
