import { format, parseISO, isValid, addHours } from 'date-fns';

/**
 * Formats a date to a readable string with time
 * @param date Date to format
 * @param formatStr Optional format string
 * @returns Formatted date string
 */
export const formatDateTime = (date: Date | string, formatStr = 'MMM dd, yyyy HH:mm'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a date with UTC offset
 * @param date Date to format
 * @returns Formatted date string with UTC offset
 */
export const formatUTCDateTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return `${format(dateObj, 'MMM dd, yyyy HH:mm')} UTC`;
  } catch (error) {
    console.error('Error formatting UTC date:', error);
    return 'Invalid date';
  }
};

/**
 * Converts a local date to UTC
 * @param date Local date
 * @returns UTC date
 */
export const toUTC = (date: Date): Date => {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

/**
 * Converts a UTC date to local
 * @param date UTC date
 * @returns Local date
 */
export const toLocal = (date: Date): Date => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

/**
 * Returns a formatted time only from date
 * @param date Date to extract time from
 * @returns Formatted time string
 */
export const formatTimeOnly = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid time';
    }
    return format(dateObj, 'HH:mm');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Adds hours to a date
 * @param date Date to add hours to
 * @param hours Number of hours to add
 * @returns New date with hours added
 */
export const addHoursToDate = (date: Date, hours: number): Date => {
  return addHours(date, hours);
};
