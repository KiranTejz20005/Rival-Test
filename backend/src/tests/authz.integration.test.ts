import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authorization & Penetration Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userATaskId: string;

  beforeEach(async () => {
    await prisma.activityLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const userARes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'usera@test.com', password: 'UserAPass1!' });
    userAToken = userARes.body.data.accessToken;
    userAId = userARes.body.data.user.id;

    const userBRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'userb@test.com', password: 'UserBPass1!' });
    userBToken = userBRes.body.data.accessToken;

    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'User A Private Task', priority: 'HIGH' });
    userATaskId = taskRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User B cannot access User A tasks', () => {
    it('GET /api/tasks/:id - returns 404 for other users task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('PATCH /api/tasks/:id - returns 404 for other users task', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked title' });

      expect(res.status).toBe(404);
    });

    it('DELETE /api/tasks/:id - returns 404 for other users task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('GET /api/tasks - does not include other users tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(0);
    });
  });

  describe('Token tampering and invalid tokens', () => {
    it('rejects requests without token', async () => {
      const res = await request(app)
        .get('/api/tasks');

      expect(res.status).toBe(401);
    });

    it('rejects requests with malformed token', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('rejects requests with tampered token', async () => {
      const tamperedToken = userAToken.slice(0, -5) + 'tamper';
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
    });

    it('rejects requests with empty authorization header', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
    });
  });

  describe('Refresh token rotation', () => {
    it('refresh endpoint returns new tokens', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'usera@test.com', password: 'UserAPass1!' });

      const refreshToken = loginRes.body.data.refreshToken;

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('rejects reused refresh tokens', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'usera@test.com', password: 'UserAPass1!' });

      const refreshToken = loginRes.body.data.refreshToken;

      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(401);
    });
  });

  describe('Logout flow', () => {
    it('logout invalidates refresh token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'usera@test.com', password: 'UserAPass1!' });

      const accessToken = loginRes.body.data.accessToken;
      const refreshToken = loginRes.body.data.refreshToken;

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(401);
    });
  });

  describe('Admin access control', () => {
    let adminToken: string;

    beforeEach(async () => {
      const adminRes = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'adminz@test.com', password: 'AdminPass1!' });
      const adminId = adminRes.body.data.user.id;
      await prisma.user.update({ where: { id: adminId }, data: { role: 'ADMIN' } });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'adminz@test.com', password: 'AdminPass1!' });
      adminToken = loginRes.body.data.accessToken;
    });

    it('admin can access any task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('User A Private Task');
    });

    it('admin can view all users tasks via allUsers flag', async () => {
      const res = await request(app)
        .get('/api/tasks?allUsers=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBeGreaterThan(0);
    });

    it('regular user cannot access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });
  });
});