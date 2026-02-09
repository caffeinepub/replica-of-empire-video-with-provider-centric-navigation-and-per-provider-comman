/**
 * Utility for classifying backend errors and providing user-friendly messages
 */

export interface BackendErrorInfo {
  userMessage: string;
  actionSteps: string[];
  isStoppedCanister: boolean;
  isNetworkError: boolean;
  isAuthError: boolean;
}

/**
 * Detects if an error is related to a stopped canister (IC0508 / Reject code: 5)
 */
export function isStoppedCanisterError(error: Error | unknown): boolean {
  if (!error) return false;
  
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();
  
  return (
    lowerMessage.includes('ic0508') ||
    (lowerMessage.includes('reject code') && lowerMessage.includes('5')) ||
    (lowerMessage.includes('canister') && lowerMessage.includes('stopped'))
  );
}

/**
 * Classifies a backend error and returns user-friendly information
 */
export function classifyBackendError(error: Error | unknown, isAuthenticated: boolean = true): BackendErrorInfo {
  if (!error) {
    return {
      userMessage: 'An unknown error occurred.',
      actionSteps: ['Please try again'],
      isStoppedCanister: false,
      isNetworkError: false,
      isAuthError: false,
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Stopped canister error (IC0508 / Reject code: 5)
  if (isStoppedCanisterError(error)) {
    return {
      userMessage: 'The backend canister is currently stopped or unavailable.',
      actionSteps: [
        'Wait a moment and try again',
        'Click "Retry Connection" if available',
        'Reload the page if the issue persists',
      ],
      isStoppedCanister: true,
      isNetworkError: false,
      isAuthError: false,
    };
  }

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('failed to fetch')) {
    return {
      userMessage: 'Network connection failed. Please check your internet connection.',
      actionSteps: [
        'Check your internet connection',
        'Try again in a moment',
        'Reload the page if needed',
      ],
      isStoppedCanister: false,
      isNetworkError: true,
      isAuthError: false,
    };
  }

  // Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('permission') || lowerMessage.includes('not authenticated')) {
    const steps = isAuthenticated
      ? ['Try logging out and back in', 'Reload the page']
      : ['Log in to continue', 'Reload the page if needed'];
    
    return {
      userMessage: 'Authentication failed. Please verify your login status.',
      actionSteps: steps,
      isStoppedCanister: false,
      isNetworkError: false,
      isAuthError: true,
    };
  }

  // Timeout errors
  if (lowerMessage.includes('timeout')) {
    return {
      userMessage: 'Connection timed out. The backend may be temporarily unavailable.',
      actionSteps: [
        'Wait a moment and try again',
        'Check your internet connection',
        'Reload the page if the issue persists',
      ],
      isStoppedCanister: false,
      isNetworkError: true,
      isAuthError: false,
    };
  }

  // Connection not ready
  if (lowerMessage.includes('not ready') || lowerMessage.includes('still connecting')) {
    return {
      userMessage: 'Still connecting to the backend. Please wait a moment.',
      actionSteps: [
        'Wait for the connection to complete',
        'Try again in a few seconds',
      ],
      isStoppedCanister: false,
      isNetworkError: false,
      isAuthError: false,
    };
  }

  // Generic backend error
  return {
    userMessage: 'Could not connect to the backend. Please try again.',
    actionSteps: [
      'Wait a moment and try again',
      'Reload the page if needed',
      'Check your internet connection',
    ],
    isStoppedCanister: false,
    isNetworkError: false,
    isAuthError: false,
  };
}

/**
 * Gets a concise user-friendly error message (for toasts)
 */
export function getUserFriendlyErrorMessage(error: Error | unknown, isAuthenticated: boolean = true): string {
  const info = classifyBackendError(error, isAuthenticated);
  return info.userMessage;
}

/**
 * Sanitizes error for logging (removes sensitive data but keeps useful debug info)
 */
export function sanitizeErrorForLogging(error: Error | unknown): string {
  if (!error) return 'Unknown error';
  
  const message = error instanceof Error ? error.message : String(error);
  
  // Keep first 500 chars for debugging, but don't expose full replica payloads to users
  return message.substring(0, 500);
}
