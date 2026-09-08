// Office Timezone Utilities for Swaati Enterprises (Default: Asia/Kolkata / IST)

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date in YYYY-MM-DD format strictly matching the configured office timezone.
 */
export function getOfficeTodayDateStr(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d); // YYYY-MM-DD
}

/**
 * Formats time in HH:MM AM/PM in office timezone.
 */
export function formatTimeIST(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats date into readable string like "Tuesday, 8 Sep 2026" in office timezone.
 */
export function formatOfficeDateDisplay(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
