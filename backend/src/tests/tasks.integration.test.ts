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
      expect(res.body.data.tasks.every((t: any) => t.status === 'TODO')).toBe(true);
      expect(res.body.data.tasks.length).toBe(1);
    });
  });
});
