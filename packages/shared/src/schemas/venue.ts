import { z } from 'zod';
import { 
  uuidSchema, 
  coordinatesSchema, 
  timeStringSchema, 
  urlSchema, 
  imageUrlSchema,
  paginationSchema,
  addressSchema,
  timeRangeSchema,
  dateRangeSchema
} from './common';

// Base venue schema
export const venueBaseSchema = z.object({
  id: uuidSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  slug: z.string().regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be URL-friendly (lowercase letters, numbers, and hyphens)'
  ),
  description: z.string().max(5000).nullable(),
  type: z.enum([
    'HOSPITAL', 'CLINIC', 'BANK', 'RESTAURANT', 'GOV', 'UNIVERSITY', 'EVENT', 'OTHER'
  ]).default('OTHER'),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).default([]),
  logoUrl: imageUrlSchema.nullable(),
  coverImageUrl: imageUrlSchema.nullable(),
  images: z.array(imageUrlSchema).default([]),
  address: addressSchema,
  coordinates: coordinatesSchema,
  contactEmail: z.string().email().nullable(),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  website: urlSchema.nullable(),
  socialMedia: z.record(urlSchema).default({}),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  verificationLevel: z.enum(['NONE', 'BASIC', 'FULL']).default('NONE'),
  verificationNotes: z.string().max(1000).nullable(),
  capacity: z.number().int().positive().nullable(),
  averageWaitTime: z.number().int().nonnegative().default(0), // in minutes
  currentQueueSize: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().nonnegative().default(0),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

// Schema for creating a venue
export const createVenueSchema = venueBaseSchema.pick({
  name: true,
  slug: true,
  description: true,
  type: true,
  category: true,
  tags: true,
  logoUrl: true,
  coverImageUrl: true,
  images: true,
  address: true,
  coordinates: true,
  contactEmail: true,
  contactPhone: true,
  website: true,
  socialMedia: true,
  capacity: true,
  metadata: true,
}).extend({
  ownerId: uuidSchema.optional(),
  operatingHours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    is24Hours: z.boolean().default(false),
    isClosed: z.boolean().default(false),
    openTime: timeStringSchema.optional(),
    closeTime: timeStringSchema.optional(),
  })),
  services: z.array(z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    estimatedWaitTime: z.number().int().nonnegative().default(0), // in minutes
    isActive: z.boolean().default(true),
    metadata: z.record(z.unknown()).optional(),
  })).optional(),
});

// Schema for updating a venue
export const updateVenueSchema = createVenueSchema.partial().extend({
  id: uuidSchema.optional(), // Not updatable, just for validation
  slug: z.string().regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be URL-friendly (lowercase letters, numbers, and hyphens)'
  ).optional(),
  operatingHours: z.array(z.object({
    id: uuidSchema.optional(),
    dayOfWeek: z.number().min(0).max(6),
    is24Hours: z.boolean().default(false),
    isClosed: z.boolean().default(false),
    openTime: timeStringSchema.optional(),
    closeTime: timeStringSchema.optional(),
  })).optional(),
  services: z.array(z.object({
    id: uuidSchema.optional(),
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    estimatedWaitTime: z.number().int().nonnegative().default(0),
    isActive: z.boolean().default(true),
    metadata: z.record(z.unknown()).optional(),
  })).optional(),
}).refine(
  data => !data.operatingHours?.some(hour => 
    !hour.is24Hours && !hour.isClosed && (!hour.openTime || !hour.closeTime)
  ),
  {
    message: 'Open and close times are required when not 24 hours and not closed',
    path: ['operatingHours'],
  }
);

// Schema for venue operating hours
export const venueOperatingHoursSchema = z.object({
  id: uuidSchema,
  venueId: uuidSchema,
  dayOfWeek: z.number().min(0).max(6),
  openTime: timeStringSchema.nullable(),
  closeTime: timeStringSchema.nullable(),
  is24Hours: z.boolean().default(false),
  isClosed: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for venue service
export const venueServiceSchema = z.object({
  id: uuidSchema,
  venueId: uuidSchema,
  name: z.string().min(2).max(100),
  description: z.string().max(500).nullable(),
  estimatedWaitTime: z.number().int().nonnegative().default(0), // in minutes
  isActive: z.boolean().default(true),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

// Schema for venue stats
export const venueStatsSchema = z.object({
  venueId: uuidSchema,
  totalVisitors: z.number().int().nonnegative().default(0),
  totalQueues: z.number().int().nonnegative().default(0),
  averageQueueTime: z.number().int().nonnegative().default(0), // in minutes
  averageWaitTime: z.number().int().nonnegative().default(0), // in minutes
  peakHours: z.record(z.number().int().nonnegative()).default({}),
  peakDays: z.record(z.number().int().nonnegative()).default({}),
  lastUpdated: z.string().datetime(),
});

// Schema for venue search filters
export const venueSearchFiltersSchema = z.object({
  query: z.string().optional(),
  location: coordinatesSchema.optional(),
  radius: z.number().min(0.1).max(100).default(10), // in kilometers
  types: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  minRating: z.number().min(0).max(5).optional(),
  isOpenNow: z.boolean().optional(),
  hasQueue: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  isWheelchairAccessible: z.boolean().optional(),
  priceRange: z.tuple([z.number().min(1).max(4), z.number().min(1).max(4)]).optional(),
  sortBy: z.enum([
    'distance', 'rating', 'waitTime', 'name', 'reviewCount', 'updatedAt'
  ]).default('distance'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  ...paginationSchema.shape,
});

// Schema for venue search result
export const venueSearchResultSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  logoUrl: z.string().url().nullable(),
  coverImageUrl: z.string().url().nullable(),
  address: addressSchema,
  coordinates: coordinatesSchema,
  distance: z.number().nonnegative().nullable(), // in kilometers
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  currentWaitTime: z.number().int().nonnegative().nullable(), // in minutes
  isOpen: z.boolean(),
  openingHours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
    is24Hours: z.boolean(),
    isClosed: z.boolean(),
  })),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
});

// Schema for venue list response
export const venueListResponseSchema = z.object({
  data: z.array(venueBaseSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for venue search response
export const venueSearchResponseSchema = z.object({
  data: z.array(venueSearchResultSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Schema for venue availability
export const venueAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(z.object({
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    isAvailable: z.boolean(),
    availableSlots: z.number().int().nonnegative(),
  })),
});

// Schema for venue operating hours update
export const updateVenueHoursSchema = z.object({
  operatingHours: z.array(z.object({
    id: uuidSchema.optional(),
    dayOfWeek: z.number().min(0).max(6),
    is24Hours: z.boolean().default(false),
    isClosed: z.boolean().default(false),
    openTime: timeStringSchema.optional(),
    closeTime: timeStringSchema.optional(),
  })),
});

// Schema for venue services update
export const updateVenueServicesSchema = z.object({
  services: z.array(z.object({
    id: uuidSchema.optional(),
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    estimatedWaitTime: z.number().int().nonnegative().default(0),
    isActive: z.boolean().default(true),
    metadata: z.record(z.unknown()).optional(),
  })),
});

// Schema for venue status
export const venueStatusSchema = z.object({
  isOpen: z.boolean(),
  nextOpeningTime: z.string().datetime().nullable(),
  nextClosingTime: z.string().datetime().nullable(),
  currentWaitTime: z.number().int().nonnegative().nullable(),
  queueLength: z.number().int().nonnegative(),
  availableServices: z.array(z.object({
    id: uuidSchema,
    name: z.string(),
    estimatedWaitTime: z.number().int().nonnegative(),
  })),
  lastUpdated: z.string().datetime(),
});

// Schema for venue verification request
export const venueVerificationRequestSchema = z.object({
  verificationLevel: z.enum(['BASIC', 'FULL']),
  notes: z.string().max(1000).optional(),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
    name: z.string(),
  })).optional(),
});

// Schema for venue verification response
export const venueVerificationResponseSchema = z.object({
  id: uuidSchema,
  venueId: uuidSchema,
  verificationLevel: z.enum(['NONE', 'BASIC', 'FULL']),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  notes: z.string().nullable(),
  reviewedBy: uuidSchema.nullable(),
  reviewedAt: z.string().datetime().nullable(),
  documents: z.array(z.object({
    id: uuidSchema,
    type: z.string(),
    url: z.string().url(),
    name: z.string(),
    uploadedAt: z.string().datetime(),
  })),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for venue analytics
export const venueAnalyticsSchema = z.object({
  venueId: uuidSchema,
  dateRange: dateRangeSchema,
  totalVisitors: z.number().int().nonnegative(),
  totalQueues: z.number().int().nonnegative(),
  averageWaitTime: z.number().int().nonnegative(),
  averageQueueTime: z.number().int().nonnegative(),
  peakHours: z.array(z.object({
    hour: z.number().min(0).max(23),
    count: z.number().int().nonnegative(),
  })),
  peakDays: z.array(z.object({
    day: z.number().min(0).max(6),
    count: z.number().int().nonnegative(),
  })),
  popularServices: z.array(z.object({
    serviceId: uuidSchema,
    name: z.string(),
    count: z.number().int().nonnegative(),
    averageWaitTime: z.number().int().nonnegative(),
  })),
  visitorDemographics: z.object({
    ageGroups: z.record(z.number().int().nonnegative()),
    genders: z.record(z.number().int().nonnegative()),
  }),
  metadata: z.record(z.unknown()).optional(),
});
