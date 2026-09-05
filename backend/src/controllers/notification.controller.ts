import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { getMemoryStore } from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const store = getMemoryStore();

    const notifications = store.notifications.filter((n) => n.userId === userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return sendSuccess(res, 200, 'Notifications fetched', {
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch notifications', 'SERVER_ERROR');
  }
};

export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const store = getMemoryStore();

    const notif = store.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
    }

    return sendSuccess(res, 200, 'Notification marked as read');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update notification', 'SERVER_ERROR');
  }
};

export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const store = getMemoryStore();

    store.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => {
        n.isRead = true;
      });

    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update notifications', 'SERVER_ERROR');
  }
};
