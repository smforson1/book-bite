import { useState, useCallback } from 'react';
import { Alert, ToastAndroid, Platform } from 'react-native';
import { errorHandlingService } from '../services/errorHandlingService';

interface ErrorState {
  hasError: boolean;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

interface UseErrorHandlingReturn {
  error: ErrorState | null;
  loading: boolean;
  setError: (message: string, type?: 'error' | 'warning' | 'info' | 'success') => void;
  clearError: () => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: {
      errorMessage?: string;
      successMessage?: string;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
    }
  ) => (...args: T) => Promise<R | undefined>;
  showUserFeedback: (
    message: string,
    type: 'error' | 'warning' | 'info' | 'success',
    duration?: number
  ) => void;
}

export const useErrorHandling = (): UseErrorHandlingReturn => {
  const [error, setErrorState] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState(false);

  const setError = useCallback(
    (message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error') => {
      setErrorState({ hasError: true, message, type });
    },
    []
  );

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const showUserFeedback = useCallback(
    (
      message: string,
      type: 'error' | 'warning' | 'info' | 'success',
      duration: number = 3000
    ) => {
      // Log the error
      errorHandlingService.logError({
        type: type === 'error' ? 'ui' : type === 'warning' ? 'ui' : 'unknown',
        severity: type === 'error' ? 'high' : type === 'warning' ? 'medium' : 'low',
        message,
        context: {
          action: 'user_feedback',
        },
        userImpact: type === 'error' ? 'severe' : type === 'warning' ? 'moderate' : 'none',
      });

      // Show visual feedback
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, duration > 3000 ? ToastAndroid.LONG : ToastAndroid.SHORT);
      } else {
        // On iOS, we would use a custom toast component
        Alert.alert(
          type.charAt(0).toUpperCase() + type.slice(1),
          message,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    },
    []
  );

  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      options: {
        errorMessage?: string;
        successMessage?: string;
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
      } = {}
    ) => {
      return async (...args: T): Promise<R | undefined> => {
        setLoading(true);
        clearError();

        try {
          const result = await fn(...args);

          if (options.successMessage && options.showSuccessToast) {
            showUserFeedback(options.successMessage, 'success');
          }

          setLoading(false);
          return result;
        } catch (error: any) {
          const errorMessage =
            options.errorMessage ||
            error.message ||
            'An unexpected error occurred. Please try again.';

          if (options.showErrorToast !== false) {
            showUserFeedback(errorMessage, 'error');
          }

          setError(errorMessage);

          // Log to error handling service
          await errorHandlingService.logError({
            type: 'api',
            severity: 'medium',
            message: errorMessage,
            stack: error.stack,
            context: {
              action: fn.name || 'unknown_function',
            },
            userImpact: 'moderate',
          });

          setLoading(false);
          return undefined;
        }
      };
    },
    [clearError, setError, showUserFeedback]
  );

  return {
    error,
    loading,
    setError,
    clearError,
    withErrorHandling,
    showUserFeedback,
  };
};