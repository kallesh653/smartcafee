import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Empty, Progress, Badge } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Layout from '../common/Layout';
import api from '../../services/api';
import moment from 'moment';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [todaySummary, products, bills] = await Promise.all([
        api.get('/bills/summary/today'),
        api.get('/products?isActive=true'),
        api.get('/bills?limit=5')
      ]);

      setStats(todaySummary.data.summary);

      // Get low stock items from products
      const items = (products.data.products || []).filter(p => {
        if (p.currentStock === undefined || p.currentStock === null) return false;
        if (p.minStockAlert === undefined || p.minStockAlert === null) return false;
        return p.currentStock <= p.minStockAlert;
      }).map(p => ({
        _id: p._id,
        name: p.name,
        subCode: p.serialNo || '-',
        currentStock: p.currentStock,
        unit: p.unit,
        minStockAlert: p.minStockAlert
      }));

      setLowStockItems(items);
      setRecentBills(bills.data.bills || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  const statsData = [
    {
      title: "Today's Revenue",
      value: stats.totalSales || 0,
      prefix: '₹',
      suffix: '',
      icon: <DollarOutlined style={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      change: '+12.5%',
      isIncrease: true
    },
    {
      title: 'Total Orders',
      value: stats.totalBills || 0,
      icon: <ShoppingCartOutlined style={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      change: '+8.2%',
      isIncrease: true
    },
    {
      title: 'Cash Collection',
      value: stats.cash || 0,
      prefix: '₹',
      icon: <FileTextOutlined style={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      change: '+15.3%',
      isIncrease: true
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems.length,
      suffix: ' items',
      icon: <WarningOutlined style={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      change: lowStockItems.length > 0 ? 'Action needed' : 'All good',
      isIncrease: false
    }
  ];

  const billColumns = [
    {
      title: 'Bill #',
      dataIndex: 'billNo',
      key: 'billNo',
      render: (text) => <span style={{ fontWeight: 600, color: '#667eea' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text) => text || 'Walk-in'
    },
    {
      title: 'Amount',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (amount) => (
        <span style={{ fontWeight: 700, fontSize: 16, color: '#52c41a' }}>
          ₹{amount?.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      render: (mode) => {
        const colors = {
          'Cash': '#87d068',
          'UPI': '#108ee9',
          'Card': '#f50',
          'Mixed': '#2db7f5'
        };
        return <Tag color={colors[mode] || 'default'}>{mode}</Tag>;
      }
    },
    {
      title: 'Time',
      dataIndex: 'billDate',
      key: 'billDate',
      render: (date) => (
        <div style={{ fontSize: 13, color: '#888' }}>
          <ClockCircleOutlined /> {moment(date).format('h:mm A')}
        </div>
      )
    }
  ];

  const lowStockColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>#{record.subCode}</div>
        </div>
      )
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock, record) => {
        const percentage = (stock / (record.minStockAlert * 2)) * 100;
        return (
          <div style={{ width: 120 }}>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>
              {stock} {record.unit}
            </div>
            <Progress
              percent={Math.min(percentage, 100)}
              size="small"
              strokeColor={stock <= record.minStockAlert ? '#ff4d4f' : '#52c41a'}
              showInfo={false}
            />
          </div>
        );
      }
    },
    {
      title: 'Alert Level',
      dataIndex: 'minStockAlert',
      key: 'minStockAlert',
      render: (alert) => (
        <Tag color="orange">{alert} units</Tag>
      )
    }
  ];

  return (
    <Layout>
      <div style={{ padding: '0 0 24px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8
          }}>
            ☕ Dashboard Overview
          </h1>
          <p style={{ fontSize: 16, color: '#888', margin: 0 }}>
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Cards - Modern Gradient Design */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                bordered={false}
                style={{
                  background: stat.gradient,
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  height: '100%'
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>
                      {stat.title}
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      padding: 8,
                      color: '#fff'
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                  <div style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                    {stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    {stat.isIncrease ? <RiseOutlined /> : <FallOutlined />}
                    {stat.change}
                  </div>
                </div>
                {/* Decorative Circle */}
                <div style={{
                  position: 'absolute',
                  right: -30,
                  bottom: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 0
                }} />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Low Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <Card
            style={{
              marginBottom: 24,
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe7e7 100%)',
              border: '2px solid #ffccc7',
              borderRadius: 12
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Badge count={lowStockItems.length} offset={[-5, 5]}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#ff4d4f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 24
                }}>
                  ⚠️
                </div>
              </Badge>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#cf1322', marginBottom: 4 }}>
                  Low Stock Alert!
                </div>
                <div style={{ color: '#8c8c8c', fontSize: 14 }}>
                  {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} running low on stock. Please restock soon.
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <Row gutter={[16, 16]}>
          {/* Recent Bills */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrophyOutlined style={{ color: '#667eea', fontSize: 20 }} />
                  <span style={{ fontSize: 18, fontWeight: 600 }}>Recent Transactions</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {recentBills.length === 0 ? (
                <Empty description="No transactions yet" />
              ) : (
                <Table
                  dataSource={recentBills}
                  columns={billColumns}
                  rowKey="_id"
                  pagination={false}
                  size="middle"
                />
              )}
            </Card>
          </Col>

          {/* Low Stock Items */}
          <Col xs={24} lg={10}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <WarningOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                  <span style={{ fontSize: 18, fontWeight: 600 }}>Stock Alerts</span>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {lowStockItems.length === 0 ? (
                <Empty description="All stock levels are good!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Table
                  dataSource={lowStockItems}
                  columns={lowStockColumns}
                  rowKey="_id"
                  pagination={false}
                  size="middle"
                  scroll={{ y: 300 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
