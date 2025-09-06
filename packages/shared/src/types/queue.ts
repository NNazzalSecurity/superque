import { QueueEntryStatus } from './common';

export interface Queue {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isPaused: boolean;
  currentPosition: number;
  estimatedWaitTime: number; // in seconds
  maxQueueSize?: number;
  averageServiceTime: number; // in seconds
  lastServedPosition: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueEntry {
  id: string;
  queueId: string;
  userId: string;
  serviceId?: string;
  status: QueueEntryStatus;
  position: number;
  vip: boolean;
  estimatedWaitTime?: number; // in seconds
  calledAt?: Date;
  servedAt?: Date;
  noShowAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueStats {
  totalServed: number;
  averageWaitTime: number; // in seconds
  averageServiceTime: number; // in seconds
  noShowRate: number; // percentage
  peakHours: {
    hour: number;
    day: string;
    averageWaitTime: number;
  }[];
  currentQueueLength: number;
  maxConcurrentUsers: number;
  averageDailyUsers: number;
}

export interface QueueNotification {
  type: 'POSITION_UPDATE' | 'YOUR_TURN' | 'QUEUE_PAUSED' | 'QUEUE_RESUMED' | 'QUEUE_CLOSED';
  queueId: string;
  queueName: string;
  position?: number;
  estimatedWaitTime?: number; // in seconds
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface QueueAnalytics {
  date: Date;
  totalEntries: number;
  completed: number;
  noShows: number;
  cancellations: number;
  averageWaitTime: number; // in seconds
  averageServiceTime: number; // in seconds
  peakHour: {
    hour: number;
    count: number;
  };
}

export interface QueueSettings {
  id: string;
  queueId: string;
  allowRemoteCheckIn: boolean;
  allowWalkIns: boolean;
  allowVip: boolean;
  vipMultiplier: number; // e.g., 0.7 means VIPs wait 70% of normal time
  maxPartySize: number;
  notificationBeforeMinutes: number;
  autoMarkNoShowAfterMinutes: number;
  estimatedWaitTime: number; // in seconds
  bufferTime: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}
