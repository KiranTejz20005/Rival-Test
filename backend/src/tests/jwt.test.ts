import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken } from '../utils/jwt';

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

  it('hashToken should return deterministic SHA-256 hex', () => {
    const token = 'test-token-value';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashToken should produce different hashes for different inputs', () => {
    const hash1 = hashToken('token-a');
    const hash2 = hashToken('token-b');
    expect(hash1).not.toBe(hash2);
  });
});
