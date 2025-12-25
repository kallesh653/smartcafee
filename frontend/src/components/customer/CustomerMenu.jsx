import { useState, useEffect } from 'react';
import {
  Button, message, Modal, Badge, Space, Spin, Empty, Row, Col, Card, Carousel, Tag, Divider, List, Form, Input, Radio
} from 'antd';
import {
  ShoppingCartOutlined, CheckOutlined, MinusOutlined, PlusOutlined,
  CloseCircleOutlined, FireOutlined, StarOutlined, ThunderboltOutlined,
  UnorderedListOutlined, ClockCircleOutlined, MobileOutlined, HomeOutlined,
  WalletOutlined, QrcodeOutlined, CreditCardOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';
import './CustomerMenu.css';
import InstallPrompt from '../common/InstallPrompt';

const CustomerMenu = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [sliderData, setSliderData] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products?isActive=true');
      setProducts(data.products);
    } catch (error) {
      message.error('Failed to load menu');
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

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data.settings);
      if (data.settings?.menuSlides && data.settings.menuSlides.length > 0) {
        // Filter out slides with no content (no title, subtitle, and no image)
        const validSlides = data.settings.menuSlides.filter(slide =>
          slide.title || slide.subtitle || slide.imageUrl
        );

        if (validSlides.length > 0) {
          setSliderData(validSlides);
          console.log('Loaded menu slides:', validSlides);
        } else {
          // Default slides if no valid slides
          setSliderData([
            {
              type: 'image',
              title: 'Welcome to Smart Cafe',
              subtitle: 'Order from your seat!',
              bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }
          ]);
        }
      } else {
        // Default slides if none configured
        setSliderData([
          {
            type: 'image',
            title: 'Welcome to Smart Cafe',
            subtitle: 'Order from your seat!',
            bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSliderData([
        {
          type: 'image',
          title: 'Welcome to Smart Cafe',
          subtitle: 'Order from your seat!',
          bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      ]);
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const updateCart = (product, change) => {
    const newCart = { ...cart };
    const currentQty = newCart[product._id]?.quantity || 0;
    const newQty = currentQty + change;

    if (newQty <= 0) {
      delete newCart[product._id];
    } else if (newQty > product.currentStock) {
      message.warning('Maximum quantity reached');
      return;
    } else {
      newCart[product._id] = {
        ...product,
        quantity: newQty,
        itemTotal: product.price * newQty
      };
    }

    setCart(newCart);
  };

  const proceedToCheckout = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) {
      message.error('Your cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const placeOrder = async () => {
    try {
      const values = await form.validateFields();
      const cartItems = Object.values(cart);

      setProcessing(true);

      const orderData = {
        customerName: 'Guest',
        customerMobile: values.mobile || '',
        seatNumber: values.seatNumber || '',
        paymentMode: values.paymentMode || 'Cash',
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity
        }))
      };

      const { data } = await api.post('/orders', orderData);

      message.success('Order placed successfully!');
      setOrderSuccess(data.order);
      setCart({});
      setShowCheckout(false);
      form.resetFields();

    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill in required fields');
      } else {
        message.error(error.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setProcessing(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      // Fetch today's customer orders (last 20)
      const { data } = await api.get('/orders?orderType=Customer&limit=20');
      setMyOrders(data.orders || []);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleShowMyOrders = () => {
    setShowMyOrders(true);
    fetchMyOrders();
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="customer-menu-container">
      {/* Beautiful Top Slider */}
      <div className="menu-slider-wrapper">
        <Carousel autoplay autoplaySpeed={4000} effect="fade" dots={{ className: 'slider-dots' }}>
          {sliderData.map((slide, index) => {
            const imageUrl = slide.imageUrl
              ? (slide.imageUrl.startsWith('http')
                  ? slide.imageUrl
                  : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${slide.imageUrl}`)
              : null;

            return (
              <div key={index}>
                <div
                  className="slider-slide"
                  style={{
                    background: imageUrl
                      ? `url(${imageUrl})`
                      : (slide.bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '400px',
                    position: 'relative'
                  }}
                >
                  {/* Overlay for better text visibility - only if there's text */}
                  {(slide.title || slide.subtitle || slide.description) && (
                    <div className="slider-overlay" />
                  )}

                  {/* Video Background if provided */}
                  {slide.type === 'video' && slide.videoUrl && (
                    <video
                      className="slider-video"
                      autoPlay
                      muted
                      loop
                      playsInline
                      src={slide.videoUrl}
                    />
                  )}

                  {/* Content */}
                  {(slide.title || slide.subtitle || slide.description) && (
                    <div className="slider-content">
                      {slide.title && (
                        <h1 className="slider-title">
                          {slide.icon && <span>{slide.icon} </span>}
                          {slide.title}
                        </h1>
                      )}
                      {slide.subtitle && (
                        <p className="slider-subtitle">{slide.subtitle}</p>
                      )}
                      {slide.description && (
                        <p className="slider-description">{slide.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Carousel>
      </div>

      {/* Shop Name */}
      <div className="shop-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>☕ {settings?.shopName || 'Smart Cafe'}</h2>
            <p>{settings?.shopTagline || 'Delicious treats just a tap away'}</p>
          </div>
          <Button
            type="default"
            size="large"
            icon={<UnorderedListOutlined />}
            onClick={handleShowMyOrders}
            style={{
              borderRadius: '20px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            My Orders
          </Button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Category Filter - Modern Pills */}
        <div className="category-filter-wrapper">
          <Space size={[8, 8]} wrap>
            {categories.map(cat => (
              <Button
                key={cat}
                type={selectedCategory === cat ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                size="large"
              >
                {cat}
                {selectedCategory === cat && <Badge count={filteredProducts.length} style={{ marginLeft: 8 }} />}
              </Button>
            ))}
          </Space>
        </div>

        {/* Products - Professional Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" tip="Loading delicious items..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Empty
            description="No items available in this category"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: '60px 0' }}
          />
        ) : (
          <Row gutter={[12, 12]} style={{ marginTop: 16, marginBottom: 120 }}>
            {filteredProducts.map(product => {
              const inCart = cart[product._id];
              const quantity = inCart?.quantity || 0;
              const isLowStock = product.currentStock <= 10 && product.currentStock > 0;

              return (
                <Col xs={12} sm={8} md={6} lg={4} key={product._id}>
                  <Card
                    hoverable
                    className={`product-card-modern ${inCart ? 'in-cart' : ''}`}
                    cover={
                      <div className="product-image-wrapper">
                        {product.imageUrl ? (
                          <img
                            alt={product.name}
                            src={product.imageUrl.startsWith('http')
                              ? product.imageUrl
                              : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${product.imageUrl}`}
                            className="product-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.product-placeholder').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="product-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                          ☕
                        </div>

                        {/* Badges */}
                        <div className="product-badges">
                          {product.isPopular && (
                            <Tag icon={<FireOutlined />} color="red" className="badge-popular">
                              Popular
                            </Tag>
                          )}
                          {isLowStock && (
                            <Tag icon={<ThunderboltOutlined />} color="orange" className="badge-limited">
                              Limited
                            </Tag>
                          )}
                          {product.currentStock <= 0 && (
                            <Tag color="default" className="badge-out">
                              Sold Out
                            </Tag>
                          )}
                        </div>

                        {/* Serial Number */}
                        {product.serialNo && (
                          <div className="product-serial">
                            #{product.serialNo}
                          </div>
                        )}
                      </div>
                    }
                    bodyStyle={{ padding: 12 }}
                  >
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      {product.description && (
                        <div className="product-description">{product.description}</div>
                      )}
                      <div className="product-price">₹{product.price}</div>

                      {/* Add to Cart Controls */}
                      <div className="product-actions">
                        {quantity > 0 ? (
                          <div className="quantity-controls">
                            <Button
                              danger
                              shape="circle"
                              size="small"
                              icon={<MinusOutlined />}
                              onClick={() => updateCart(product, -1)}
                              className="qty-btn"
                            />
                            <span className="quantity-display">{quantity}</span>
                            <Button
                              type="primary"
                              shape="circle"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => updateCart(product, 1)}
                              className="qty-btn"
                              disabled={quantity >= product.currentStock}
                            />
                          </div>
                        ) : (
                          <Button
                            type="primary"
                            block
                            size="small"
                            onClick={() => updateCart(product, 1)}
                            disabled={product.currentStock <= 0}
                            className="add-to-cart-btn"
                            icon={<PlusOutlined />}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* Floating Cart Button - Modern Design */}
      {cartCount > 0 && (
        <div className="floating-cart-container">
          <Button
            type="primary"
            size="large"
            block
            onClick={proceedToCheckout}
            className="floating-cart-btn"
          >
            <div className="cart-btn-content">
              <div className="cart-btn-left">
                <ShoppingCartOutlined className="cart-icon" />
                <Badge count={cartCount} className="cart-badge" />
                <span className="cart-text">View Cart</span>
              </div>
              <div className="cart-btn-right">
                <span className="cart-total">₹{cartTotal}</span>
              </div>
            </div>
          </Button>
        </div>
      )}

      {/* Checkout Modal - Professional */}
      <Modal
        title={
          <div className="checkout-modal-header">
            <ShoppingCartOutlined /> Complete Your Order
          </div>
        }
        open={showCheckout}
        onCancel={() => setShowCheckout(false)}
        footer={null}
        width={500}
        className="checkout-modal"
      >
        <div className="checkout-content">
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item._id} className="order-item">
                <div className="item-left">
                  <div className="item-name">{item.name}</div>
                  <div className="item-qty-price">
                    {item.quantity} × ₹{item.price}
                  </div>
                </div>
                <div className="item-right">
                  <div className="item-total">₹{item.itemTotal}</div>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => updateCart(item, -item.quantity)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Divider />

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-amount">₹{cartTotal}</span>
            </div>
          </div>

          <Divider />

          {/* Order Details Form */}
          <Form
            form={form}
            layout="vertical"
            initialValues={{ paymentMode: 'Cash' }}
          >
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="seatNumber"
                  label="Seat Number"
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
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="mobile"
                  label="Mobile Number"
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
              </Col>
            </Row>

            <Form.Item
              name="paymentMode"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Radio.Group size="large" style={{ width: '100%' }}>
                <Row gutter={[8, 8]}>
                  <Col xs={8}>
                    <Radio.Button value="Cash" style={{ width: '100%', textAlign: 'center' }}>
                      <WalletOutlined /> Cash
                    </Radio.Button>
                  </Col>
                  <Col xs={8}>
                    <Radio.Button value="UPI" style={{ width: '100%', textAlign: 'center' }}>
                      <QrcodeOutlined /> QR/UPI
                    </Radio.Button>
                  </Col>
                  <Col xs={8}>
                    <Radio.Button value="Card" style={{ width: '100%', textAlign: 'center' }}>
                      <CreditCardOutlined /> Card
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
          </Form>

          <Button
            type="primary"
            size="large"
            block
            icon={<CheckOutlined />}
            onClick={placeOrder}
            loading={processing}
            className="place-order-btn"
          >
            Place Order
          </Button>
        </div>
      </Modal>

      {/* Success Modal - Celebration with Full Order Details */}
      <Modal
        open={!!orderSuccess}
        onCancel={() => setOrderSuccess(null)}
        footer={null}
        width={500}
        className="success-modal"
        centered
      >
        {orderSuccess && (
          <div className="success-content">
            <div className="success-icon">
              <div className="checkmark-circle">
                <CheckOutlined />
              </div>
            </div>
            <h2 className="success-title">Order Placed Successfully!</h2>
            <div className="order-number">
              <Tag icon={<StarOutlined />} color="success" style={{ fontSize: 16, padding: '8px 16px' }}>
                Order #{orderSuccess.orderNo}
              </Tag>
            </div>
            <p className="success-message">
              Your order will be prepared shortly. Thank you!
            </p>

            {/* Order Details */}
            <div className="order-details-box" style={{ marginTop: 20 }}>
              <div style={{
                background: '#f5f7fa',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  <span>Order Number:</span>
                  <span style={{ fontWeight: 600, color: '#333' }}>#{orderSuccess.orderNo}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  <span>Order Time:</span>
                  <span style={{ fontWeight: 600, color: '#333' }}>
                    {moment(orderSuccess.orderDate).format('DD MMM YYYY, hh:mm A')}
                  </span>
                </div>
              </div>

              {/* Ordered Items */}
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: '#333'
                }}>
                  Ordered Items
                </h3>
                <div style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {orderSuccess.items && orderSuccess.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: index < orderSuccess.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                        background: '#fff'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {item.productName}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#999'
                        }}>
                          {item.quantity} × ₹{item.price?.toFixed(2)}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#52c41a'
                      }}>
                        ₹{item.itemTotal?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: '#fff'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Total Amount</span>
                <span style={{ fontSize: '22px', fontWeight: 700 }}>
                  ₹{orderSuccess.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={() => setOrderSuccess(null)}
              className="done-btn"
              style={{ marginTop: 20 }}
            >
              Done
            </Button>
          </div>
        )}
      </Modal>

      {/* My Orders Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UnorderedListOutlined style={{ fontSize: '20px', color: '#667eea' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>My Orders</span>
          </div>
        }
        open={showMyOrders}
        onCancel={() => setShowMyOrders(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowMyOrders(false)}>
            Close
          </Button>
        ]}
        width={600}
        className="my-orders-modal"
      >
        {loadingOrders ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Loading your orders..." />
          </div>
        ) : myOrders.length === 0 ? (
          <Empty
            description="No orders found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: '40px 0' }}
          />
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <List
              dataSource={myOrders}
              renderItem={(order) => (
                <Card
                  key={order._id}
                  style={{
                    marginBottom: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <Tag icon={<StarOutlined />} color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        Order #{order.orderNo}
                      </Tag>
                      <Tag
                        color={
                          order.status === 'Pending' ? 'orange' :
                          order.status === 'Preparing' ? 'blue' :
                          order.status === 'Ready' ? 'green' :
                          order.status === 'Completed' ? 'default' : 'red'
                        }
                        style={{ fontSize: '13px', padding: '4px 10px', marginLeft: '8px' }}
                      >
                        {order.status}
                      </Tag>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        <ClockCircleOutlined /> {moment(order.orderDate).format('DD MMM, hh:mm A')}
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div style={{
                    background: '#f5f7fa',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '13px'
                  }}>
                    {order.seatNumber && (
                      <div style={{ marginBottom: '4px' }}>
                        <HomeOutlined /> Seat: <strong>{order.seatNumber}</strong>
                      </div>
                    )}
                    {order.customerMobile && (
                      <div>
                        <MobileOutlined /> Mobile: <strong>{order.customerMobile}</strong>
                      </div>
                    )}
                    {order.paymentMode && (
                      <div style={{ marginTop: '4px' }}>
                        <WalletOutlined /> Payment: <strong>{order.paymentMode}</strong>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#666' }}>
                      Items Ordered:
                    </div>
                    {order.items && order.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#fafafa',
                          borderRadius: '6px',
                          marginBottom: '6px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                            {item.productName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                            {item.quantity} × ₹{item.price?.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#52c41a' }}>
                          ₹{item.itemTotal?.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>Total Amount</span>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>
                      ₹{order.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </Card>
              )}
            />
          </div>
        )}
      </Modal>

      {/* PWA Install Prompt */}
      <InstallPrompt autoShow={true} />
    </div>
  );
};

export default CustomerMenu;
