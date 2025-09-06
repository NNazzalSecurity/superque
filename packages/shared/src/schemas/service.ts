import { z } from 'zod';
import { 
  uuidSchema, 
  paginationSchema, 
  dateRangeSchema,
  timeRangeSchema,
  imageUrlSchema
} from './common';

// Reusable operating hours schema for services
const ServiceOperatingHourInputSchema = z.object({
  id: uuidSchema.optional(),
  dayOfWeek: z.number().min(0).max(6),
  is24Hours: z.boolean().default(false),
  isClosed: z.boolean().default(false),
  openTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ).optional(),
  closeTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ).optional(),
});

type ServiceOperatingHourInput = z.infer<typeof ServiceOperatingHourInputSchema>;

// Base service schema
export const serviceBaseSchema = z.object({
  id: uuidSchema,
  venueId: uuidSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).nullable(),
  code: z.string().max(50).nullable(),
  category: z.string().max(100).nullable(),
  icon: z.string().max(100).nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).nullable(),
  imageUrl: imageUrlSchema.nullable(),
  estimatedWaitTime: z.number().int().nonnegative().default(15), // in minutes
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isQueueable: z.boolean().default(true),
  isBookable: z.boolean().default(false),
  isSelfService: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  maxConcurrent: z.number().int().positive().nullable(),
  maxPartySize: z.number().int().positive().default(1),
  minNotice: z.number().int().nonnegative().default(0), // in minutes
  maxAdvance: z.number().int().positive().default(1440), // in minutes (24 hours)
  slotInterval: z.number().int().positive().default(15), // in minutes
  bufferTime: z.number().int().nonnegative().default(0), // in minutes
  preparationTime: z.number().int().nonnegative().default(0), // in minutes
  cleanupTime: z.number().int().nonnegative().default(0), // in minutes
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

// Schema for creating a service
export const createServiceSchema = serviceBaseSchema.pick({
  name: true,
  description: true,
  code: true,
  category: true,
  icon: true,
  color: true,
  imageUrl: true,
  estimatedWaitTime: true,
  isActive: true,
  isAvailable: true,
  isQueueable: true,
  isBookable: true,
  isSelfService: true,
  requiresApproval: true,
  maxConcurrent: true,
  maxPartySize: true,
  minNotice: true,
  maxAdvance: true,
  slotInterval: true,
  bufferTime: true,
  preparationTime: true,
  cleanupTime: true,
  metadata: true,
}).extend({
  venueId: uuidSchema.optional(), // Will be set from URL params if not provided
  operatingHours: z.array(ServiceOperatingHourInputSchema.omit({ id: true })).optional(),
  staffIds: z.array(uuidSchema).optional(),
  resourceIds: z.array(uuidSchema).optional(),
});

// Schema for updating a service
const updateServiceCoreSchema = createServiceSchema.partial().extend({
  id: uuidSchema.optional(), // Not updatable, just for validation
  operatingHours: z.array(ServiceOperatingHourInputSchema).optional(),
  staffIds: z.array(uuidSchema).optional(),
  resourceIds: z.array(uuidSchema).optional(),
});

type UpdateServiceCore = z.infer<typeof updateServiceCoreSchema>;

export const updateServiceSchema = updateServiceCoreSchema.refine(
  (data: UpdateServiceCore) =>
    !data.operatingHours?.some((hour: ServiceOperatingHourInput) =>
      !hour.is24Hours && !hour.isClosed && (!hour.openTime || !hour.closeTime)
    ),
  {
    message: 'Open and close times are required when not 24 hours and not closed',
    path: ['operatingHours'],
  }
);

// Schema for service search filters
export const serviceSearchFiltersSchema = z.object({
  query: z.string().optional(),
  venueId: uuidSchema.optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isQueueable: z.boolean().optional(),
  isBookable: z.boolean().optional(),
  minEstimatedWaitTime: z.number().int().nonnegative().optional(),
  maxEstimatedWaitTime: z.number().int().positive().optional(),
  ...paginationSchema.shape,
});

// Schema for service availability
export const serviceAvailabilitySchema = z.object({
  serviceId: uuidSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(z.object({
    startTime: z.string().regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Time must be in HH:MM format'
    ),
    endTime: z.string().regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Time must be in HH:MM format'
    ),
    isAvailable: z.boolean(),
    availableSlots: z.number().int().nonnegative(),
  })),
});

// Schema for service status
export const serviceStatusSchema = z.object({
  serviceId: uuidSchema,
  isAvailable: z.boolean(),
  estimatedWaitTime: z.number().int().nonnegative(),
  currentQueueSize: z.number().int().nonnegative(),
  nextAvailableSlot: z.string().datetime().nullable(),
  lastUpdated: z.string().datetime(),
});

// Schema for service operating hours
export const serviceOperatingHoursSchema = z.object({
  id: uuidSchema,
  serviceId: uuidSchema,
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ).nullable(),
  closeTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ).nullable(),
  is24Hours: z.boolean().default(false),
  isClosed: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for service staff assignment
export const serviceStaffAssignmentSchema = z.object({
  id: uuidSchema,
  serviceId: uuidSchema,
  staffId: uuidSchema,
  isPrimary: z.boolean().default(false),
  canApprove: z.boolean().default(false),
  canManage: z.boolean().default(false),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for service resource assignment
export const serviceResourceAssignmentSchema = z.object({
  id: uuidSchema,
  serviceId: uuidSchema,
  resourceId: uuidSchema,
  quantity: z.number().int().positive().default(1),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for service analytics
export const serviceAnalyticsSchema = z.object({
  serviceId: uuidSchema,
  dateRange: dateRangeSchema,
  totalRequests: z.number().int().nonnegative(),
  totalCompleted: z.number().int().nonnegative(),
  totalNoShow: z.number().int().nonnegative(),
  totalCancelled: z.number().int().nonnegative(),
  averageWaitTime: z.number().int().nonnegative(),
  averageServiceTime: z.number().int().nonnegative(),
  utilizationRate: z.number().min(0).max(100),
  peakHours: z.array(z.object({
    hour: z.number().min(0).max(23),
    count: z.number().int().nonnegative(),
  })),
  peakDays: z.array(z.object({
    day: z.number().min(0).max(6),
    count: z.number().int().nonnegative(),
  })),
  staffPerformance: z.array(z.object({
    staffId: uuidSchema,
    name: z.string(),
    totalServed: z.number().int().nonnegative(),
    averageServiceTime: z.number().int().nonnegative(),
    averageRating: z.number().min(0).max(5).nullable(),
  })),
  resourceUtilization: z.array(z.object({
    resourceId: uuidSchema,
    name: z.string(),
    totalUsage: z.number().int().nonnegative(),
    utilizationRate: z.number().min(0).max(100),
  })),
  metadata: z.record(z.unknown()).optional(),
});

// Schema for service export format
export const serviceExportFormatSchema = z.enum([
  'CSV', 'EXCEL', 'PDF', 'JSON'
]);

// Schema for service export request
export const serviceExportRequestSchema = z.object({
  format: serviceExportFormatSchema.default('CSV'),
  filters: serviceSearchFiltersSchema.omit({
    page: true,
    limit: true,
    sortBy: true,
    sortOrder: true,
  }),
  fields: z.array(z.string()).optional(),
  timezone: z.string().default('UTC'),
});

// Schema for service import request
export const serviceImportRequestSchema = z.object({
  file: z.any(), // File upload
  format: serviceExportFormatSchema.default('CSV'),
  options: z.object({
    skipFirstRow: z.boolean().default(true),
    updateExisting: z.boolean().default(false),
    importOperatingHours: z.boolean().default(true),
    importStaff: z.boolean().default(true),
    importResources: z.boolean().default(true),
  }).default({}),
});

// Schema for service import result
export const serviceImportResultSchema = z.object({
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

// Schema for service category
export const serviceCategorySchema = z.object({
  id: uuidSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).nullable(),
  icon: z.string().max(100).nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).nullable(),
  imageUrl: imageUrlSchema.nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for creating a service category
export const createServiceCategorySchema = serviceCategorySchema.pick({
  name: true,
  description: true,
  icon: true,
  color: true,
  imageUrl: true,
  isActive: true,
  sortOrder: true,
  metadata: true,
});

// Schema for updating a service category
export const updateServiceCategorySchema = createServiceCategorySchema.partial().extend({
  id: uuidSchema.optional(), // Not updatable, just for validation
});

// Schema for service category search filters
export const serviceCategorySearchFiltersSchema = z.object({
  query: z.string().optional(),
  isActive: z.boolean().optional(),
  ...paginationSchema.shape,
});

// Schema for service category list response
export const serviceCategoryListResponseSchema = z.object({
  data: z.array(serviceCategorySchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});
