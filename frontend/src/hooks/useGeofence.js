import { useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Custom hook to track visitor location and auto-checkout on geofence breach.
 * @param {string} logId - The ID of the active visit log.
 * @param {boolean} isActive - Whether the tracking should be active.
 */
export const useGeofence = (logId, isActive) => {
  const watchId = useRef(null);
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (!isActive || !logId) return;

    if (!('geolocation' in navigator)) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    const sendLocation = async (latitude, longitude) => {
      try {
        const response = await axios.post('/api/visitors/location-update', {
          logId, latitude, longitude
        });

        if (response.data.checkedOut) {
          // Clear the active visit
          localStorage.removeItem('activeVisitLogId');

          // Show a styled notification instead of a raw alert
          showGeofenceAlert(response.data.distance);

          // Redirect to login after 4 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 4000);
        }
      } catch (err) {
        console.error('Failed to send location update:', err);
      }
    };

    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      const now = Date.now();
      // Update every 60 seconds
      if (now - lastUpdate.current > 60000) {
        lastUpdate.current = now;
        sendLocation(latitude, longitude);
      }
    };

    const handleError = (error) => {
      console.error('Error watching location:', error.message);
    };

    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [logId, isActive]);
};

/**
 * Show a styled floating geofence alert overlay
 */
function showGeofenceAlert(distance) {
  const existing = document.getElementById('geofence-alert');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'geofence-alert';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.3s ease;
  `;
  overlay.innerHTML = `
    <style>@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }</style>
    <div style="
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 24px; padding: 40px;
      max-width: 380px; text-align: center;
      box-shadow: 0 0 60px rgba(239,68,68,0.2);
    ">
      <div style="font-size: 3rem; margin-bottom: 16px;">🚨</div>
      <h2 style="color: #f87171; font-size: 1.25rem; font-weight: 900; margin: 0 0 8px; letter-spacing: -0.02em;">
        Outside Office Boundary
      </h2>
      <p style="color: #9ca3af; font-size: 0.85rem; line-height: 1.6; margin: 0 0 20px;">
        You have moved <strong style="color: #f87171">${Math.round(distance)}m</strong> away from the office.
        Your visit has been automatically checked out.
      </p>
      <div style="
        background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
        border-radius: 12px; padding: 12px; color: #fca5a5; font-size: 0.75rem; font-weight: 700;
      ">
        Logging out in 4 seconds…
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}
