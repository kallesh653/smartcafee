import { useState, useEffect } from 'react';
import {
  Button, message, Modal, Badge, Space, Spin, Empty, Row, Col, Card
} from 'antd';
import {
  ShoppingCartOutlined, CheckOutlined, MinusOutlined, PlusOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const CustomerMenu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
    const cartItems = Object.values(cart);

    setProcessing(true);

    try {
      const orderData = {
        customerName: 'Guest',
        customerMobile: '',
        seatNumber: '',
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

    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f5f7fa 50%)',
      paddingBottom: 100
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 8 }}>
          ☕ Smart Cafe Menu
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, margin: 0 }}>
          Order from your seat!
        </p>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Category Filter */}
        <div style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          marginBottom: 20,
          paddingBottom: 8
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
                  borderRadius: 20,
                  background: selectedCategory === cat ? '#fff' : 'rgba(255,255,255,0.9)',
                  color: selectedCategory === cat ? '#667eea' : '#262626',
                  border: 'none'
                }}
              >
                {cat}
              </Button>
            ))}
          </Space>
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Empty description="No items available" />
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => {
              const inCart = cart[product._id];
              const quantity = inCart?.quantity || 0;

              return (
                <Card
                  key={product._id}
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: inCart ? '3px solid #52c41a' : '2px solid #e8e8e8'
                  }}
                  bodyStyle={{ padding: 12 }}
                  cover={
                    product.imageUrl ? (
                      <img
                        alt={product.name}
                        src={product.imageUrl.startsWith('http')
                          ? product.imageUrl
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${product.imageUrl}`}
                        style={{ height: 120, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div style="height:120px;background:#f5f7fa;display:flex;align-items:center;justify-content:center;font-size:50px">☕</div>';
                        }}
                      />
                    ) : (
                      <div style={{
                        height: 120,
                        background: '#f5f7fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 50
                      }}>
                        ☕
                      </div>
                    )
                  }
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#667eea', marginBottom: 8 }}>
                      ₹{product.price}
                    </div>

                    {quantity > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Button
                          danger
                          shape="circle"
                          icon={<MinusOutlined />}
                          onClick={() => updateCart(product, -1)}
                        />
                        <span style={{ fontSize: 18, fontWeight: 700, minWidth: 25, textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<PlusOutlined />}
                          onClick={() => updateCart(product, 1)}
                        />
                      </div>
                    ) : (
                      <Button
                        type="primary"
                        block
                        onClick={() => updateCart(product, 1)}
                        disabled={product.currentStock <= 0}
                      >
                        {product.currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 1000
        }}>
          <Button
            type="primary"
            size="large"
            block
            icon={<ShoppingCartOutlined />}
            onClick={proceedToCheckout}
            style={{
              height: 60,
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(82, 196, 26, 0.5)'
            }}
          >
            View Cart ({cartCount}) - ₹{cartTotal}
          </Button>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal
        title="Complete Your Order"
        open={showCheckout}
        onCancel={() => setShowCheckout(false)}
        footer={null}
        width={400}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Your Order</h3>
            {cartItems.map(item => (
              <div key={item._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: '#999', fontSize: 13 }}>
                    {item.quantity} × ₹{item.price}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{item.itemTotal}</div>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 12,
              marginTop: 12,
              borderTop: '2px solid #000',
              fontSize: 18,
              fontWeight: 700
            }}>
              <span>Total:</span>
              <span style={{ color: '#52c41a' }}>₹{cartTotal}</span>
            </div>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Button
              type="primary"
              size="large"
              block
              icon={<CheckOutlined />}
              onClick={placeOrder}
              loading={processing}
              style={{
                height: 56,
                fontSize: 18,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
                border: 'none'
              }}
            >
              Place Order
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        title={null}
        open={!!orderSuccess}
        onCancel={() => setOrderSuccess(null)}
        footer={[
          <Button key="close" size="large" type="primary" onClick={() => setOrderSuccess(null)} block>
            Done
          </Button>
        ]}
        width={400}
      >
        {orderSuccess && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Order Placed!</h2>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#667eea', marginBottom: 16 }}>
              Order #{orderSuccess.orderNo}
            </div>
            <p style={{ color: '#666', fontSize: 15 }}>
              Your order will be prepared shortly.
            </p>
            <div style={{ marginTop: 20, padding: 16, background: '#f5f7fa', borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#52c41a' }}>
                ₹{orderSuccess.totalAmount.toFixed(2)}
              </div>
              <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>
                {moment(orderSuccess.orderDate).format('DD MMM YYYY, hh:mm A')}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerMenu;
