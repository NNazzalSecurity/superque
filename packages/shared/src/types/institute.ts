import { VerificationLevel } from './common';

export interface InstituteProfile {
  id: string;
  userId: string;
  legalName: string;
  tradingName?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  website?: string;
  phoneNumber: string;
  email: string;
  taxId?: string;
  registrationNumber?: string;
  verificationLevel: VerificationLevel;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstituteAddress {
  id: string;
  instituteId: string;
  country: string;
  city: string;
  state?: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstituteHours {
  id: string;
  instituteId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstituteStats {
  totalVenues: number;
  activeQueues: number;
  totalServed: number;
  averageWaitTime: number; // in minutes
  averageServiceTime: number; // in minutes
  noShowRate: number; // percentage
  customerSatisfaction?: number; // 1-5 rating
}

export interface VerificationDocument {
  id: string;
  instituteId: string;
  documentType: 'LICENSE' | 'REGISTRATION' | 'UTILITY_BILL' | 'TAX_DOCUMENT' | 'OTHER';
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
