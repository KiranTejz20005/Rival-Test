import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

describe('JWT Utilities', () => {
  const userId = '123-abc';
  const email = 'test@example.com';
  const role = 'USER';

  it('generateAccessToken should return a valid JWT', () => {
    const token = generateAccessToken(userId, email, role);
    expect(typeof token).toBe('string');
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });

  it('verifyAccessToken should verify signature and return claims', () => {
    const token = generateAccessToken(userId, email, role);
    const claims = verifyAccessToken(token);
    expect(claims.sub).toBe(userId);
    expect(claims.email).toBe(email);
    expect(claims.role).toBe(role);
    expect(claims.exp).toBeDefined();
  });

  it('generateRefreshToken should return a valid JWT', () => {
    const token = generateRefreshToken(userId, email, role);
    expect(typeof token).toBe('string');
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });

  it('verifyRefreshToken should verify signature and return claims', () => {
    const token = generateRefreshToken(userId, email, role);
    const claims = verifyRefreshToken(token);
    expect(claims.sub).toBe(userId);
    expect(claims.email).toBe(email);
    expect(claims.role).toBe(role);
    expect(claims.exp).toBeDefined();
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });
});
