import { useState, useEffect, useRef } from 'react';
import {
  Button, InputNumber, Modal, Badge, Space, Spin, Empty, Row, Col, Card, Statistic, Tag, Input, App as AntdApp, Form
} from 'antd';
import {
  ShoppingCartOutlined, CheckOutlined, ClearOutlined, MinusOutlined, PlusOutlined,
  ThunderboltOutlined, DeleteOutlined, SearchOutlined, CloseCircleOutlined, WarningOutlined, PrinterOutlined,
  HomeOutlined, MobileOutlined
} from '@ant-design/icons';
import Layout from '../common/Layout';
import api from '../../services/api';
import moment from 'moment';
import { printThermalBill } from '../../utils/exportUtils';

const FastOrderCashier = () => {
  const { message, notification } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [billPreview, setBillPreview] = useState(null);
  const [searchNumber, setSearchNumber] = useState('');
  const searchInputRef = useRef(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [payment, setPayment] = useState({ cash: 0, upi: 0, card: 0, upiRefNo: '', cardRefNo: '' });
  const alertedLowStockRef = useRef(new Set());
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchPendingOrders();
    // Auto-focus search on load
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products?isActive=true');
      setProducts(data.products);
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories/list');
      setCategories(['All', ...data.categories]);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const fetchPendingOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await api.get('/orders?status=Pending&orderType=Customer&limit=5');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load pending orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const generateBillFromOrder = async (orderId) => {
    try {
      setProcessing(true);
      const { data } = await api.post(`/orders/${orderId}/convert-to-bill`, { paymentMode });
      message.success(`Bill #${data.bill.billNo} generated`);
      setBillPreview(data.bill);
      fetchPendingOrders();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to generate bill');
    } finally {
      setProcessing(false);
    }
  };

  // Filter by search number/name and category
  const filteredProducts = products.filter(p => {
    // Search by serial number (exact match) or product name (partial match)
    if (searchNumber) {
      const searchLower = searchNumber.toLowerCase();
      const serialMatch = p.serialNo && p.serialNo.toString() === searchNumber;
      const nameMatch = p.name && p.name.toLowerCase().includes(searchLower);
      return serialMatch || nameMatch;
    }
    // Filter by category
    if (selectedCategory !== 'All') {
      return p.category === selectedCategory;
    }
    return true;
  });

  // STEP 1: Add/Update quantity in cart (INSTANT)
  const updateCart = (product, change) => {
    const newCart = { ...cart };
    const currentQty = newCart[product._id]?.quantity || 0;
    const newQty = currentQty + change;

    if (newQty <= 0) {
      delete newCart[product._id];
      message.info(`${product.name} removed`);
    } else if (newQty > product.currentStock) {
      message.warning('Stock limit reached');
      return;
    } else {
      newCart[product._id] = {
        ...product,
        quantity: newQty,
        itemTotal: product.price * newQty
      };
      if (product.minStockAlert !== undefined && product.minStockAlert !== null && product.currentStock <= product.minStockAlert && !alertedLowStockRef.current.has(product._id)) {
        alertedLowStockRef.current.add(product._id);
        notification.warning({
          message: 'Low Stock',
          description: (
            <div style={{ fontSize: 16, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700 }}>{product.name}</div>
              <div>Available: {product.currentStock} {product.unit || ''}</div>
              <div>Alert at: {product.minStockAlert}</div>
            </div>
          ),
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'top',
          duration: 2
        });
      }
    }

    setCart(newCart);
  };

  // Quick add from product card
  const quickAdd = (product) => {
    if (product.currentStock <= 0) {
      message.error('Out of stock');
      return;
    }
    updateCart(product, 1);
    // Haptic feedback simulation
    if (navigator.vibrate) navigator.vibrate(10);
  };

  // Handle search input - auto-add when exact match and Enter pressed
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchNumber) {
      const exactMatch = products.find(p => p.serialNo && p.serialNo.toString() === searchNumber);
      if (exactMatch) {
        quickAdd(exactMatch);
        setSearchNumber(''); // Clear search after adding
        searchInputRef.current?.focus(); // Keep focus on search
      } else {
        message.warning('Product not found');
      }
    } else if (e.key === 'Escape') {
      setSearchNumber('');
      setSelectedCategory('All');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchNumber('');
    setSelectedCategory('All');
    searchInputRef.current?.focus();
  };

  const clearCart = () => {
    Modal.confirm({
      title: 'Clear Cart?',
      content: 'Remove all items from cart?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        setCart({});
        message.success('Cart cleared');
      }
    });
  };

  // STEP 2: Place Order (ONE TAP)
  const handlePlaceOrderClick = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) {
      message.error('Cart is empty');
      return;
    }
    setShowConfirmModal(true);
  };

  const placeOrder = async () => {
    try {
      const values = await form.validateFields();
      const cartItems = Object.values(cart);

      if (cartItems.length === 0) {
        message.error('Cart is empty');
        return;
      }

      setProcessing(true);

      // Create bill directly
      const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
      const grandTotal = Math.round(subtotal);
      const roundOff = grandTotal - subtotal;
      let paymentDetails = { cash: 0, upi: 0, card: 0, upiRefNo: payment.upiRefNo, cardRefNo: payment.cardRefNo };
      if (paymentMode === 'Mixed') {
        const totalEntered = (payment.cash || 0) + (payment.upi || 0) + (payment.card || 0);
        if (Math.round(totalEntered) !== grandTotal) {
          message.error('Payment split must equal total amount');
          setProcessing(false);
          return;
        }
        paymentDetails.cash = payment.cash || 0;
        paymentDetails.upi = payment.upi || 0;
        paymentDetails.card = payment.card || 0;
      } else {
        paymentDetails[paymentMode.toLowerCase()] = grandTotal;
      }

      const billData = {
        customerName: values.seatNumber ? `Seat ${values.seatNumber}` : 'Walk-in Customer',
        customerMobile: values.mobile || '',
        seatNumber: values.seatNumber || '',
        items: cartItems.map(item => ({
          mainCode: null,
          mainCodeName: 'General',
          subCode: item._id,
          subCodeName: item._id.toString().slice(-6).toUpperCase(),
          itemName: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          itemTotal: item.itemTotal,
          costPrice: item.costPrice || 0
        })),
        subtotal,
        discountPercent: 0,
        discountAmount: 0,
        gstAmount: 0,
        totalAmount: grandTotal - roundOff,
        roundOff,
        grandTotal,
        paymentMode,
        paymentDetails
      };

      const { data } = await api.post('/bills', billData);

      // Update stock locally (optimistic update)
      setProducts(prev => prev.map(p => {
        const cartItem = cart[p._id];
        if (cartItem) {
          return { ...p, currentStock: p.currentStock - cartItem.quantity };
        }
        return p;
      }));

      message.success({
        content: `Bill #${data.bill.billNo} - ₹${grandTotal}`,
        duration: 2,
        icon: <CheckOutlined style={{ color: '#52c41a' }} />
      });

      setBillPreview(data.bill);
      setCart({});
      setShowConfirmModal(false);
      form.resetFields();

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill in required fields');
      } else {
        message.error(error.response?.data?.message || 'Failed to create bill');
      }
    } finally {
      setProcessing(false);
    }
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout>
      {/* Selected Items - Compact Bar */}
      <div style={{
        position: 'sticky',
        top: 60,
        zIndex: 99,
        background: '#fff',
        padding: '6px 8px',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 8
      }}>
        {cartItems.length === 0 ? (
          <div style={{ fontSize: 12, color: '#999' }}>No items selected</div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {cartItems.map(ci => (
              <div key={ci._id} style={{
                fontSize: 12,
                padding: '4px 8px',
                border: '1px solid #e6f7ff',
                background: '#f0f9ff',
                color: '#0050b3',
                borderRadius: 12
              }}>
                {ci.name} × {ci.quantity} = ₹{Math.round(ci.itemTotal)}
              </div>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#52c41a' }}>Total ₹{Math.round(cartTotal)}</div>
          </div>
        )}
      </div>

      {/* 🔍 SEARCH BY ITEM NUMBER - VERY PROMINENT */}
      <Card style={{
        marginBottom: 8,
        background: 'linear-gradient(135deg, #ffd666 0%, #faad14 100%)',
        border: '2px solid #fa8c16'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 0, display: 'none' }}>
          <SearchOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
            🔢 SEARCH BY ITEM NUMBER
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
            Type item number and press Enter to add
          </div>
        </div>

        <Input
          ref={searchInputRef}
          size="large"
          placeholder="Enter item number and press Enter"
          prefix={<SearchOutlined style={{ fontSize: 20, color: '#fa8c16' }} />}
          suffix={
            searchNumber && (
              <CloseCircleOutlined
                onClick={clearSearch}
                style={{ fontSize: 20, color: '#999', cursor: 'pointer' }}
              />
            )
          }
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          onKeyDown={handleSearchKeyPress}
          style={{
            fontSize: 18,
            fontWeight: 600,
            height: 48,
            borderRadius: 10,
            border: '2px solid #fff',
            textAlign: 'center'
          }}
          autoComplete="off"
        />

        {searchNumber && filteredProducts.length > 0 && (
          <div style={{ display: 'none' }} />
        )}
        {searchNumber && filteredProducts.length === 0 && (
          <div style={{ display: 'none' }} />
        )}
      </Card>

      {/* Category Filter - Horizontal Scroll */}
      <div style={{
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        marginBottom: 6,
        paddingBottom: 2
      }}>
        <Space size="small">
          {categories.map(cat => (
            <Button
              key={cat}
              type={selectedCategory === cat ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat)}
              size="large"
              style={{
                minWidth: 80,
                fontWeight: 600,
                borderRadius: 20
              }}
            >
              {cat}
            </Button>
          ))}
        </Space>
      </div>

      {/* Product Grid - Mobile Optimized */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Empty description="No products available" />
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => {
            const inCart = cart[product._id];
            const quantity = inCart?.quantity || 0;

            return (
              <div
                key={product._id}
                className="product-card"
                style={{
                  borderColor: inCart ? '#52c41a' : '#d9d9d9',
                  borderWidth: inCart ? 3 : 2,
                }}
              >
                {/* Serial Number Badge - TOP LEFT */}
                {product.serialNo && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'linear-gradient(135deg, #fa8c16, #ffd666)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 20,
                    boxShadow: '0 2px 8px rgba(250, 140, 22, 0.5)',
                    zIndex: 1,
                    border: '2px solid #fff'
                  }}>
                    #{product.serialNo}
                  </div>
                )}

                {/* Product Image */}
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl.startsWith('http')
                      ? product.imageUrl
                      : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${product.imageUrl}`}
                    alt={product.name}
                    className="product-card-image"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="product-card-image" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40
                  }}>
                    ☕
                  </div>
                )}

                {/* Product Name */}
                <div className="product-card-name">{product.name}</div>

                {/* Price */}
                <div className="product-card-price" style={{ fontSize: 12 }}>₹{product.price}</div>

                {/* Stock Badge */}
                {product.currentStock <= 10 && (
                  <Tag color="orange" size="small" style={{ margin: '0 0 8px 0' }}>
                    {product.currentStock} left
                  </Tag>
                )}

                {/* Quantity Controls or Add Button */}
                {quantity > 0 ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}>
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      icon={<MinusOutlined />}
                      size="small"
                      onClick={() => updateCart(product, -1)}
                    />
                    <span style={{
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: 30,
                      textAlign: 'center'
                    }}>
                      {quantity}
                    </span>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => updateCart(product, 1)}
                    />
                  </div>
                ) : (
                  <Button
                    type="primary"
                    block
                    size="small"
                    onClick={() => quickAdd(product)}
                    disabled={product.currentStock <= 0}
                    style={{ fontWeight: 700 }}
                  >
                    ADD
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Orders - Quick Convert to Bill */}
      <Card
        style={{ marginTop: 12, marginBottom: 180 }}
        title="Customer Orders"
        extra={<Button type="link" onClick={fetchPendingOrders}>Refresh</Button>}
      >
        {ordersLoading ? (
          <Spin />
        ) : orders.length === 0 ? (
          <Empty description="No pending customer orders" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {orders.map((o) => (
              <div
                key={o._id}
                style={{
                  padding: 10,
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {o.seatNumber ? (
                    <Tag color="blue" icon={<HomeOutlined />}>Seat: {o.seatNumber}</Tag>
                  ) : o.customerMobile ? (
                    <Tag color="green" icon={<MobileOutlined />}>{o.customerMobile}</Tag>
                  ) : (
                    <Tag color="default">Walk-in</Tag>
                  )}
                  <Tag color="geekblue">Order #{o.orderNo}</Tag>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>₹{Math.round(o.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
                  <span>{o.customerName || 'Walk-in'}</span>
                  <Tag style={{ marginLeft: 'auto' }}>{(o.items?.length || 0)} items</Tag>
                </div>
                <Button
                  type="primary"
                  size="middle"
                  block
                  onClick={() => generateBillFromOrder(o._id)}
                  style={{ fontWeight: 700 }}
                >
                  Generate Bill
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Floating Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px 12px',
        background: '#fff',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}>
        <Row gutter={8}>
          <Col span={6}>
            <Button
              danger
              size="middle"
              block
              icon={<ClearOutlined />}
              onClick={clearCart}
              disabled={cartCount === 0}
              style={{ height: 48, fontWeight: 700 }}
            >
              Clear
            </Button>
          </Col>
          <Col span={18}>
            <div style={{ marginBottom: 8 }}>
              <Space wrap>
                <Button type={paymentMode === 'Cash' ? 'primary' : 'default'} onClick={() => setPaymentMode('Cash')}>Cash</Button>
                <Button type={paymentMode === 'UPI' ? 'primary' : 'default'} onClick={() => setPaymentMode('UPI')}>UPI</Button>
                <Button type={paymentMode === 'Card' ? 'primary' : 'default'} onClick={() => setPaymentMode('Card')}>Card</Button>
                <Button type={paymentMode === 'Mixed' ? 'primary' : 'default'} onClick={() => setPaymentMode('Mixed')}>Mixed</Button>
              </Space>
            </div>
            {paymentMode === 'Mixed' && (
              <Row gutter={8} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <InputNumber
                    min={0}
                    value={payment.cash}
                    onChange={(v) => setPayment(s => ({ ...s, cash: v || 0 }))}
                    placeholder="Cash"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={8}>
                  <InputNumber
                    min={0}
                    value={payment.upi}
                    onChange={(v) => setPayment(s => ({ ...s, upi: v || 0 }))}
                    placeholder="UPI"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={8}>
                  <InputNumber
                    min={0}
                    value={payment.card}
                    onChange={(v) => setPayment(s => ({ ...s, card: v || 0 }))}
                    placeholder="Card"
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
            )}
            <Button
              type="primary"
              size="middle"
              block
              icon={<ThunderboltOutlined />}
              onClick={handlePlaceOrderClick}
              loading={processing}
              disabled={cartCount === 0}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #389e0d 0%, #52c41a 100%)',
                border: 'none'
              }}
            >
              PLACE ORDER ({cartCount}) - ₹{cartTotal}
            </Button>
          </Col>
        </Row>
      </div>

      {/* Confirm Order Modal with Seat/Mobile */}
      <Modal
        title="Confirm Order Details"
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={null}
        width={400}
      >
        <div style={{ padding: '10px 0' }}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f7fa', borderRadius: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Order Summary</div>
            {Object.values(cart).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.itemTotal}</span>
              </div>
            ))}
            <div style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid #d9d9d9',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 18,
              fontWeight: 700,
              color: '#52c41a'
            }}>
              <span>Total:</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          <Form form={form} layout="vertical">
            <Form.Item
              name="seatNumber"
              label="Seat Number (Optional)"
              rules={[
                {
                  validator: (_, value) => {
                    const mobile = form.getFieldValue('mobile');
                    if (!value && !mobile) {
                      return Promise.reject('Either Seat Number or Mobile is required');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="e.g., A12"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="mobile"
              label="Mobile Number (Optional)"
              rules={[
                {
                  validator: (_, value) => {
                    const seatNumber = form.getFieldValue('seatNumber');
                    if (!value && !seatNumber) {
                      return Promise.reject('Either Mobile or Seat Number is required');
                    }
                    if (value && value.length !== 10) {
                      return Promise.reject('Mobile must be 10 digits');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                prefix={<MobileOutlined />}
                placeholder="10-digit mobile"
                maxLength={10}
                size="large"
              />
            </Form.Item>
          </Form>

          <div style={{ fontSize: 13, color: '#666', marginBottom: 16, padding: '8px 12px', background: '#fff7e6', borderRadius: 6 }}>
            ℹ️ Enter either seat number or mobile number
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="primary"
              size="large"
              block
              icon={<CheckOutlined />}
              onClick={placeOrder}
              loading={processing}
              style={{
                background: 'linear-gradient(135deg, #389e0d 0%, #52c41a 100%)',
                border: 'none',
                fontWeight: 600
              }}
            >
              Confirm & Place Order
            </Button>
            <Button
              size="large"
              block
              onClick={() => setShowConfirmModal(false)}
              style={{
                borderColor: '#1890ff',
                color: '#1890ff',
                fontWeight: 600
              }}
            >
              Edit Order (Add/Remove Items)
            </Button>
            <Button
              size="large"
              block
              onClick={() => {
                setShowConfirmModal(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Bill Preview Modal */}
      <Modal
        title={<div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700 }}>✅ Order Placed!</div>}
        open={!!billPreview}
        onCancel={() => setBillPreview(null)}
        footer={[
          <Space key="actions" style={{ width: '100%' }} direction="vertical" size="middle">
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={async () => {
                try {
                  await printThermalBill(billPreview);
                  message.success('Print window opened');
                  // Auto-close after 1.5 seconds
                  setTimeout(() => {
                    setBillPreview(null);
                  }, 1500);
                } catch (error) {
                  message.error('Failed to print');
                }
              }}
              block
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Print Bill
            </Button>
            <Button key="close" size="large" onClick={() => setBillPreview(null)} block>
              Close
            </Button>
          </Space>
        ]}
        width={400}
      >
        {billPreview && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, color: '#667eea', margin: 0 }}>
                Bill #{billPreview.billNo}
              </h2>
              <div style={{ color: '#999', marginTop: 8 }}>
                {moment(billPreview.billDate).format('DD MMM YYYY, hh:mm A')}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              {billPreview.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.itemName}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {item.quantity} × ₹{item.price}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    ₹{item.itemTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 20,
              fontWeight: 700,
              color: '#52c41a',
              paddingTop: 16,
              borderTop: '2px solid #000'
            }}>
              <span>TOTAL:</span>
              <span>₹{billPreview.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Bottom Padding for Fixed Buttons */}
      <div style={{ height: 40 }}></div>
    </Layout>
  );
};

export default FastOrderCashier;
