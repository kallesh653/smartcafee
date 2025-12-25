import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Tag, message, Modal, Space, Badge, Tabs, Radio, Spin
} from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  DollarOutlined, EyeOutlined, ReloadOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import Layout from '../common/Layout';
import api from '../../services/api';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';

const ManageOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchSettings();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders?status=${statusFilter}&orderType=Customer`);
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to load settings');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setProcessing(true);
      await api.put(`/orders/${orderId}/status`, { status });
      message.success(`Order ${status.toLowerCase()}`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      message.error('Failed to update order');
    } finally {
      setProcessing(false);
    }
  };

  const convertToBill = async (orderId, paymentMode = 'Cash') => {
    try {
      setProcessing(true);
      const { data } = await api.post(`/orders/${orderId}/convert-to-bill`, {
        paymentMode,
        discount: 0
      });
      message.success(`Bill #${data.bill.billNo} created successfully!`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create bill');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text) => <strong style={{ fontSize: 16, color: '#667eea' }}>#{text}</strong>,
      width: 80
    },
    {
      title: 'Seat',
      dataIndex: 'seatNumber',
      key: 'seatNumber',
      render: (text) => (
        <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
          {text}
        </Tag>
      ),
      width: 80
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text || 'Guest'}</div>
          {record.customerMobile && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.customerMobile}</div>
          )}
        </div>
      ),
      width: 120
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items.slice(0, 2).map((item, idx) => (
            <div key={idx} style={{ fontSize: 13 }}>
              • {item.productName} × {item.quantity}
            </div>
          ))}
          {items.length > 2 && (
            <div style={{ fontSize: 12, color: '#999' }}>
              +{items.length - 2} more
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <strong style={{ fontSize: 16, color: '#52c41a' }}>
          ₹{amount.toFixed(2)}
        </strong>
      ),
      width: 100
    },
    {
      title: 'Time',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => (
        <div>
          <div style={{ fontSize: 13 }}>{moment(date).format('hh:mm A')}</div>
          <div style={{ fontSize: 11, color: '#999' }}>
            {moment(date).fromNow()}
          </div>
        </div>
      ),
      width: 90
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          Pending: 'orange',
          Preparing: 'blue',
          Ready: 'green',
          Completed: 'default',
          Cancelled: 'red'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
      width: 100
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => setSelectedOrder(record)}
          size="small"
        >
          View
        </Button>
      ),
      width: 100
    }
  ];

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              📋 Customer Orders
            </h1>
            <p style={{ color: '#666', margin: '4px 0 0 0' }}>
              Manage and process customer orders
            </p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            size="large"
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Status Filter */}
        <Radio.Group
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="large"
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="Pending">
            <Badge count={pendingCount} offset={[10, 0]}>
              <span style={{ paddingRight: pendingCount > 0 ? 12 : 0 }}>
                Pending
              </span>
            </Badge>
          </Radio.Button>
          <Radio.Button value="Preparing">Preparing</Radio.Button>
          <Radio.Button value="Ready">Ready</Radio.Button>
          <Radio.Button value="Completed">Completed</Radio.Button>
        </Radio.Group>
      </div>

      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 800 }}
          locale={{ emptyText: `No ${statusFilter.toLowerCase()} orders` }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>
              Order #{selectedOrder?.orderNo}
            </div>
            <div style={{ fontSize: 13, color: '#999', fontWeight: 'normal' }}>
              {selectedOrder && moment(selectedOrder.orderDate).format('DD MMM YYYY, hh:mm A')}
            </div>
          </div>
        }
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={null}
        width={500}
      >
        {selectedOrder && (
          <div style={{ padding: '20px 0' }}>
            {/* Customer Info */}
            <Card size="small" style={{ marginBottom: 16, background: '#f5f7fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Customer:</span>
                <strong>{selectedOrder.customerName || 'Guest'}</strong>
              </div>
              {selectedOrder.customerMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Mobile:</span>
                  <strong>{selectedOrder.customerMobile}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Seat Number:</span>
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                  {selectedOrder.seatNumber}
                </Tag>
              </div>
            </Card>

            {/* Items */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12 }}>Order Items</h3>
              {selectedOrder.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    ₹{item.itemTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderTop: '2px solid #000',
              fontSize: 20,
              fontWeight: 700
            }}>
              <span>Total:</span>
              <span style={{ color: '#52c41a' }}>
                ₹{selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Status Badge */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Tag
                color={
                  selectedOrder.status === 'Pending' ? 'orange' :
                  selectedOrder.status === 'Preparing' ? 'blue' :
                  selectedOrder.status === 'Ready' ? 'green' : 'default'
                }
                style={{ fontSize: 15, padding: '6px 16px' }}
              >
                {selectedOrder.status}
              </Tag>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div style={{ marginBottom: 16, padding: 12, background: '#fffbe6', borderRadius: 8 }}>
                <strong>Note:</strong> {selectedOrder.notes}
              </div>
            )}

            {/* Actions */}
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Back Button */}
              <Button
                size="large"
                block
                icon={<ArrowLeftOutlined />}
                onClick={() => setSelectedOrder(null)}
                style={{
                  borderColor: '#d9d9d9',
                  fontWeight: 600
                }}
              >
                Back to Orders
              </Button>

              {selectedOrder.status === 'Pending' && (
                <>
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<ClockCircleOutlined />}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'Preparing')}
                    loading={processing}
                    style={{ background: '#1890ff' }}
                  >
                    Mark as Preparing
                  </Button>
                  <Button
                    danger
                    size="large"
                    block
                    icon={<CloseCircleOutlined />}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'Cancelled')}
                    loading={processing}
                  >
                    Cancel Order
                  </Button>
                </>
              )}

              {selectedOrder.status === 'Preparing' && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  onClick={() => updateOrderStatus(selectedOrder._id, 'Ready')}
                  loading={processing}
                  style={{ background: '#52c41a' }}
                >
                  Mark as Ready
                </Button>
              )}

              {(selectedOrder.status === 'Ready' || selectedOrder.status === 'Preparing') &&
               (user?.role === 'admin' || settings?.defaultPermissions?.customerCanConvertOrderToBill) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<DollarOutlined />}
                  onClick={() => convertToBill(selectedOrder._id)}
                  loading={processing}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  Convert to Bill & Complete
                </Button>
              )}

              {(selectedOrder.status === 'Ready' || selectedOrder.status === 'Preparing') &&
               user?.role !== 'admin' && !settings?.defaultPermissions?.customerCanConvertOrderToBill && (
                <div style={{
                  padding: '12px',
                  background: '#fff7e6',
                  border: '1px solid #ffd591',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#ad6800'
                }}>
                  ⚠️ Bill conversion requires admin permission
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ManageOrders;
