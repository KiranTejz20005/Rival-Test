import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Admin Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;

  const createAdminAndLogin = async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'admin@test.com', password: 'AdminPass123!' });
    const id = res.body.data.user.id;
    await prisma.user.update({ where: { id }, data: { role: 'ADMIN' } });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'AdminPass123!' });
    return { token: loginRes.body.data.accessToken, id };
  };

  const createUserAndLogin = async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'user@test.com', password: 'UserPass123!' });
    return { token: res.body.data.accessToken, id: res.body.data.user.id };
  };

  beforeEach(async () => {
    await prisma.activityLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const admin = await createAdminAndLogin();
    adminToken = admin.token;
    adminId = admin.id;

    const user = await createUserAndLogin();
    userToken = user.token;
    userId = user.id;

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'User task 1', status: 'TODO' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'User task 2', status: 'DONE' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/admin/stats', () => {
    it('returns stats for admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalTasks');
      expect(res.body.data).toHaveProperty('completedTasks');
      expect(res.body.data).toHaveProperty('pendingTasks');
      expect(res.body.data).toHaveProperty('overdueTasks');
    });

    it('rejects non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/admin/stats');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/users', () => {
    it('lists all users for admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(2);
      expect(res.body.data.total).toBe(2);
    });

    it('rejects non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('supports search by email', async () => {
      const res = await request(app)
        .get('/api/admin/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(1);
      expect(res.body.data.users[0].email).toContain('admin');
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('returns user details for admin', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('user@test.com');
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('rejects non-admin users', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/users/:id/tasks', () => {
    it('returns user tasks for admin', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${userId}/tasks`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(2);
      expect(res.body.data.total).toBe(2);
    });
  });

  describe('PATCH /api/admin/users/:id', () => {
    it('allows admin to update user role', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'ADMIN' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('allows admin to deactivate user', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('allows admin to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('prevents admin from deleting themselves', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cannot delete yourself');
    });
  });

  describe('GET /api/admin/activity', () => {
    it('returns activity logs for admin', async () => {
      const res = await request(app)
        .get('/api/admin/activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.length).toBeGreaterThan(0);
      expect(res.body.data).toHaveProperty('total');
    });
  });
});