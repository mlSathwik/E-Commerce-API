import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthUser } from '../types/index.js';

export const generateAccessToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1d' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): AuthUser => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
};
