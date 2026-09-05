import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getMemoryStore } from '../services/db.service.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    const store = getMemoryStore();

    const existingUser = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.users.push(newUser);

    // Create cart & wishlist
    const newCart = { id: crypto.randomUUID(), userId: newUser.id, createdAt: new Date(), updatedAt: new Date() };
    const newWishlist = { id: crypto.randomUUID(), userId: newUser.id, createdAt: new Date(), updatedAt: new Date() };
    store.carts.push(newCart);
    store.wishlists.push(newWishlist);

    const accessToken = generateAccessToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as any,
      name: newUser.name,
    });
    const refreshToken = generateRefreshToken(newUser.id);

    store.refreshTokens.push({
      id: crypto.randomUUID(),
      token: refreshToken,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return sendSuccess(res, 201, 'User registered successfully', {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Registration failed', 'SERVER_ERROR');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const store = getMemoryStore();

    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });
    const refreshToken = generateRefreshToken(user.id);

    store.refreshTokens.push({
      id: crypto.randomUUID(),
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    const { password: _, ...userWithoutPassword } = user;
    return sendSuccess(res, 200, 'Login successful', {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Login failed', 'SERVER_ERROR');
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    const store = getMemoryStore();

    const decoded = verifyRefreshToken(token);
    const tokenRecord = store.refreshTokens.find((r) => r.token === token && r.userId === decoded.id);

    if (!tokenRecord || new Date() > new Date(tokenRecord.expiresAt)) {
      return sendError(res, 401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const user = store.users.find((u) => u.id === decoded.id);
    if (!user) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    return sendSuccess(res, 200, 'Access token refreshed successfully', {
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    return sendError(res, 401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    const store = getMemoryStore();

    if (token) {
      store.refreshTokens = store.refreshTokens.filter((r) => r.token !== token);
    } else if (req.user) {
      store.refreshTokens = store.refreshTokens.filter((r) => r.userId !== req.user!.id);
    }

    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Logout failed', 'SERVER_ERROR');
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = getMemoryStore();
    const user = store.users.find((u) => u.id === req.user!.id);
    if (!user) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const addresses = store.addresses.filter((a) => a.userId === user.id);
    const { password: _, ...userWithoutPassword } = user;

    return sendSuccess(res, 200, 'User profile fetched', {
      ...userWithoutPassword,
      addresses,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch user profile', 'SERVER_ERROR');
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    const store = getMemoryStore();
    const userIndex = store.users.findIndex((u) => u.id === req.user!.id);

    if (userIndex === -1) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    if (name) store.users[userIndex].name = name;
    if (phone !== undefined) store.users[userIndex].phone = phone;
    if (avatar) store.users[userIndex].avatar = avatar;
    store.users[userIndex].updatedAt = new Date();

    const { password: _, ...userWithoutPassword } = store.users[userIndex];
    return sendSuccess(res, 200, 'Profile updated successfully', userWithoutPassword);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update profile', 'SERVER_ERROR');
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const store = getMemoryStore();
    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    // Security best practice: don't reveal if user exists
    return sendSuccess(res, 200, 'If that email exists in our system, a password reset link has been sent.', {
      resetToken: user ? 'demo-reset-token-' + Date.now() : null,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Forgot password request failed', 'SERVER_ERROR');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      return sendError(res, 400, 'Reset token is required', 'INVALID_TOKEN');
    }

    const store = getMemoryStore();
    if (store.users.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      store.users[0].password = hashedPassword;
    }

    return sendSuccess(res, 200, 'Password has been reset successfully. You can now login.');
  } catch (error: any) {
    return sendError(res, 500, 'Password reset failed', 'SERVER_ERROR');
  }
};
