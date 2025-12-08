/**
 * Utility functions for safe navigation that prevents DOM errors during unmounting
 */

/**
 * Cleanup all intervals and event listeners before navigation
 * This prevents React from trying to unmount components while they're updating state
 * NOTE: window.__isNavigating should be set BEFORE calling this function
 */
export function cleanupBeforeNavigation() {
  if (typeof window === 'undefined') return;

  // Clear all intervals (they're stored in a Set we'll track)
  if (window.__trackedIntervals) {
    window.__trackedIntervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    window.__trackedIntervals.clear();
  }
}

/**
 * Safe navigation that prevents removeChild errors
 * @param {string} url - The URL to navigate to
 * @returns {boolean} - Returns true if navigation was initiated, false on error
 * NOTE: window.__isNavigating should be set BEFORE calling this function
 */
export function safeNavigate(url) {
  if (typeof window === 'undefined') return false;

  try {
    // Cleanup intervals (flag should already be set)
    cleanupBeforeNavigation();

    // Navigate IMMEDIATELY without any delay
    // window.location.href causes a full page reload which will cleanly unmount everything
    // Using replace() instead of href to avoid adding to history
    window.location.replace(url);
    
    return true;
  } catch (error) {
    console.error('Erreur dans safeNavigate:', error);
    if (typeof window !== 'undefined') {
      window.__isNavigating = false;
    }
    return false;
  }
}


/**
 * Initialize navigation tracking
 * Call this once in your app initialization
 */
export function initNavigationTracking() {
  if (typeof window === 'undefined') return;

  // Track all intervals so we can clear them before navigation
  if (!window.__trackedIntervals) {
    window.__trackedIntervals = new Set();
    
    // Override setInterval to track intervals
    const originalSetInterval = window.setInterval;
    window.setInterval = function(...args) {
      const intervalId = originalSetInterval.apply(this, args);
      window.__trackedIntervals.add(intervalId);
      return intervalId;
    };

    // Override clearInterval to untrack intervals
    const originalClearInterval = window.clearInterval;
    window.clearInterval = function(intervalId) {
      if (window.__trackedIntervals) {
        window.__trackedIntervals.delete(intervalId);
      }
      return originalClearInterval.apply(this, [intervalId]);
    };
  }

  // Reset navigation flag on page load
  window.__isNavigating = false;
}

