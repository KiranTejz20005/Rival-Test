import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/signup', () => {
    it('creates user with valid email and password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'TestPassword123!' });
      
      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ password: 'TestPassword123!' });
      expect(res.status).toBe(400);
    });

    it('rejects missing password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'nopass@example.com' });
      expect(res.status).toBe(400);
    });

    it('rejects weak password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'weak@example.com', password: 'short' });
      expect(res.status).toBe(400);
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'TestPassword123!' });
      
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'TestPassword123!' });
      
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup')
        .send({ email: 'login@example.com', password: 'LoginPass123!' });
    });

    it('returns tokens for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'LoginPass123!' });
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrong' });
      
      expect(res.status).toBe(401);
    });

    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'LoginPass123!' });
      expect(res.status).toBe(400);
    });

    it('rejects missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'me@example.com', password: 'MePass123!' });
      accessToken = res.body.data.accessToken;
    });

    it('returns current user for authenticated request', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('me@example.com');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('role');
    });

    it('rejects without authentication', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });
});
