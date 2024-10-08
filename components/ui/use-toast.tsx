import React, { createContext, useContext, useState } from "react";

type ToastContextType = {
  showToast: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = (message: string, duration = 3000) => {
    setToastMessage(message);
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isVisible && (
        <div style={toastStyles}>
          {toastMessage}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Simple inline styles for the toast popup
const toastStyles: React.CSSProperties = {
  position: "fixed",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#333",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "5px",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 1000,
};
