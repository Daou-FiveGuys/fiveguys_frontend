import React, { createContext, useContext, useState } from 'react';

type ToastMessage = {
  title: string;
  description: string;
};

// ToastContext 생성
const ToastContext = createContext<{
  showToast: (message: ToastMessage) => void;
} | undefined>(undefined);

// ToastProvider 컴포넌트
export const ToastProvider: React.FC<ToastMessage> = ({ title,description }) => {
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // showToast 함수 정의
  const showToast = (message: ToastMessage) => {
    setToastMessage(message);
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
      setToastMessage(null); // 메시지를 초기화
    }, 3000); // 기본 지속 시간 설정
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {title}
      {description} 
      {isVisible && toastMessage && (
        <div>
          <h4>{toastMessage.title}</h4>
          <p>{toastMessage.description}</p>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// ToastContext를 사용하는 훅
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.showToast;
};
