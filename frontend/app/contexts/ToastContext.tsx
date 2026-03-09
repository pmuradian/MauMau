import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import './toast.css';

interface Toast {
  id: number;
  message: string;
  type: 'error';
  dismissing: boolean;
}

interface ToastContextType {
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_DURATION = 5000;
const DISMISS_ANIMATION = 300;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const location = useLocation();

  // Dismiss all toasts on navigation
  useEffect(() => {
    setToasts([]);
  }, [location.pathname]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, dismissing: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DISMISS_ANIMATION);
  }, []);

  const showError = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, type: 'error', dismissing: false }]);
    setTimeout(() => dismiss(id), TOAST_DURATION);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showError }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}${toast.dismissing ? ' toast--dismissing' : ''}`}
          >
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => dismiss(toast.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
