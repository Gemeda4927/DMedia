import Notification from '../models/Notification.js';

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID to notify
 * @param {string} params.type - Notification type (info, success, warning, error)
 * @param {string} params.message - Notification message
 * @param {string} [params.title] - Optional notification title
 * @param {string} [params.link] - Optional link to related content
 * @param {Object} [params.metadata] - Optional metadata
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async ({
  userId,
  type = 'info',
  message,
  title,
  link,
  metadata
}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      title,
      link,
      metadata
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create multiple notifications for multiple users
 * @param {Array<Object>} notifications - Array of notification objects
 * @returns {Promise<Array>} Created notifications
 */
export const createBulkNotifications = async (notifications) => {
  try {
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Send notification to all admin users
 * @param {Object} params - Notification parameters (excluding userId)
 * @returns {Promise<Array>} Created notifications
 */
export const notifyAdmins = async (notificationData) => {
  try {
    const User = (await import('../models/User.js')).default;
    const admins = await User.find({ role: 'admin' }).select('_id');
    const adminIds = admins.map(admin => admin._id);

    const notifications = adminIds.map(adminId => ({
      userId: adminId,
      ...notificationData
    }));

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error('Error notifying admins:', error);
    throw error;
  }
};

