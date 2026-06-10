import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';

describe('Password Utilities', () => {
  it('hashPassword should return a hashed string different from input', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(typeof hash).toBe('string');
  });

  it('comparePassword should return true for matching password', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);
  });

  it('comparePassword should return false for incorrect password', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword('wrongpassword', hash);
    expect(isMatch).toBe(false);
  });

  it('validatePasswordStrength should accept valid passwords', () => {
    expect(validatePasswordStrength('Test@1234')).toBe(true);
    expect(validatePasswordStrength('StrongPass1')).toBe(true);
  });

  it('validatePasswordStrength should reject weak passwords', () => {
    expect(validatePasswordStrength('weak')).toBe(false);
    expect(validatePasswordStrength('nouppercase1')).toBe(false);
    expect(validatePasswordStrength('NOLOWERCASE1')).toBe(false);
    expect(validatePasswordStrength('NoNumbersHere')).toBe(false);
  });
});
