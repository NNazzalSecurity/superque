export type Language = 'en' | 'ar';

export type Role = 'USER' | 'INSTITUTE' | 'ADMIN';

export type VerificationLevel = 'NONE' | 'BASIC' | 'FULL';

export type QueueEntryStatus = 'WAITING' | 'CALLED' | 'SERVED' | 'NOSHOW' | 'CANCELLED';

export type VenueType =
  | 'HOSPITAL'
  | 'CLINIC'
  | 'BANK'
  | 'RESTAURANT'
  | 'GOV'
  | 'UNIVERSITY'
  | 'EVENT'
  | 'OTHER';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
