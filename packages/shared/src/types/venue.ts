import { VenueType, Coordinates } from './common';

export interface Venue {
  id: string;
  instituteId: string;
  name: string;
  description?: string;
  type: VenueType;
  address: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  phoneNumber?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  isOpen: boolean;
  averageRating?: number;
  reviewCount: number;
  averageWaitTime?: number; // in seconds
  currentQueueLength: number;
  maxQueueCapacity?: number;
  operatingHours: VenueOperatingHours[];
  services: VenueService[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueOperatingHours {
  id: string;
  venueId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
  is24Hours: boolean;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueService {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  averageServiceTime: number; // in seconds
  isActive: boolean;
  priority: number;
  currentQueueLength: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueStats {
  totalVisitors: number;
  averageWaitTime: number; // in minutes
  averageServiceTime: number; // in minutes
  peakHours: {
    hour: number;
    day: string;
    averageWaitTime: number;
  }[];
  noShowRate: number; // percentage
  repeatVisitors: number; // percentage
}

export interface VenueSearchParams {
  query?: string;
  location?: Coordinates;
  radius?: number; // in meters
  types?: VenueType[];
  isOpenNow?: boolean;
  minRating?: number;
  hasQueue?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'distance' | 'rating' | 'waitTime' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface VenueSearchResult {
  venues: Venue[];
  total: number;
  limit: number;
  offset: number;
}
