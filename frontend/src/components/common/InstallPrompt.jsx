import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { DownloadOutlined, MobileOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './InstallPrompt.css';

const InstallPrompt = ({ autoShow = true }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);

      // Auto-show modal if enabled
      if (autoShow) {
        setTimeout(() => {
          setShowInstallModal(true);
        }, 2000); // Show after 2 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      message.success('Smart Cafe installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [autoShow]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      message.info('App is already installed or installation is not available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      message.success('Thank you for installing Smart Cafe!');
      setShowInstallModal(false);
    } else {
      message.info('Installation cancelled');
    }

    // Clear the deferredPrompt for garbage collection
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowInstallModal(false);
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Show install button if prompt is available but modal not showing
  if (deferredPrompt && !showInstallModal && !autoShow) {
    return (
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={() => setShowInstallModal(true)}
        className="install-button-floating"
      >
        Install App
      </Button>
    );
  }

  return (
    <Modal
      open={showInstallModal}
      onCancel={handleClose}
      footer={null}
      centered
      width={400}
      className="install-prompt-modal"
      closable={true}
    >
      <div className="install-prompt-content">
        {/* App Icon */}
        <div className="install-icon-container">
          <div className="install-icon-wrapper">
            <img
              src="/logo.png"
              alt="Smart Cafe"
              className="install-icon"
              onError={(e) => {
                e.target.src = '/icon.svg';
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="install-title">Install Smart Cafe</h2>

        {/* Description */}
        <p className="install-description">
          Add Smart Cafe to your home screen for quick access and a native app experience!
        </p>

        {/* Features */}
        <div className="install-features">
          <div className="install-feature">
            <CheckCircleOutlined className="feature-icon" />
            <span>Works offline</span>
          </div>
          <div className="install-feature">
            <CheckCircleOutlined className="feature-icon" />
            <span>Faster loading</span>
          </div>
          <div className="install-feature">
            <CheckCircleOutlined className="feature-icon" />
            <span>Native experience</span>
          </div>
        </div>

        {/* Install Button */}
        <Button
          type="primary"
          size="large"
          icon={<MobileOutlined />}
          onClick={handleInstallClick}
          className="install-button-primary"
          block
        >
          Add to Home Screen
        </Button>

        {/* Later Button */}
        <Button
          type="text"
          size="large"
          onClick={handleClose}
          className="install-button-later"
          block
        >
          Maybe Later
        </Button>
      </div>
    </Modal>
  );
};

export default InstallPrompt;
