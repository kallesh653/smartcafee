import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  InputNumber,
  message,
  Modal,
  Form,
  Input,
  Select,
  Statistic,
  Badge,
  Space,
  Divider,
  Tag,
  Typography,
  Tabs,
  Spin
} from 'antd';
import {
  PlusOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ReadyItems = () => {
  const [readyItems, setReadyItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [addingStock, setAddingStock] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchReadyItems();
  }, []);

  const fetchReadyItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ready-items');
      if (response.data.success) {
        setReadyItems(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch ready items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(readyItems.map(item => item.category))];

  const filteredItems = activeCategory === 'All'
    ? readyItems
    : readyItems.filter(item => item.category === activeCategory);

  const handleQuantityChange = (itemId, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: value || 0
      }
    }));
  };

  const handleNotesChange = (itemId, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes: value
      }
    }));
  };

  const addSingleItem = async (readyItem) => {
    const quantity = selectedItems[readyItem._id]?.quantity || readyItem.defaultQuantity;
    const notes = selectedItems[readyItem._id]?.notes || '';

    if (!quantity || quantity <= 0) {
      message.warning('Please enter a valid quantity');
      return;
    }

    try {
      setAddingStock(true);
      const response = await api.post('/ready-items/add-stock', {
        readyItemId: readyItem._id,
        quantity,
        notes
      });

      if (response.data.success) {
        message.success(response.data.message);
        setSelectedItems(prev => {
          const newItems = { ...prev };
          delete newItems[readyItem._id];
          return newItems;
        });
        fetchReadyItems();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add stock');
    } finally {
      setAddingStock(false);
    }
  };

  const addBulkItems = async () => {
    const items = Object.entries(selectedItems)
      .filter(([_, data]) => data.quantity > 0)
      .map(([readyItemId, data]) => ({
        readyItemId,
        quantity: data.quantity,
        notes: data.notes || ''
      }));

    if (items.length === 0) {
      message.warning('Please select items and enter quantities');
      return;
    }

    try {
      setAddingStock(true);
      const response = await api.post('/ready-items/bulk-add-stock', { items });

      if (response.data.success) {
        const { successCount, errorCount } = response.data.data;
        message.success(`Successfully added ${successCount} items to stock`);
        if (errorCount > 0) {
          message.warning(`${errorCount} items failed`);
        }
        setSelectedItems({});
        fetchReadyItems();
      }
    } catch (error) {
      message.error('Failed to process bulk addition');
    } finally {
      setAddingStock(false);
    }
  };

  const openManageModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
    setManageModalVisible(true);
  };

  const handleSaveReadyItem = async (values) => {
    try {
      if (editingItem) {
        await api.put(`/ready-items/${editingItem._id}`, values);
        message.success('Ready item updated successfully');
      } else {
        await api.post('/ready-items', values);
        message.success('Ready item created successfully');
      }
      setManageModalVisible(false);
      form.resetFields();
      fetchReadyItems();
    } catch (error) {
      message.error('Failed to save ready item');
    }
  };

  const getTotalSelectedItems = () => {
    return Object.values(selectedItems).filter(item => item.quantity > 0).length;
  };

  const ItemCard = ({ item }) => {
    const selectedQty = selectedItems[item._id]?.quantity || 0;
    const currentStock = item.product?.currentStock || 0;
    const isLowStock = currentStock < item.minStockAlert;

    return (
      <Card
        hoverable
        style={{
          borderRadius: 12,
          border: selectedQty > 0 ? '2px solid #52c41a' : '1px solid #f0f0f0',
          boxShadow: selectedQty > 0 ? '0 4px 12px rgba(82, 196, 26, 0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s',
          height: '100%'
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
                {item.itemName}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.category}
              </Text>
            </div>
            {isLowStock && (
              <Badge count="Low Stock" style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </div>

          <Row gutter={8}>
            <Col span={12}>
              <Statistic
                title="Current Stock"
                value={currentStock}
                suffix={item.unit}
                valueStyle={{ fontSize: 16, color: isLowStock ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Cost Price"
                value={item.costPrice}
                prefix="₹"
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0' }} />

          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Text strong>Add Quantity:</Text>
            <InputNumber
              min={0}
              max={10000}
              defaultValue={item.defaultQuantity}
              value={selectedItems[item._id]?.quantity}
              onChange={(value) => handleQuantityChange(item._id, value)}
              addonAfter={item.unit}
              style={{ width: '100%' }}
              size="large"
            />

            <Input
              placeholder="Notes (optional)"
              value={selectedItems[item._id]?.notes || ''}
              onChange={(e) => handleNotesChange(item._id, e.target.value)}
              style={{ marginTop: 8 }}
            />
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => addSingleItem(item)}
            loading={addingStock}
            disabled={!selectedItems[item._id]?.quantity || selectedItems[item._id]?.quantity <= 0}
            block
            size="large"
            style={{ marginTop: 8, borderRadius: 8, fontWeight: 600 }}
          >
            Add to Stock
          </Button>
        </Space>
      </Card>
    );
  };

  return (
    <div style={{ padding: window.innerWidth < 768 ? 0 : 0 }}>
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={12}>
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                <ThunderboltOutlined /> Ready Items - Quick Stock Addition
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                Quickly add stock for frequently purchased items
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={12} style={{ textAlign: window.innerWidth < 768 ? 'left' : 'right' }}>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchReadyItems}
                loading={loading}
                size="large"
                style={{ fontWeight: 600 }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<AppstoreOutlined />}
                onClick={() => openManageModal()}
                size="large"
                style={{
                  background: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  borderColor: 'white'
                }}
              >
                Manage Ready Items
              </Button>
              {getTotalSelectedItems() > 0 && (
                <Badge count={getTotalSelectedItems()} offset={[-5, 5]}>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={addBulkItems}
                    loading={addingStock}
                    size="large"
                    style={{
                      background: '#52c41a',
                      borderColor: '#52c41a',
                      fontWeight: 600
                    }}
                  >
                    Add All Selected
                  </Button>
                </Badge>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          items={categories.map(cat => ({
            key: cat,
            label: cat,
            icon: <AppstoreOutlined />
          }))}
          size="large"
        />
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {filteredItems.length === 0 ? (
            <Col span={24}>
              <Card style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 12 }}>
                <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                <Title level={4} style={{ marginTop: 16, color: '#8c8c8c' }}>
                  No ready items found
                </Title>
                <Text type="secondary">Create ready items to quickly add stock</Text>
                <br />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openManageModal()}
                  style={{ marginTop: 16 }}
                  size="large"
                >
                  Create Ready Item
                </Button>
              </Card>
            </Col>
          ) : (
            filteredItems.map(item => (
              <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
                <ItemCard item={item} />
              </Col>
            ))
          )}
        </Row>
      </Spin>

      <Modal
        title={editingItem ? 'Edit Ready Item' : 'Create Ready Item'}
        open={manageModalVisible}
        onCancel={() => {
          setManageModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveReadyItem}
          initialValues={{
            unit: 'Piece',
            defaultQuantity: 1,
            isActive: true,
            displayOrder: 0
          }}
        >
          <Form.Item
            label="Item Name"
            name="itemName"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input placeholder="e.g., Water Bottle 1L" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please enter category' }]}
              >
                <Input placeholder="e.g., Beverages" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Unit"
                name="unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select size="large">
                  <Select.Option value="Piece">Piece</Select.Option>
                  <Select.Option value="Bottle">Bottle</Select.Option>
                  <Select.Option value="Packet">Packet</Select.Option>
                  <Select.Option value="Box">Box</Select.Option>
                  <Select.Option value="KG">KG</Select.Option>
                  <Select.Option value="Liter">Liter</Select.Option>
                  <Select.Option value="ML">ML</Select.Option>
                  <Select.Option value="Gram">Gram</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Cost Price"
                name="costPrice"
                rules={[{ required: true, message: 'Please enter cost price' }]}
              >
                <InputNumber
                  min={0}
                  prefix="₹"
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Selling Price"
                name="sellingPrice"
                rules={[{ required: true, message: 'Please enter selling price' }]}
              >
                <InputNumber
                  min={0}
                  prefix="₹"
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Default Quantity" name="defaultQuantity">
                <InputNumber min={1} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Min Stock Alert" name="minStockAlert">
                <InputNumber min={0} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Optional description" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setManageModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReadyItems;
