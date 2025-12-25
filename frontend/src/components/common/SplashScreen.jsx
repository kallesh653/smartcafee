import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img
          src="/logo.png"
          alt="Smart Cafe"
          className="splash-logo"
          onError={(e) => {
            // Fallback to icon if logo.png not found
            e.target.src = '/icon.svg';
          }}
        />
        <div className="splash-loader">
          <Spin size="large" />
        </div>
        <p className="splash-text">Cinema Theater POS System</p>
      </div>
    </div>
  );
};

export default SplashScreen;
