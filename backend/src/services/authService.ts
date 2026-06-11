import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt';

const prisma = new PrismaClient();

async function logAuthAction(email: string, action: string, ip?: string) {
  try {
    await prisma.authLog.create({ data: { email, action, ip: ip || null } });
  } catch {
    // Log failure should not break auth flow
  }
}

export const signup = async (email: string, password: string, ip?: string) => {
  const normalizedEmail = email.toLowerCase();

  if (!validatePasswordStrength(password)) {
    throw { status: 400, message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw { status: 409, message: 'Email already exists' };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash
    }
  });

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash }
  });

  await logAuthAction(normalizedEmail, 'SIGNUP', ip);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
};

export const login = async (email: string, password: string, ip?: string) => {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    await logAuthAction(normalizedEmail, 'LOGIN_FAILED', ip);
    throw { status: 401, message: 'Invalid credentials' };
  }

  if (!user.isActive) {
    await logAuthAction(normalizedEmail, 'LOGIN_FAILED', ip);
    throw { status: 403, message: 'Account has been deactivated' };
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    await logAuthAction(normalizedEmail, 'LOGIN_FAILED', ip);
    throw { status: 401, message: 'Invalid credentials' };
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash }
  });

  await logAuthAction(normalizedEmail, 'LOGIN_SUCCESS', ip);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
};

export const refresh = async (oldRefreshToken: string) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const oldTokenHash = hashToken(oldRefreshToken);
  if (user.refreshTokenHash !== oldTokenHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: null }
    });
    throw { status: 401, message: 'Refresh token reuse detected - session invalidated' };
  }

  const newAccessToken = generateAccessToken(user.id, user.email, user.role);
  const newRefreshToken = generateRefreshToken(user.id, user.email, user.role);
  const newRefreshTokenHash = hashToken(newRefreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: newRefreshTokenHash }
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId: string, email: string, ip?: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null }
  });
  await logAuthAction(email, 'LOGOUT', ip);
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, isActive: true, createdAt: true }
  });
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return user;
};