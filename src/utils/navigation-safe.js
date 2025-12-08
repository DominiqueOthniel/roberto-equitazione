/**
 * Utility functions for safe navigation that prevents DOM errors during unmounting
 */

/**
 * Cleanup all intervals and event listeners before navigation
 * This prevents React from trying to unmount components while they're updating state
 */
export function cleanupBeforeNavigation() {
  if (typeof window === 'undefined') return;

  // Mark that navigation is in progress
  window.__isNavigating = true;

  // Clear all intervals (they're stored in a Set we'll track)
  if (window.__trackedIntervals) {
    window.__trackedIntervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    window.__trackedIntervals.clear();
  }

  // Force React to flush all pending updates before navigation
  // This ensures no state updates happen during unmounting
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      // Navigation will happen in the next frame
    }, { timeout: 0 });
  }
}

/**
 * Safe navigation that prevents removeChild errors
 * @param {string} url - The URL to navigate to
 * @returns {boolean} - Returns true if navigation was initiated, false on error
 */
export function safeNavigate(url) {
  if (typeof window === 'undefined') return false;

  try {
    // Cleanup before navigation
    cleanupBeforeNavigation();

    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      try {
        // Double-check navigation flag
        if (window.__isNavigating) {
          // Navigate immediately - this is a fire-and-forget operation
          // We don't wait for it to complete
          window.location.href = url;
        }
      } catch (error) {
        console.error('Erreur lors de la navigation:', error);
        // Reset navigation flag on error
        if (typeof window !== 'undefined') {
          window.__isNavigating = false;
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erreur dans safeNavigate:', error);
    // Reset navigation flag on error
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

