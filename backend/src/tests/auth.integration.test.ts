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
  });
});
