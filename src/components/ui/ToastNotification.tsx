import { ToastContainer, ToastContainerProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastNotificationProps extends ToastContainerProps {
  autoClose?: number;
  hideProgressBar?: boolean;
  newestOnTop?: boolean;
  closeOnClick?: boolean;
  pauseOnFocusLoss?: boolean;
  pauseOnHover?: boolean;
  theme?: 'light' | 'dark' | 'colored';
}

const ToastNotification = ({
  autoClose = 5000,
  hideProgressBar = false,
  newestOnTop = false,
  closeOnClick = true,
  pauseOnFocusLoss = true,
  pauseOnHover = true,
  theme = 'light',
  ...props
}: ToastNotificationProps) => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={autoClose}
      hideProgressBar={hideProgressBar}
      newestOnTop={newestOnTop}
      closeOnClick={closeOnClick}
      pauseOnFocusLoss={pauseOnFocusLoss}
      pauseOnHover={pauseOnHover}
      theme={theme}
      {...props}
    />
  );
};

export default ToastNotification;