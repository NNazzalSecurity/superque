import { VenueType } from './common';

export interface Service {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  type: VenueType;
  isActive: boolean;
  priority: number;
  averageServiceTime: number; // in seconds
  currentQueueLength: number;
  estimatedWaitTime: number; // in seconds
  maxConcurrentCustomers?: number;
  requiresVerification: boolean;
  verificationTypes?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  services: Service[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceHours {
  id: string;
  serviceId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
  is24Hours: boolean;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceStats {
  totalServed: number;
  averageServiceTime: number; // in seconds
  averageWaitTime: number; // in seconds
  noShowRate: number; // percentage
  peakHours: {
    hour: number;
    day: string;
    averageWaitTime: number;
  }[];
  currentQueueLength: number;
  averageRating?: number;
  reviewCount: number;
}

export interface ServiceAnalytics {
  date: Date;
  totalRequests: number;
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

export interface ServiceRequest {
  id: string;
  serviceId: string;
  userId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  estimatedWaitTime?: number; // in seconds
  actualWaitTime?: number; // in seconds
  serviceTime?: number; // in seconds
  notes?: string;
  metadata?: Record<string, any>;
  assignedTo?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  noShowAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
