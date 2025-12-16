import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Button, Alert } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  UserOutlined,
  ArrowUpOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../common/Layout';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const navigate = useNavigate();

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

  const statCards = [
    {
      title: "Today's Sales",
      value: stats.totalSales || 0,
      prefix: '₹',
      icon: <DollarOutlined />,
      color: '#667eea'
    },
    {
      title: "Today's Bills",
      value: stats.totalBills || 0,
      icon: <FileTextOutlined />,
      color: '#f093fb'
    },
    {
      title: 'Cash Collection',
      value: stats.cash || 0,
      prefix: '₹',
      icon: <DollarOutlined />,
      color: '#4facfe'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      icon: <WarningOutlined />,
      color: '#fa709a'
    }
  ];

  const columns = [
    { title: 'Bill No', dataIndex: 'billNo', key: 'billNo' },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'Amount',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (amount) => `₹${amount?.toFixed(2)}`
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      render: (mode) => <Tag color="blue">{mode}</Tag>
    },
    {
      title: 'Time',
      dataIndex: 'billDate',
      key: 'billDate',
      render: (date) => new Date(date).toLocaleTimeString()
    }
  ];

  const lowStockColumns = [
    { title: 'Item', dataIndex: 'name', key: 'name' },
    { title: 'Sub Code', dataIndex: 'subCode', key: 'subCode' },
    {
      title: 'Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock, record) => (
        <Tag color={stock <= record.minStockAlert ? 'red' : 'green'}>
          {stock} {record.unit}
        </Tag>
      )
    },
    {
      title: 'Min Alert',
      dataIndex: 'minStockAlert',
      key: 'minStockAlert'
    }
  ];

  return (
    <Layout>
      <div>
        <h1 style={{ marginBottom: 24, fontSize: 28, fontWeight: 600 }}>
          Admin Dashboard
        </h1>

        {lowStockItems.length > 0 && (
          <Alert
            message="Low Stock Alert"
            description={`${lowStockItems.length} items are running low on stock. Please reorder soon.`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={[16, 16]}>
          {statCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                className="stat-card fade-in"
                style={{
                  background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                  border: 'none',
                  color: 'white'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>{stat.icon}</div>
                <Statistic
                  title={<span style={{ color: 'white' }}>{stat.title}</span>}
                  value={stat.value}
                  prefix={stat.prefix}
                  valueStyle={{ color: 'white', fontSize: 32, fontWeight: 600 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card
              title="Recent Bills"
              extra={
                <Button type="link" onClick={() => navigate('/billing/view-bills')}>
                  View All
                </Button>
              }
            >
              <Table
                dataSource={recentBills}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <WarningOutlined style={{ color: '#fa709a' }} />
                  Low Stock Alert
                </Space>
              }
              extra={
                <Button type="link" onClick={() => navigate('/stock')}>
                  View Stock
                </Button>
              }
            >
              <Table
                dataSource={lowStockItems.slice(0, 5)}
                columns={lowStockColumns}
                rowKey="_id"
                loading={loading}
                pagination={false}
                size="small"
                locale={{ emptyText: 'All good! No low stock items.' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Quick Actions">
              <Space wrap>
                <Button type="primary" onClick={() => navigate('/billing/take-order')}>
                  Take Order
                </Button>
                <Button onClick={() => navigate('/purchase/add')}>
                  Add Purchase
                </Button>
                <Button onClick={() => navigate('/reports/sales')}>
                  View Reports
                </Button>
                <Button onClick={() => navigate('/masters/subcodes')}>
                  Manage Items
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
