import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Tag, Switch, Image
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PictureOutlined
} from '@ant-design/icons';
import Layout from '../common/Layout';
import api from '../../services/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (product = null) => {
    setEditingProduct(product);
    setModalVisible(true);
    setImageFile(null);
    setImagePreview(product?.imageUrl
      ? (product.imageUrl.startsWith('http')
          ? product.imageUrl
          : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${product.imageUrl}`)
      : null);

    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    setImageFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Append all form fields
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Append image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Product updated successfully');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Product created successfully');
      }

      setModalVisible(false);
      fetchProducts();
      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = (product) => {
    Modal.confirm({
      title: 'Delete Product?',
      content: `Are you sure you want to delete "${product.name}"?`,
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/products/${product._id}`);
          message.success('Product deleted');
          fetchProducts();
        } catch (error) {
          message.error('Failed to delete product');
        }
      }
    });
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'serialNo',
      key: 'serialNo',
      render: (serialNo) => (
        <Tag color="orange" style={{ fontSize: 14, fontWeight: 700, padding: '4px 12px' }}>
          #{serialNo || '-'}
        </Tag>
      ),
      width: 70,
      sorter: (a, b) => (a.serialNo || 0) - (b.serialNo || 0),
      defaultSortOrder: 'ascend'
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'image',
      render: (imageUrl) => imageUrl ? (
        <Image
          src={imageUrl.startsWith('http')
            ? imageUrl
            : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imageUrl}`}
          alt="Product"
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 8 }}
        />
      ) : (
        <div style={{
          width: 50,
          height: 50,
          background: '#f0f0f0',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
        </div>
      ),
      width: 80
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <strong style={{ color: '#667eea' }}>₹{price}</strong>,
      width: 100
    },
    {
      title: 'Stock',
      dataIndex: 'currentStock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock <= 10 ? 'red' : stock <= 20 ? 'orange' : 'green'}>
          {stock}
        </Tag>
      ),
      width: 80
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
      width: 180
    }
  ];

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              📦 Product Management
            </h1>
            <p style={{ color: '#666', margin: '4px 0 0 0' }}>
              Manage your cafe products and menu items
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => showModal()}
            style={{ fontWeight: 600 }}
          >
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageFile(null);
          setImagePreview(null);
        }}
        onOk={() => form.submit()}
        width={600}
        okText={editingProduct ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Serial Number (Item #)"
            name="serialNo"
          >
            <InputNumber
              placeholder="e.g., 1, 15, 30..."
              min={1}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Product Image"
          >
            {imagePreview && (
              <div style={{ marginBottom: 12 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            )}
            <Upload
              beforeUpload={() => false}
              onChange={handleImageChange}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="e.g., Cappuccino" size="large" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input placeholder="e.g., Hot Beverages" size="large" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea placeholder="Product description" rows={3} />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              placeholder="0.00"
              min={0}
              style={{ width: '100%' }}
              size="large"
              prefix="₹"
            />
          </Form.Item>

          <Form.Item
            label="Cost Price"
            name="costPrice"
          >
            <InputNumber
              placeholder="0.00"
              min={0}
              style={{ width: '100%' }}
              size="large"
              prefix="₹"
            />
          </Form.Item>

          <Form.Item
            label="Unit"
            name="unit"
            initialValue="Piece"
          >
            <Select size="large">
              <Select.Option value="Piece">Piece</Select.Option>
              <Select.Option value="PCS">PCS</Select.Option>
              <Select.Option value="Cup">Cup</Select.Option>
              <Select.Option value="Bottle">Bottle</Select.Option>
              <Select.Option value="KG">KG</Select.Option>
              <Select.Option value="Liter">Liter</Select.Option>
              <Select.Option value="ML">ML</Select.Option>
              <Select.Option value="Gram">Gram</Select.Option>
              <Select.Option value="Packet">Packet</Select.Option>
              <Select.Option value="TRAY">TRAY</Select.Option>
              <Select.Option value="TUB">TUB</Select.Option>
              <Select.Option value="LARGE">LARGE</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Stock Quantity"
            name="currentStock"
            initialValue={0}
          >
            <InputNumber
              placeholder="0"
              min={0}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Minimum Stock Alert"
            name="minStockAlert"
            initialValue={10}
          >
            <InputNumber
              placeholder="10"
              min={0}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Active Status"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item
            label="Popular Item"
            name="isPopular"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ProductManagement;
