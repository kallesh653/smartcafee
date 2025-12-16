import { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, Tag, Space, Drawer } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  AppstoreOutlined,
  InboxOutlined,
  TeamOutlined,
  SettingOutlined,
  StockOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  CoffeeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerVisible(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const adminMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/cashier/fast-order',
      icon: <ThunderboltOutlined />,
      label: 'Fast Order',
      style: { fontWeight: 700, color: '#52c41a' }
    },
    {
      key: '/orders/manage',
      icon: <UnorderedListOutlined />,
      label: 'Manage Orders',
    },
    {
      key: '/products/manage',
      icon: <CoffeeOutlined />,
      label: 'Product Management',
    },
    {
      key: '/billing/view-bills',
      icon: <FileTextOutlined />,
      label: 'View Bills',
    },
    {
      key: 'purchase',
      icon: <ShoppingCartOutlined />,
      label: 'Purchase',
      children: [
        { key: '/purchase/add', label: 'Add Purchase' },
        { key: '/purchase/view', label: 'View Purchases' },
        { key: '/purchase/ready-items', label: 'Ready Items' },
      ],
    },
    {
      key: '/stock',
      icon: <InboxOutlined />,
      label: 'Stock View',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      children: [
        { key: '/reports/sales', label: 'Sales Report' },
        { key: '/reports/itemwise', label: 'Item-wise Sales' },
        { key: '/reports/daily-collection', label: 'Daily Collection' },
        { key: '/reports/profit', label: 'Profit Report' },
        { key: '/reports/show-wise-collection', label: 'Show-wise Collection' },
      ],
    },
    {
      key: 'masters',
      icon: <TeamOutlined />,
      label: 'Masters',
      children: [
        { key: '/masters/users', label: 'Manage Users' },
        { key: '/masters/suppliers', label: 'Manage Suppliers' },
      ],
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/cashier/fast-order',
      icon: <ThunderboltOutlined />,
      label: 'Fast Order',
      style: { fontWeight: 700, color: '#52c41a' }
    },
    {
      key: '/orders/manage',
      icon: <UnorderedListOutlined />,
      label: 'Manage Orders',
    },
    {
      key: '/billing/view-bills',
      icon: <FileTextOutlined />,
      label: 'My Bills',
    },
    {
      key: '/reports/daily-collection',
      icon: <BarChartOutlined />,
      label: 'Daily Collection',
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#262626' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              {user?.username}
            </div>
          </div>
        ),
        disabled: true
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
        label: <span style={{ color: '#ff4d4f', fontWeight: 600 }}>Logout</span>,
        onClick: logout,
      },
    ],
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  const sidebarLogo = (isCollapsed) => (
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '3px solid #5a67d8',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      <ShopOutlined style={{
        fontSize: isCollapsed ? 28 : 36,
        color: 'white',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        position: 'relative',
        zIndex: 1
      }} />
      {!isCollapsed && (
        <span style={{
          marginLeft: 12,
          fontSize: 18,
          fontWeight: 700,
          color: 'white',
          letterSpacing: '0.5px',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 1
        }}>
          Smart Cafe
        </span>
      )}
    </div>
  );

  const sidebarMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderRight: 0 }}
    />
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          closable={false}
          width={280}
          bodyStyle={{ padding: 0 }}
          style={{ zIndex: 1001 }}
        >
          {sidebarLogo(false)}
          {sidebarMenu}
        </Drawer>
      )}

      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          width={250}
          collapsedWidth={80}
          style={{
            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0
          }}
        >
          {sidebarLogo(collapsed)}
          {sidebarMenu}
        </Sider>
      )}

      <AntLayout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: isMobile ? '0 12px' : '0 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.12)',
            borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 999
          }}
        >
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => {
              if (isMobile) {
                setMobileDrawerVisible(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            style={{
              fontSize: 18,
              width: isMobile ? 48 : 64,
              height: 64,
              color: '#667eea',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          />

          <Space size={isMobile ? "small" : "large"} style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <Button
                type="primary"
                size="middle"
                onClick={() => navigate('/cashier/fast-order')}
                icon={<ThunderboltOutlined />}
                style={{ fontWeight: 700 }}
              >
                Order
              </Button>
            )}
            {!isMobile && (
              <Tag
                icon={user?.role === 'admin' ? <CrownOutlined /> : <TeamOutlined />}
                color={user?.role === 'admin' ? 'gold' : 'green'}
                style={{
                  fontSize: 14,
                  padding: '6px 16px',
                  fontWeight: 600,
                  borderRadius: 20,
                  border: 'none',
                  boxShadow: user?.role === 'admin'
                    ? '0 2px 8px rgba(250, 173, 20, 0.3)'
                    : '0 2px 8px rgba(82, 196, 26, 0.3)',
                  background: user?.role === 'admin'
                    ? 'linear-gradient(135deg, #ffd666 0%, #faad14 100%)'
                    : 'linear-gradient(135deg, #95de64 0%, #52c41a 100%)',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Cashier'}
              </Tag>
            )}

            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Avatar
                size={isMobile ? 40 : 48}
                style={{
                  backgroundColor: 'transparent',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  border: '3px solid white',
                  transition: 'all 0.3s ease'
                }}
                icon={<UserOutlined style={{ fontSize: isMobile ? 18 : 22 }} />}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? '8px' : '24px',
            padding: isMobile ? 12 : 24,
            background: '#f0f2f5',
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
