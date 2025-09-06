import { QueueEntryStatus } from '../types/queue';

export type NotificationType =
  | 'QUEUE_UPDATE'
  | 'POSITION_CHANGED'
  | 'YOUR_TURN_SOON'
  | 'YOUR_TURN_NOW'
  | 'QUEUE_PAUSED'
  | 'QUEUE_RESUMED'
  | 'QUEUE_CLOSED'
  | 'APPOINTMENT_REMINDER'
  | 'CUSTOM_MESSAGE';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'default' | 'high' | 'max';
  channelId?: string;
  sound?: string | boolean;
  ttl?: number; // Time to live in seconds
  badge?: number;
}

export class NotificationUtils {
  /**
   * Creates a notification payload for queue position updates
   */
  static createPositionUpdateNotification(
    position: number,
    queueName: string,
    estimatedWaitTime?: number,
    data: Record<string, any> = {}
  ): NotificationPayload {
    const title = 'Queue Update';
    let message = '';
    
    if (position <= 0) {
      message = `You're next in line for ${queueName}!`;
    } else if (position === 1) {
      message = `You're #1 in line for ${queueName}. Get ready!`;
    } else {
      message = `You're now #${position} in line for ${queueName}`;
      
      if (estimatedWaitTime) {
        const minutes = Math.ceil(estimatedWaitTime / 60);
        message += ` (${minutes} min${minutes !== 1 ? 's' : ''} remaining)`;
      }
    }
    
    return {
      type: 'POSITION_CHANGED',
      title,
      message,
      data: {
        queueName,
        position,
        estimatedWaitTime,
        ...data,
      },
      priority: 'high',
    };
  }

  /**
   * Creates a notification for when it's almost the user's turn
   */
  static createYourTurnSoonNotification(
    queueName: string,
    minutesUntilTurn: number,
    data: Record<string, any> = {}
  ): NotificationPayload {
    return {
      type: 'YOUR_TURN_SOON',
      title: 'Heads Up!',
      message: `Your turn for ${queueName} is coming up in about ${minutesUntilTurn} minute${minutesUntilTurn !== 1 ? 's' : ''}.`,
      data: {
        queueName,
        minutesUntilTurn,
        ...data,
      },
      priority: 'high',
    };
  }

  /**
   * Creates a notification for when it's the user's turn
   */
  static createYourTurnNowNotification(
    queueName: string,
    data: Record<string, any> = {}
  ): NotificationPayload {
    return {
      type: 'YOUR_TURN_NOW',
      title: "It's Your Turn!",
      message: `Please proceed to ${queueName}.`,
      data: {
        queueName,
        timestamp: new Date().toISOString(),
        ...data,
      },
      priority: 'max',
      sound: true,
    };
  }

  /**
   * Creates a notification for queue status changes
   */
  static createQueueStatusNotification(
    status: 'PAUSED' | 'RESUMED' | 'CLOSED',
    queueName: string,
    reason?: string,
    data: Record<string, any> = {}
  ): NotificationPayload {
    const type = `QUEUE_${status}` as NotificationType;
    
    let title = '';
    let message = `The queue for ${queueName} has been ${status.toLowerCase()}`;
    
    if (status === 'PAUSED') {
      title = 'Queue Paused';
      message = reason 
        ? `The queue for ${queueName} has been paused: ${reason}`
        : `The queue for ${queueName} has been paused.`;
    } else if (status === 'RESUMED') {
      title = 'Queue Resumed';
      message = `The queue for ${queueName} has been resumed.`;
    } else if (status === 'CLOSED') {
      title = 'Queue Closed';
      message = `The queue for ${queueName} has been closed.`;
    }
    
    return {
      type,
      title,
      message,
      data: {
        queueName,
        status,
        reason,
        timestamp: new Date().toISOString(),
        ...data,
      },
      priority: 'high',
    };
  }

  /**
   * Creates a custom notification
   */
  static createCustomNotification(
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): NotificationPayload {
    return {
      type: 'CUSTOM_MESSAGE',
      title,
      message,
      data: {
        timestamp: new Date().toISOString(),
        ...data,
      },
      priority: 'default',
    };
  }

  /**
   * Creates an appointment reminder notification
   */
  static createAppointmentReminder(
    title: string,
    dateTime: Date,
    location?: string,
    data: Record<string, any> = {}
  ): NotificationPayload {
    const formattedTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let message = `Reminder: You have an appointment at ${formattedTime}`;
    
    if (location) {
      message += ` at ${location}`;
    }
    
    return {
      type: 'APPOINTMENT_REMINDER',
      title: `🔔 ${title}`,
      message,
      data: {
        appointmentTime: dateTime.toISOString(),
        location,
        ...data,
      },
      priority: 'high',
    };
  }

  /**
   * Converts a queue status to a human-readable string
   */
  static getStatusDisplayText(status: QueueEntryStatus): string {
    switch (status) {
      case 'WAITING':
        return 'Waiting';
      case 'CALLED':
        return 'Called';
      case 'SERVED':
        return 'Served';
      case 'NOSHOW':
        return 'No Show';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  /**
   * Gets the appropriate color for a queue status
   */
  static getStatusColor(status: QueueEntryStatus): string {
    switch (status) {
      case 'WAITING':
        return '#3498db'; // Blue
      case 'CALLED':
        return '#f39c12'; // Orange
      case 'SERVED':
        return '#2ecc71'; // Green
      case 'NOSHOW':
        return '#e74c3c'; // Red
      case 'CANCELLED':
        return '#95a5a6'; // Gray
      default:
        return '#7f8c8d'; // Dark gray
    }
  }

  /**
   * Groups notifications by type for display
   */
  static groupNotifications(notifications: NotificationPayload[]) {
    return notifications.reduce<Record<string, NotificationPayload[]>>((groups, notification) => {
      const group = groups[notification.type] || [];
      group.push(notification);
      groups[notification.type] = group;
      return groups;
    }, {});
  }

  /**
   * Sorts notifications by priority and timestamp
   */
  static sortNotifications(notifications: NotificationPayload[]) {
    const priorityOrder = { max: 0, high: 1, default: 2 };
    
    return [...notifications].sort((a, b) => {
      // First sort by priority
      const priorityA = priorityOrder[a.priority || 'default'];
      const priorityB = priorityOrder[b.priority || 'default'];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Then sort by timestamp if available
      const timeA = a.data?.timestamp ? new Date(a.data.timestamp).getTime() : 0;
      const timeB = b.data?.timestamp ? new Date(b.data.timestamp).getTime() : 0;
      
      return timeB - timeA; // Newest first
    });
  }
}
