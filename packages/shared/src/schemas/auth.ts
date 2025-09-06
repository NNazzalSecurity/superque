import { z } from 'zod';
import { 
  phoneSchema, 
  emailSchema, 
  passwordSchema, 
  jwtTokenSchema 
} from './common';

// Schema for login request
export const loginRequestSchema = z.object({
  // Either phone or email must be provided
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  fcmToken: z.string().optional(),
}).refine(
  data => data.phone || data.email,
  {
    message: 'Either phone or email must be provided',
    path: ['phone']
  }
);

// Schema for login response
export const loginResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    name: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
    role: z.enum(['USER', 'INSTITUTE', 'ADMIN']),
    isVerified: z.boolean(),
  }),
});

// Schema for registration request
export const registerRequestSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  userType: z.enum(['USER', 'INSTITUTE']).default('USER'),
  // Additional fields for institute registration
  instituteName: z.string().optional(),
  instituteType: z.enum(['INDIVIDUAL', 'BUSINESS', 'ORGANIZATION']).optional(),
  // Additional fields for user registration
  dateOfBirth: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date of birth must be in YYYY-MM-DD format'
  ).optional(),
}).refine(
  data => data.email || data.phone,
  {
    message: 'Either email or phone must be provided',
    path: ['email']
  }
).refine(
  data => {
    if (data.userType === 'INSTITUTE' && !data.instituteName) {
      return false;
    }
    return true;
  },
  {
    message: 'Institute name is required for business/organization accounts',
    path: ['instituteName']
  }
);

// Schema for registration response
export const registerResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  name: z.string(),
  role: z.enum(['USER', 'INSTITUTE', 'ADMIN']),
  isVerified: z.boolean(),
  verificationToken: z.string().optional(),
});

// Schema for email verification request
export const emailVerificationRequestSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Schema for phone verification request
export const phoneVerificationRequestSchema = z.object({
  phone: phoneSchema,
  code: z.string().min(4, 'Verification code must be at least 4 digits'),
});

// Schema for verification response
export const verificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  accessToken: jwtTokenSchema.optional(),
  refreshToken: jwtTokenSchema.optional(),
});

// Schema for forgot password request
export const forgotPasswordRequestSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
}).refine(
  data => data.email || data.phone,
  {
    message: 'Either email or phone must be provided',
    path: ['email']
  }
);

// Schema for reset password request
export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
);

// Schema for change password request
export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
  data => data.newPassword === data.confirmNewPassword,
  {
    message: 'New passwords do not match',
    path: ['confirmNewPassword']
  }
).refine(
  data => data.newPassword !== data.currentPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword']
  }
);

// Schema for refresh token request
export const refreshTokenRequestSchema = z.object({
  refreshToken: jwtTokenSchema,
});

// Schema for refresh token response
export const refreshTokenResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
});

// Schema for OAuth login request
export const oauthLoginRequestSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple', 'github']),
  accessToken: z.string().min(1, 'Access token is required'),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  fcmToken: z.string().optional(),
});

// Schema for OAuth registration request
export const oauthRegisterRequestSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple', 'github']),
  accessToken: z.string().min(1, 'Access token is required'),
  userType: z.enum(['USER', 'INSTITUTE']).default('USER'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  // Additional fields for institute registration
  instituteName: z.string().optional(),
  instituteType: z.enum(['INDIVIDUAL', 'BUSINESS', 'ORGANIZATION']).optional(),
}).refine(
  data => {
    if (data.userType === 'INSTITUTE' && !data.instituteName) {
      return false;
    }
    return true;
  },
  {
    message: 'Institute name is required for business/organization accounts',
    path: ['instituteName']
  }
);

// Schema for OAuth response
export const oauthResponseSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
  isNewUser: z.boolean(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    name: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
    role: z.enum(['USER', 'INSTITUTE', 'ADMIN']),
    isVerified: z.boolean(),
  }),
});

// Schema for logout request
export const logoutRequestSchema = z.object({
  refreshToken: jwtTokenSchema.optional(),
  deviceId: z.string().optional(),
  allDevices: z.boolean().default(false),
});

// Schema for device information
export const deviceInfoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  type: z.string().nullable(),
  os: z.string().nullable(),
  browser: z.string().nullable(),
  ipAddress: z.string().nullable(),
  lastActive: z.string().datetime(),
  isCurrent: z.boolean().default(false),
});

// Schema for device list response
export const deviceListResponseSchema = z.object({
  devices: z.array(deviceInfoSchema),
  currentDeviceId: z.string().nullable(),
});

// Schema for revoke device access request
export const revokeDeviceAccessRequestSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
});

// Schema for update profile request
export const updateProfileRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  avatar: z.any().optional(), // For file upload
  currentPassword: z.string().optional(), // Required if changing email/phone
}).refine(
  data => !(data.email || data.phone) || data.currentPassword,
  {
    message: 'Current password is required to update email or phone',
    path: ['currentPassword']
  }
);

// Schema for update password request
export const updatePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
  data => data.newPassword === data.confirmNewPassword,
  {
    message: 'New passwords do not match',
    path: ['confirmNewPassword']
  }
).refine(
  data => data.newPassword !== data.currentPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword']
  }
);

// Schema for delete account request
export const deleteAccountRequestSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.string().optional(),
});

// Schema for verify email request
export const verifyEmailRequestSchema = z.object({
  email: emailSchema,
});

// Schema for verify phone request
export const verifyPhoneRequestSchema = z.object({
  phone: phoneSchema,
});

// Schema for verify code request
export const verifyCodeRequestSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  code: z.string().min(4, 'Verification code must be at least 4 digits'),
}).refine(
  data => data.email || data.phone,
  {
    message: 'Either email or phone must be provided',
    path: ['email']
  }
);

// Schema for user session
export const userSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deviceId: z.string(),
  refreshToken: jwtTokenSchema,
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for auth tokens
export const authTokensSchema = z.object({
  accessToken: jwtTokenSchema,
  refreshToken: jwtTokenSchema,
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
});

// Schema for user claims
export const userClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  role: z.enum(['USER', 'INSTITUTE', 'ADMIN']),
  isVerified: z.boolean(),
  iat: z.number(),
  exp: z.number(),
});

// Schema for token validation response
export const tokenValidationResponseSchema = z.object({
  isValid: z.boolean(),
  isExpired: z.boolean().optional(),
  error: z.string().optional(),
  user: userClaimsSchema.optional(),
});

// Schema for auth state
export const authStateSchema = z.object({
  isAuthenticated: z.boolean(),
  isInitialized: z.boolean(),
  user: userClaimsSchema.nullable(),
  token: z.string().nullable(),
});

// Schema for auth configuration
export const authConfigSchema = z.object({
  accessTokenExpiry: z.number().int().positive().default(900), // 15 minutes
  refreshTokenExpiry: z.number().int().positive().default(2592000), // 30 days
  otpExpiry: z.number().int().positive().default(300), // 5 minutes
  passwordResetExpiry: z.number().int().positive().default(3600), // 1 hour
  emailVerificationExpiry: z.number().int().positive().default(86400), // 24 hours
  maxLoginAttempts: z.number().int().positive().default(5),
  lockoutTime: z.number().int().positive().default(900), // 15 minutes
  requireEmailVerification: z.boolean().default(false),
  requirePhoneVerification: z.boolean().default(false),
  enable2FA: z.boolean().default(false),
});
