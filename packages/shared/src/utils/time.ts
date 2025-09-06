type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

export class TimeUtils {
  private static readonly MS_IN_SECOND = 1000;
  private static readonly MS_IN_MINUTE = 60 * TimeUtils.MS_IN_SECOND;
  private static readonly MS_IN_HOUR = 60 * TimeUtils.MS_IN_MINUTE;
  private static readonly MS_IN_DAY = 24 * TimeUtils.MS_IN_HOUR;
  private static readonly MS_IN_WEEK = 7 * TimeUtils.MS_IN_DAY;

  /**
   * Converts a time value to milliseconds
   */
  static toMilliseconds(value: number, unit: TimeUnit): number {
    switch (unit) {
      case 'milliseconds':
        return value;
      case 'seconds':
        return value * this.MS_IN_SECOND;
      case 'minutes':
        return value * this.MS_IN_MINUTE;
      case 'hours':
        return value * this.MS_IN_HOUR;
      case 'days':
        return value * this.MS_IN_DAY;
      case 'weeks':
        return value * this.MS_IN_WEEK;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  /**
   * Formats a duration in milliseconds to a human-readable string
   */
  static formatDuration(ms: number, precision: number = 2): string {
    if (ms < 1000) return `${ms}ms`;
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 
        ? `${minutes}m ${remainingSeconds}s` 
        : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days < 7) {
      return remainingHours > 0 
        ? `${days}d ${remainingHours}h` 
        : `${days}d`;
    }
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    const parts: string[] = [];
    if (weeks > 0) parts.push(`${weeks}w`);
    if (remainingDays > 0) parts.push(`${remainingDays}d`);
    
    return parts.join(' ');
  }

  /**
   * Formats a date to a relative time string (e.g., "2 hours ago")
   */
  static timeAgo(date: Date | string | number): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return seconds <= 0 ? 'just now' : `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  }

  /**
   * Formats a date to a standard format (e.g., "Jan 1, 2023, 12:00 PM")
   */
  static formatDateTime(
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
  ): string {
    return new Date(date).toLocaleString('en-US', options);
  }

  /**
   * Calculates the difference between two dates in the specified unit
   */
  static dateDiff(
    date1: Date | string | number,
    date2: Date | string | number = new Date(),
    unit: TimeUnit = 'milliseconds'
  ): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    
    switch (unit) {
      case 'milliseconds':
        return diffMs;
      case 'seconds':
        return diffMs / this.MS_IN_SECOND;
      case 'minutes':
        return diffMs / this.MS_IN_MINUTE;
      case 'hours':
        return diffMs / this.MS_IN_HOUR;
      case 'days':
        return diffMs / this.MS_IN_DAY;
      case 'weeks':
        return diffMs / this.MS_IN_WEEK;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  /**
   * Adds a specified amount of time to a date
   */
  static addTime(
    date: Date | string | number,
    amount: number,
    unit: TimeUnit
  ): Date {
    const d = new Date(date);
    const ms = this.toMilliseconds(amount, unit);
    return new Date(d.getTime() + ms);
  }

  /**
   * Subtracts a specified amount of time from a date
   */
  static subtractTime(
    date: Date | string | number,
    amount: number,
    unit: TimeUnit
  ): Date {
    return this.addTime(date, -amount, unit);
  }

  /**
   * Checks if a date is between two other dates (inclusive)
   */
  static isBetween(
    date: Date | string | number,
    start: Date | string | number,
    end: Date | string | number
  ): boolean {
    const d = new Date(date).getTime();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return d >= s && d <= e;
  }

  /**
   * Gets the start of a time period (e.g., start of day, start of hour)
   */
  static startOf(
    date: Date | string | number,
    unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'
  ): Date {
    const d = new Date(date);
    
    switch (unit) {
      case 'year':
        return new Date(d.getFullYear(), 0, 1);
      case 'month':
        return new Date(d.getFullYear(), d.getMonth(), 1);
      case 'week': {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
      }
      case 'day':
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      case 'hour':
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours());
      case 'minute':
        return new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          d.getHours(),
          d.getMinutes()
        );
      case 'second':
        return new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          d.getHours(),
          d.getMinutes(),
          d.getSeconds()
        );
      default:
        throw new Error(`Unsupported unit: ${unit}`);
    }
  }

  /**
   * Gets the end of a time period (e.g., end of day, end of hour)
   */
  static endOf(
    date: Date | string | number,
    unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'
  ): Date {
    const d = new Date(date);
    
    switch (unit) {
      case 'year':
        return new Date(d.getFullYear() + 1, 0, 0, 23, 59, 59, 999);
      case 'month':
        return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      case 'week': {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 6; // End of week (Saturday)
        return new Date(d.getFullYear(), d.getMonth(), diff, 23, 59, 59, 999);
      }
      case 'day':
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
      case 'hour':
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1, 0, 0, 0);
      case 'minute':
        return new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          d.getHours(),
          d.getMinutes() + 1,
          0,
          0
        );
      case 'second':
        return new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          d.getHours(),
          d.getMinutes(),
          d.getSeconds() + 1,
          0
        );
      default:
        throw new Error(`Unsupported unit: ${unit}`);
    }
  }

  /**
   * Checks if a year is a leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Gets the number of days in a month
   */
  static daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Parses a time string (e.g., "2h 30m") into milliseconds
   */
  static parseDuration(timeString: string): number {
    const timeRegex = /(\d+)([smhdw])/g;
    let match;
    let totalMs = 0;
    
    while ((match = timeRegex.exec(timeString)) !== null) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      
      switch (unit) {
        case 's':
          totalMs += value * 1000;
          break;
        case 'm':
          totalMs += value * 60 * 1000;
          break;
        case 'h':
          totalMs += value * 60 * 60 * 1000;
          break;
        case 'd':
          totalMs += value * 24 * 60 * 60 * 1000;
          break;
        case 'w':
          totalMs += value * 7 * 24 * 60 * 60 * 1000;
          break;
      }
    }
    
    return totalMs || 0;
  }
}
