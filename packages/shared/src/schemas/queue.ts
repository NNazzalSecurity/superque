import { z } from 'zod';
import { 
  uuidSchema, 
  timeStringSchema, 
  paginationSchema, 
  dateRangeSchema,
  QueueEntryStatus
} from './common';

// Base queue entry schema
export const queueEntryBaseSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  venueId: uuidSchema,
  serviceId: uuidSchema.nullable(),
  status: z.nativeEnum(QueueEntryStatus).default('WAITING'),
  queueNumber: z.number().int().positive(),
  estimatedStartTime: z.string().datetime().nullable(),
  estimatedEndTime: z.string().datetime().nullable(),
  actualStartTime: z.string().datetime().nullable(),
  actualEndTime: z.string().datetime().nullable(),
  position: z.number().int().positive(),
  partySize: z.number().int().positive().default(1),
  notes: z.string().max(500).nullable(),
  metadata: z.record(z.unknown()).default({}),
  isPriority: z.boolean().default(false),
  isNoShow: z.boolean().default(false),
  isCancelled: z.boolean().default(false),
  cancellationReason: z.string().max(500).nullable(),
  cancellationTime: z.string().datetime().nullable(),
  servedBy: uuidSchema.nullable(),
  servedAt: z.string().datetime().nullable(),
  waitTime: z.number().int().nonnegative().nullable(), // in minutes
  serviceTime: z.number().int().nonnegative().nullable(), // in minutes
  totalTime: z.number().int().nonnegative().nullable(), // in minutes
  rating: z.number().min(0).max(5).nullable(),
  review: z.string().max(1000).nullable(),
  reviewTime: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for creating a queue entry
export const createQueueEntrySchema = queueEntryBaseSchema.pick({
  venueId: true,
  serviceId: true,
  partySize: true,
  notes: true,
  metadata: true,
  isPriority: true,
}).extend({
  userId: uuidSchema.optional(), // Will be set from auth if not provided
  estimatedStartTime: z.string().datetime().optional(),
  estimatedEndTime: z.string().datetime().optional(),
});

// Schema for updating a queue entry
export const updateQueueEntrySchema = queueEntryBaseSchema.partial().pick({
  status: true,
  position: true,
  partySize: true,
  notes: true,
  metadata: true,
  isPriority: true,
  isNoShow: true,
  isCancelled: true,
  cancellationReason: true,
  servedBy: true,
  servedAt: true,
  waitTime: true,
  serviceTime: true,
  totalTime: true,
  rating: true,
  review: true,
}).extend({
  estimatedStartTime: z.string().datetime().nullable().optional(),
  estimatedEndTime: z.string().datetime().nullable().optional(),
  actualStartTime: z.string().datetime().nullable().optional(),
  actualEndTime: z.string().datetime().nullable().optional(),
});

// Schema for queue entry status update
export const updateQueueEntryStatusSchema = z.object({
  status: z.nativeEnum(QueueEntryStatus),
  notes: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Schema for queue entry position update
export const updateQueueEntryPositionSchema = z.object({
  position: z.number().int().positive(),
  notes: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Schema for queue entry cancellation
export const cancelQueueEntrySchema = z.object({
  reason: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Schema for queue entry rating
export const rateQueueEntrySchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Schema for queue entry search filters
export const queueEntrySearchFiltersSchema = z.object({
  userId: uuidSchema.optional(),
  venueId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  status: z.nativeEnum(QueueEntryStatus).array().optional(),
  dateRange: dateRangeSchema.optional(),
  isPriority: z.boolean().optional(),
  isNoShow: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
  hasRating: z.boolean().optional(),
  sortBy: z.enum([
    'createdAt', 'updatedAt', 'position', 'queueNumber', 'estimatedStartTime', 'actualStartTime'
  ]).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  ...paginationSchema.shape,
});

// Schema for queue entry search result
export const queueEntrySearchResultSchema = queueEntryBaseSchema.extend({
  user: z.object({
    id: uuidSchema,
    name: z.string().nullable(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
  }),
  venue: z.object({
    id: uuidSchema,
    name: z.string(),
    type: z.string(),
    logoUrl: z.string().url().nullable(),
  }),
  service: z.object({
    id: uuidSchema,
    name: z.string(),
    estimatedWaitTime: z.number().int().nonnegative(),
  }).nullable(),
  servedByUser: z.object({
    id: uuidSchema,
    name: z.string().nullable(),
    email: z.string().email().nullable(),
  }).nullable(),
  currentPosition: z.number().int().positive().optional(),
  estimatedWaitTime: z.number().int().nonnegative().nullable(),
  timeInQueue: z.number().int().nonnegative().nullable(),
});

// Schema for queue entry list response
export const queueEntryListResponseSchema = z.object({
  data: z.array(queueEntrySearchResultSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for queue status
export const queueStatusSchema = z.object({
  venueId: uuidSchema,
  serviceId: uuidSchema.nullable(),
  totalActive: z.number().int().nonnegative(),
  totalWaiting: z.number().int().nonnegative(),
  totalInProgress: z.number().int().nonnegative(),
  totalCompleted: z.number().int().nonnegative(),
  totalNoShow: z.number().int().nonnegative(),
  totalCancelled: z.number().int().nonnegative(),
  averageWaitTime: z.number().int().nonnegative(),
  averageServiceTime: z.number().int().nonnegative(),
  currentQueue: z.array(queueEntrySearchResultSchema),
  nextAvailableNumber: z.number().int().positive(),
  lastUpdated: z.string().datetime(),
});

// Schema for queue analytics
export const queueAnalyticsSchema = z.object({
  venueId: uuidSchema,
  serviceId: uuidSchema.nullable(),
  dateRange: dateRangeSchema,
  totalEntries: z.number().int().nonnegative(),
  totalCompleted: z.number().int().nonnegative(),
  totalNoShow: z.number().int().nonnegative(),
  totalCancelled: z.number().int().nonnegative(),
  averageWaitTime: z.number().int().nonnegative(),
  averageServiceTime: z.number().int().nonnegative(),
  peakHours: z.array(z.object({
    hour: z.number().min(0).max(23),
    count: z.number().int().nonnegative(),
  })),
  peakDays: z.array(z.object({
    day: z.number().min(0).max(6),
    count: z.number().int().nonnegative(),
  })),
  statusDistribution: z.record(z.number().int().nonnegative()),
  cancellationReasons: z.record(z.number().int().nonnegative()),
  ratingDistribution: z.record(z.number().int().nonnegative()),
  metadata: z.record(z.unknown()).optional(),
});

// Schema for queue settings
export const queueSettingsSchema = z.object({
  venueId: uuidSchema,
  serviceId: uuidSchema.nullable(),
  isActive: z.boolean().default(true),
  isAcceptingNewEntries: z.boolean().default(true),
  maxQueueSize: z.number().int().positive().nullable(),
  maxPartySize: z.number().int().positive().default(10),
  estimatedWaitTimePerPerson: z.number().int().positive().default(5), // in minutes
  estimatedServiceTime: z.number().int().positive().default(15), // in minutes
  notifyBeforeTurn: z.boolean().default(true),
  notifyBeforeMinutes: z.number().int().positive().default(10),
  allowSelfCheckIn: z.boolean().default(false),
  allowSelfCheckOut: z.boolean().default(true),
  allowPriority: z.boolean().default(false),
  maxPriorityPerDay: z.number().int().nonnegative().default(0),
  priorityFee: z.number().nonnegative().default(0),
  priorityFeeCurrency: z.string().default('USD'),
  requireConfirmation: z.boolean().default(false),
  confirmationExpiryMinutes: z.number().int().positive().default(15),
  requirePayment: z.boolean().default(false),
  paymentAmount: z.number().nonnegative().default(0),
  paymentCurrency: z.string().default('USD'),
  paymentMethod: z.string().nullable(),
  isRefundable: z.boolean().default(false),
  refundPolicy: z.string().max(1000).nullable(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for queue notification
export const queueNotificationSchema = z.object({
  id: uuidSchema,
  queueEntryId: uuidSchema,
  userId: uuidSchema,
  type: z.enum([
    'QUEUE_JOINED',
    'QUEUE_POSITION_UPDATE',
    'TURN_SOON',
    'TURN_NOW',
    'TURN_MISSED',
    'SERVICE_COMPLETED',
    'QUEUE_CANCELLED',
    'REMINDER',
    'OTHER'
  ]),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
  readAt: z.string().datetime().nullable(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
});

// Schema for queue notification preferences
export const queueNotificationPreferencesSchema = z.object({
  userId: uuidSchema,
  venueId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  inApp: z.boolean().default(true),
  notifyBeforeTurn: z.boolean().default(true),
  notifyBeforeMinutes: z.number().int().positive().default(10),
  notifyOnPositionChange: z.boolean().default(true),
  notifyOnTurnSoon: z.boolean().default(true),
  notifyOnTurnNow: z.boolean().default(true),
  notifyOnMissedTurn: z.boolean().default(true),
  notifyOnServiceCompleted: z.boolean().default(true),
  notifyOnQueueCancelled: z.boolean().default(true),
  notifyOnReminder: z.boolean().default(true),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for queue analytics filters
export const queueAnalyticsFiltersSchema = z.object({
  venueId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  dateRange: dateRangeSchema.optional(),
  status: z.nativeEnum(QueueEntryStatus).array().optional(),
  isPriority: z.boolean().optional(),
  isNoShow: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
  hasRating: z.boolean().optional(),
});

// Schema for queue export format
export const queueExportFormatSchema = z.enum([
  'CSV', 'EXCEL', 'PDF', 'JSON'
]);

// Schema for queue export request
export const queueExportRequestSchema = z.object({
  format: queueExportFormatSchema.default('CSV'),
  filters: queueEntrySearchFiltersSchema.omit({
    page: true,
    limit: true,
    sortBy: true,
    sortOrder: true,
  }),
  fields: z.array(z.string()).optional(),
  timezone: z.string().default('UTC'),
});

// Schema for queue import request
export const queueImportRequestSchema = z.object({
  file: z.any(), // File upload
  format: queueExportFormatSchema.default('CSV'),
  options: z.object({
    skipFirstRow: z.boolean().default(true),
    updateExisting: z.boolean().default(false),
    notifyUsers: z.boolean().default(false),
  }).default({}),
});

// Schema for queue import result
export const queueImportResultSchema = z.object({
  total: z.number().int().nonnegative(),
  imported: z.number().int().nonnegative(),
  updated: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  errors: z.array(z.object({
    row: z.number().int().positive(),
    errors: z.record(z.string().array()),
  })),
  warnings: z.array(z.object({
    row: z.number().int().positive(),
    warnings: z.string().array(),
  })),
  metadata: z.record(z.unknown()).optional(),
});
