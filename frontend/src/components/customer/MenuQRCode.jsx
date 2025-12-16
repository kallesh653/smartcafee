import { useEffect, useRef } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';

const { Title, Text } = Typography;

const MenuQRCode = () => {
  const canvasRef = useRef(null);
  const menuUrl = window.location.origin + '/menu';

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [menuUrl]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'smartcafe-menu-qr-code.png';
      link.href = url;
      link.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            ☕ Smart Cafe Menu
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Scan to view our menu & order from your seat!
          </Text>
        </div>

        <div style={{
          background: '#f5f7fa',
          padding: 30,
          borderRadius: 12,
          marginBottom: 24,
          display: 'inline-block'
        }}>
          <canvas ref={canvasRef} />
        </div>

        <div style={{
          background: '#f0f9ff',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24
        }}>
          <Text strong style={{ fontSize: 14, color: '#0050b3' }}>
            {menuUrl}
          </Text>
        </div>

        <Space size="middle" wrap className="no-print">
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            style={{
              background: '#667eea',
              borderColor: '#667eea',
              fontWeight: 600
            }}
          >
            Download QR Code
          </Button>
          <Button
            size="large"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            style={{ fontWeight: 600 }}
          >
            Print QR Code
          </Button>
        </Space>

        <div style={{ marginTop: 24 }} className="no-print">
          <Text type="secondary" style={{ fontSize: 13 }}>
            Print and display this QR code at tables for customers to scan
          </Text>
        </div>
      </Card>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .ant-card, .ant-card * {
            visibility: visible;
          }
          .ant-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none !important;
            border: 2px solid #000;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MenuQRCode;
