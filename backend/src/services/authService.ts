import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const signup = async (email: string, password: string) => {
  if (!validatePasswordStrength(password)) {
    throw { status: 400, message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { status: 409, message: 'Email already exists' };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
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

  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  if (!user.isActive) {
    throw { status: 403, message: 'Account has been deactivated' };
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash }
  });

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

export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null }
  });
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