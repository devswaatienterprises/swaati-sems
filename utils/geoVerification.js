/**
 * geoVerification.js
 * Frontend GPS location helper for Attendance Verification.
 * Browser-side only — never used on the server.
 */

/**
 * Request the device GPS location.
 * Resolves with { lat, lng, accuracy, capturedAt } on success.
 * Resolves with { unavailable: true, reason } if denied/unavailable.
 * @param {number} timeoutMs  Maximum wait in ms (default 8000)
 */
export function requestGPSLocation(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) {
      resolve({ unavailable: true, reason: 'Geolocation API not supported by browser' });
      return;
    }

    const timer = setTimeout(() => {
      resolve({ unavailable: true, reason: 'GPS location request timed out' });
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timer);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
          unavailable: false,
        });
      },
      (err) => {
        clearTimeout(timer);
        const reasons = {
          1: 'Location permission denied by user',
          2: 'Position unavailable (GPS/network error)',
          3: 'GPS location request timed out',
        };
        resolve({
          unavailable: true,
          reason: reasons[err.code] || 'GPS location unavailable',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs - 500,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Build the GPS body params to include in check-in/check-out POST request.
 * @param {object} gpsResult  Result from requestGPSLocation()
 * @returns {object}  Fields to spread into the API request body
 */
export function buildGPSBodyParams(gpsResult) {
  if (!gpsResult || gpsResult.unavailable) {
    return { gpsUnavailable: true };
  }
  return {
    gpsLat: gpsResult.lat,
    gpsLng: gpsResult.lng,
    gpsAccuracy: gpsResult.accuracy,
    gpsCapturedAt: gpsResult.capturedAt,
    gpsUnavailable: false,
  };
}
