// Vietnam timezone utility for frontend datetime handling
// Vietnam is UTC+7

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Get current time in Vietnam timezone
 */
export function getVietnamNow(): Date {
  const now = new Date();
  
  // Format current UTC time to Vietnam time
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: VIETNAM_TIMEZONE }));
  return vietnamTime;
}

/**
 * Convert UTC date to Vietnam timezone
 */
export function convertToVietnamTime(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Convert to Vietnam timezone string, then back to Date
  const vietnamTimeString = date.toLocaleString('en-US', { timeZone: VIETNAM_TIMEZONE });
  return new Date(vietnamTimeString);
}

/**
 * Format date in Vietnam timezone for display
 */
export function formatVietnamDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: VIETNAM_TIMEZONE,
    ...options,
  };
  
  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(dateObj);
}

/**
 * Format date in Vietnam timezone for display (short format)
 */
export function formatVietnamDateShort(date: Date | string): string {
  return formatVietnamDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format time in Vietnam timezone for display
 */
export function formatVietnamTime(date: Date | string): string {
  return formatVietnamDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get Vietnam timezone offset in hours
 */
export function getVietnamTimezoneOffset(): number {
  const vietnamDate = new Date();
  const vietnamTimeString = vietnamDate.toLocaleString('en-US', { timeZone: VIETNAM_TIMEZONE });
  const vietnamTime = new Date(vietnamTimeString);
  
  const offsetMs = vietnamDate.getTime() - vietnamTime.getTime();
  return offsetMs / (1000 * 60 * 60); // Convert to hours
}
