import { z } from 'zod';
import { 
  emailSchema, 
  phoneSchema, 
  passwordSchema, 
  urlSchema, 
  imageUrlSchema,
  uuidSchema,
  paginationSchema,
  dateRangeSchema,
  timeRangeSchema,
  coordinatesSchema
} from './common';

// Base user schema
export const userBaseSchema = z.object({
  id: uuidSchema,
  email: emailSchema.nullable(),
  phone: phoneSchema.nullable(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  avatarUrl: imageUrlSchema.nullable(),
  role: z.enum(['USER', 'INSTITUTE', 'ADMIN']).default('USER'),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  lastActiveAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for creating a user
export const createUserSchema = userBaseSchema.pick({
  email: true,
  phone: true,
  name: true,
  role: true,
}).extend({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
).refine(
  data => data.email || data.phone,
  {
    message: 'Either email or phone must be provided',
    path: ['email']
  }
);

// Schema for updating a user
export const updateUserSchema = userBaseSchema.partial().pick({
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
}).extend({
  currentPassword: z.string().optional(), // Required if changing email/phone
}).refine(
  data => !(data.email || data.phone) || data.currentPassword,
  {
    message: 'Current password is required to update email or phone',
    path: ['currentPassword']
  }
);

// Schema for user profile
export const userProfileSchema = userBaseSchema.extend({
  bio: z.string().max(500).nullable(),
  dateOfBirth: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date of birth must be in YYYY-MM-DD format'
  ).nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    coordinates: coordinatesSchema.optional(),
  }).nullable(),
  preferences: z.object({
    language: z.string().default('en'),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    }),
  }).optional(),
  socialLinks: z.record(z.string().url()).optional(),
  metadata: z.record(z.unknown()).optional(),
}).omit({
  role: true,
  isVerified: true,
  isActive: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for user stats
export const userStatsSchema = z.object({
  totalQueuesJoined: z.number().int().nonnegative().default(0),
  totalTimeSaved: z.number().int().nonnegative().default(0), // in minutes
  averageWaitTime: z.number().int().nonnegative().default(0), // in minutes
  favoriteVenues: z.array(z.string().uuid()).default([]),
  lastVisitedVenues: z.array(z.string().uuid()).default([]),
  activityByDay: z.record(z.number().int().nonnegative()).default({}),
  activityByHour: z.record(z.number().int().nonnegative()).default({}),
  lastUpdated: z.string().datetime(),
});

// Schema for user device
export const userDeviceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deviceId: z.string(),
  deviceName: z.string().nullable(),
  deviceModel: z.string().nullable(),
  osName: z.string().nullable(),
  osVersion: z.string().nullable(),
  pushToken: z.string().nullable(),
  lastActiveAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for user notification preferences
export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  inApp: z.boolean().default(true),
  marketing: z.boolean().default(false),
  preferences: z.record(z.boolean()).default({}),
});

// Schema for user search filters
export const userSearchFiltersSchema = z.object({
  query: z.string().optional(),
  role: z.enum(['USER', 'INSTITUTE', 'ADMIN']).optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  dateRange: dateRangeSchema.optional(),
  lastActive: z.enum(['today', 'this_week', 'this_month', 'this_year']).optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  ...paginationSchema.shape,
});

// Schema for user activity
export const userActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

// Schema for user settings
export const userSettingsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  key: z.string(),
  value: z.any(),
  isPublic: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for user subscription
export const userSubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  status: z.enum(['ACTIVE', 'CANCELED', 'EXPIRED', 'PAST_DUE']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean().default(false),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  trialStart: z.string().datetime().nullable(),
  trialEnd: z.string().datetime().nullable(),
  cancelAt: z.string().datetime().nullable(),
  canceledAt: z.string().datetime().nullable(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for user notification
export const userNotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum([
    'SYSTEM', 'QUEUE_UPDATE', 'APPOINTMENT', 'PROMOTION', 'SECURITY', 'OTHER'
  ]),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for user preferences
export const userPreferencesSchema = z.object({
  language: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  timezone: z.string().default('UTC'),
  dateFormat: z.string().default('MM/DD/YYYY'),
  timeFormat: z.string().default('h:mm a'),
  weekStartsOn: z.number().min(0).max(6).default(0), // 0 = Sunday, 1 = Monday, etc.
  notifications: notificationPreferencesSchema,
  privacy: z.object({
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(false),
    showLastActive: z.boolean().default(true),
    showOnlineStatus: z.boolean().default(true),
    searchIndexing: z.boolean().default(true),
  }).default({}),
  accessibility: z.object({
    reducedMotion: z.boolean().default(false),
    highContrast: z.boolean().default(false),
    fontSize: z.number().min(12).max(24).default(16),
    colorBlindMode: z.boolean().default(false),
  }).default({}),
  emailFrequency: z.enum(['immediately', 'daily', 'weekly', 'never']).default('immediately'),
  emailDigest: z.boolean().default(true),
  emailMarketing: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  inAppNotifications: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  autoNightMode: z.boolean().default(true),
  nightModeStart: timeRangeSchema.shape.startTime.default('20:00'),
  nightModeEnd: timeRangeSchema.shape.endTime.default('07:00'),
  autoSave: z.boolean().default(true),
  autoSaveInterval: z.number().min(1).max(60).default(5), // in minutes
  syncAcrossDevices: z.boolean().default(true),
  dataSaver: z.boolean().default(false),
  videoQuality: z.enum(['auto', 'low', 'medium', 'high']).default('auto'),
  downloadQuality: z.enum(['low', 'medium', 'high']).default('medium'),
  downloadOverWifiOnly: z.boolean().default(true),
  cacheSize: z.number().min(0).default(500), // in MB
  clearCacheOnExit: z.boolean().default(false),
  locationServices: z.boolean().default(true),
  analytics: z.boolean().default(true),
  crashReports: z.boolean().default(true),
  personalizedAds: z.boolean().default(false),
  thirdPartySharing: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
}).deepPartial();

// Schema for user session
export const userSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deviceId: z.string(),
  refreshToken: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for user search result
export const userSearchResultSchema = z.object({
  users: z.array(userBaseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// Schema for user list response
export const userListResponseSchema = z.object({
  data: z.array(userBaseSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for user activity response
export const userActivityResponseSchema = z.object({
  data: z.array(userActivitySchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for user notification response
export const userNotificationResponseSchema = z.object({
  data: z.array(userNotificationSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    unread: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for user device response
export const userDeviceResponseSchema = z.object({
  data: z.array(userDeviceSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for user subscription response
export const userSubscriptionResponseSchema = z.object({
  data: z.array(userSubscriptionSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    canceled: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for user activity summary
export const userActivitySummarySchema = z.object({
  totalActivities: z.number().int().nonnegative(),
  activitiesByType: z.record(z.number().int().nonnegative()),
  activitiesByDate: z.record(z.number().int().nonnegative()),
  lastActivity: userActivitySchema.nullable(),
  mostActiveDay: z.object({
    date: z.string(),
    count: z.number().int().nonnegative(),
  }).nullable(),
  averageActivitiesPerDay: z.number().nonnegative(),
  streak: z.object({
    current: z.number().int().nonnegative(),
    longest: z.number().int().nonnegative(),
  }),
});
