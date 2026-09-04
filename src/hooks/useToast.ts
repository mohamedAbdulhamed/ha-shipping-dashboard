import { useCallback, useMemo } from 'react';
import { toast, ToastOptions } from 'react-toastify';

const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

/**
 * Custom hook to display toast notifications.
 *
 * @example
 * ```tsx
 * import { useToast } from './hooks/useToast';
 *
 * const MyComponent = () => {
 *   const { showToast } = useToast();
 *
 *   const handleClick = () => {
 *     showToast('This is a toast message!', {
 *       position: 'top-center',
 *       autoClose: 3000,
 *       theme: 'dark',
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleClick}>Show Toast</button>
 *   );
 * };
 * ```
 *
 * @returns {Object} An object containing the `showToast` function.
 * @returns {Function} showToast - Function to display a toast notification.
 * @param {string} message - The message to be displayed in the toast.
 * @param {ToastOptions} [options] - Optional configuration for the toast.
 */

export const useToast = () => {
  const defaults = useMemo(() => DEFAULT_TOAST_OPTIONS, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      toast(message, {
        ...defaults,
        ...options,
      });
    },
    [defaults]
  );

  return { showToast };
};