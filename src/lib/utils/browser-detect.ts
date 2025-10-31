/**
 * Browser Detection Utilities
 *
 * Detects Samsung Internet Browser and other browsers with known
 * authentication compatibility issues.
 */

export function isSamsungBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Check for Samsung Internet Browser
  return (
    userAgent.includes('samsungbrowser') ||
    userAgent.includes('samsung') ||
    // Samsung Internet on older devices
    (userAgent.includes('android') && userAgent.includes('sm-'))
  );
}

export function getBrowserInfo() {
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      isSamsung: false,
      hasStorageIssues: false,
      recommendOTPFlow: false,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isSamsung = isSamsungBrowser();

  // Check if browser has known storage issues
  const hasStorageIssues = isSamsung || checkStorageAccess();

  return {
    name: isSamsung ? 'Samsung Internet' : 'Other',
    isSamsung,
    hasStorageIssues,
    // Recommend OTP flow for browsers with storage issues
    recommendOTPFlow: hasStorageIssues,
    userAgent: navigator.userAgent,
  };
}

/**
 * Test if browser supports reliable sessionStorage/localStorage
 */
function checkStorageAccess(): boolean {
  try {
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, 'test');
    const canRead = sessionStorage.getItem(testKey) === 'test';
    sessionStorage.removeItem(testKey);
    return !canRead;
  } catch (e) {
    // Storage is blocked
    return true;
  }
}

/**
 * Log browser detection info (useful for debugging Samsung issues)
 */
export function logBrowserInfo() {
  const info = getBrowserInfo();

  console.log('🌐 Browser Detection:', {
    name: info.name,
    isSamsung: info.isSamsung,
    hasStorageIssues: info.hasStorageIssues,
    recommendOTPFlow: info.recommendOTPFlow,
    userAgent: info.userAgent ? info.userAgent.substring(0, 100) + '...' : 'unknown',
  });

  if (info.isSamsung) {
    console.warn('⚠️ Samsung browser detected - using enhanced auth flow');
  }

  if (info.hasStorageIssues) {
    console.warn('⚠️ Browser has storage restrictions - PKCE flow may not work');
  }

  return info;
}
