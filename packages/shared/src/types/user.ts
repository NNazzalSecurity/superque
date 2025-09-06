import { Role } from './common';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  role: Role;
  isVerified: boolean;
  language: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'role' | 'isVerified' | 'createdAt' | 'updatedAt'> {
  // Additional profile fields can be added here
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface UserStats {
  totalQueuesJoined: number;
  totalTimeSaved: number; // in minutes
  favoriteVenues: string[];
  lastVisitedVenues: string[];
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName?: string;
  deviceModel?: string;
  osName?: string;
  osVersion?: string;
  pushToken?: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
