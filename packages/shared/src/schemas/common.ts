import { z } from 'zod';
import { 
  QueueEntryStatus, 
  VenueType,
  VerificationLevel 
} from '../types/common';

// Base schema for pagination
export const paginationSchema = z.object({
  page: z
    .preprocess(
      (val) => parseInt(String(val)),
      z.number().int().positive().default(1)
    )
    .optional()
    .describe('Page number, starting from 1'),
  limit: z
    .preprocess(
      (val) => parseInt(String(val)),
      z.number().int().positive().max(100).default(10)
    )
    .optional()
    .describe('Number of items per page (max 100)'),
  sortBy: z.string().optional().describe('Field to sort by'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc')
    .describe('Sort order: asc or desc'),
});

// Base schema for search
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').optional(),
  filters: z.record(z.unknown()).optional(),
  ...paginationSchema.shape,
});

// Schema for coordinates
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

// Schema for address
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: coordinatesSchema.optional(),
});

// Schema for phone numbers
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'Phone number must be in E.164 format (e.g., +1234567890)'
  );

// Schema for email addresses
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

// Schema for password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

// Schema for date range
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

// Schema for time range
export const timeRangeSchema = z.object({
  startTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ),
  endTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ),
}).refine(data => {
  const [startHour, startMinute] = data.startTime.split(':').map(Number);
  const [endHour, endMinute] = data.endTime.split(':').map(Number);
  
  return (
    endHour > startHour || 
    (endHour === startHour && endMinute > startMinute)
  );
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Schema for operating hours
export const operatingHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ),
  closeTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format'
  ),
  is24Hours: z.boolean().default(false),
  isClosed: z.boolean().default(false),
}).refine(
  data => data.isClosed || data.is24Hours || data.closeTime > data.openTime,
  {
    message: 'Close time must be after open time',
    path: ['closeTime'],
  }
);

// Schema for file uploads
export const fileUploadSchema = z.object({
  originalname: z.string(),
  mimetype: z.string(),
  size: z.number(),
  buffer: z.instanceof(Buffer),
  encoding: z.string(),
  fieldname: z.string(),
});

// Schema for file validation
export const fileValidationSchema = (options: {
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}) => {
  const { allowedTypes = [], maxSize = 5 * 1024 * 1024 } = options;
  
  return z.object({
    mimetype: z.string().refine(
      type => allowedTypes.length === 0 || allowedTypes.includes(type),
      `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    ),
    size: z.number().max(
      maxSize,
      `File size must be less than ${maxSize / (1024 * 1024)}MB`
    ),
  });
};

// Schema for paginated response
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    data: z.array(schema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  });
};

// Schema for validation error response
export const validationErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    })
  ),
});

// Schema for error response
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
  timestamp: z.string(),
  path: z.string().optional(),
});

// Schema for success response
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) => {
  return z.object({
    success: z.literal(true),
    data: dataSchema || z.any(),
  });
};

// Schema for API response
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) => {
  return z.union([
    successResponseSchema(dataSchema),
    errorResponseSchema,
  ]);
};

// Schema for ID parameters
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Schema for batch operations
export const batchOperationSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID format')).min(1, 'At least one ID is required'),
});

// Schema for search queries
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  filters: z.record(z.unknown()).optional(),
  ...paginationSchema.shape,
});

// Schema for sorting
export const sortSchema = z.object({
  field: z.string().min(1, 'Sort field is required'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Schema for date filters
export const dateFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
}).refine(
  data => !(data.from && data.to) || new Date(data.to!) >= new Date(data.from!),
  {
    message: 'End date must be after or equal to start date',
    path: ['to'],
  }
);

// Schema for coordinates with optional radius
export const coordinatesWithRadiusSchema = coordinatesSchema.extend({
  radius: z.number().positive().default(10), // in kilometers
});

// Schema for timezone
export const timezoneSchema = z
  .string()
  .regex(
    /^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/,
    'Invalid timezone format (e.g., America/New_York)'
  );

// Schema for language code
export const languageCodeSchema = z.enum(['en', 'ar']);

// Schema for currency code (ISO 4217)
export const currencyCodeSchema = z.string().length(3, 'Invalid currency code');

// Schema for URL
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    url => {
      try {
        const { protocol } = new URL(url);
        return protocol === 'http:' || protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must start with http:// or https://' }
  );

// Schema for image URL
export const imageUrlSchema = urlSchema.refine(
  url => /.(jpg|jpeg|png|webp|gif)$/i.test(url),
  'URL must point to a valid image (jpg, jpeg, png, webp, gif)'
);

// Schema for phone or email
export const phoneOrEmailSchema = z.union([phoneSchema, emailSchema]);

// Schema for JWT token
export const jwtTokenSchema = z.string().regex(
  /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
  'Invalid JWT token format'
);

// Schema for UUID
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Schema for enum values
export const enumSchema = <T extends [string, ...string[]]>(values: T) =>
  z.enum(values);

// Schema for queue entry status
export const queueEntryStatusSchema = enumSchema<[
  'WAITING', 'CALLED', 'SERVED', 'NOSHOW', 'CANCELLED'
]>();

// Schema for venue type
export const venueTypeSchema = enumSchema<[
  'HOSPITAL', 'CLINIC', 'BANK', 'RESTAURANT', 'GOV', 'UNIVERSITY', 'EVENT', 'OTHER'
]>();

// Schema for verification level
export const verificationLevelSchema = enumSchema<[
  'NONE', 'BASIC', 'FULL'
]>();

// Schema for user role
export const userRoleSchema = enumSchema<[
  'USER', 'INSTITUTE', 'ADMIN'
]>();

// Schema for day of week
export const dayOfWeekSchema = z.number().int().min(0).max(6);

// Schema for time in HH:MM format
export const timeStringSchema = z.string().regex(
  /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Time must be in HH:MM format'
);

// Schema for duration in seconds
export const durationSchema = z.number().int().nonnegative('Duration must be a non-negative number');

// Schema for percentage (0-100)
export const percentageSchema = z.number().min(0).max(100);

// Schema for rating (1-5)
export const ratingSchema = z.number().min(1).max(5);

// Schema for boolean string ('true' or 'false')
export const booleanStringSchema = z.enum(['true', 'false']).transform(val => val === 'true');

// Schema for comma-separated values
export const csvSchema = z.string().transform(
  val => val.split(',').map(item => item.trim()).filter(Boolean)
);

// Schema for JSON string
export const jsonStringSchema = z.string().transform(
  (val, ctx) => {
    try {
      return JSON.parse(val);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JSON string',
      });
      return z.NEVER;
    }
  }
);

// Schema for case-insensitive enum
export const caseInsensitiveEnum = <T extends string>(values: readonly T[]) => 
  z.string().transform((val, ctx) => {
    const found = values.find(
      v => v.toLowerCase() === val.toLowerCase()
    );
    
    if (!found) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_enum_value,
        options: values as [string, ...string[]],
      });
      return z.NEVER;
    }
    
    return found as T;
  });
