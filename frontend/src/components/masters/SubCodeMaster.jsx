import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Layout from '../common/Layout';
import api from '../../services/api';

const SubCodeMaster = () => {
  const [data, setData] = useState([]);
  const [mainCodes, setMainCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchMainCodes();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get('/subcodes');
      setData(response.subCodes);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMainCodes = async () => {
    const { data: response } = await api.get('/maincodes?isActive=true');
    setMainCodes(response.mainCodes);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await api.put(`/subcodes/${editingItem._id}`, values);
        message.success('Updated successfully');
      } else {
        await api.post('/subcodes', values);
        message.success('Created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({ ...record, mainCode: record.mainCode._id });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subcodes/${id}`);
      message.success('Deleted successfully');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { title: 'Sub Code', dataIndex: 'subCode', key: 'subCode' },
    { title: 'Main Code', dataIndex: ['mainCode', 'name'], key: 'mainCode' },
    { title: 'Item Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `₹${price}` },
    { title: 'Stock', dataIndex: 'currentStock', key: 'currentStock', render: (stock, record) => {
      if (stock === undefined || stock === null) {
        return <Tag color="blue">Unlimited</Tag>;
      }
      return <Tag color={stock <= record.minStockAlert ? 'red' : 'green'}>{stock} {record.unit}</Tag>;
    }},
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Layout>
      <h1>Sub Code Master (Items)</h1>
      <Card>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setModalVisible(true); }} style={{ marginBottom: 16 }}>
          Add Item
        </Button>
        <Table dataSource={data} columns={columns} rowKey="_id" loading={loading} />
      </Card>

      <Modal title={editingItem ? 'Edit Item' : 'Add Item'} open={modalVisible} onCancel={() => { setModalVisible(false); form.resetFields(); setEditingItem(null); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="mainCode" label="Main Code" rules={[{ required: true }]}>
            <Select placeholder="Select Main Code">
              {mainCodes.map(mc => <Select.Option key={mc._id} value={mc._id}>{mc.code} - {mc.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="subCode" label="Sub Code" rules={[{ required: true }]}>
            <Input placeholder="01-01" disabled={!!editingItem} />
          </Form.Item>
          <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
            <Input placeholder="Lemon Juice" />
          </Form.Item>
          <Form.Item name="price" label="Selling Price" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="costPrice" label="Cost Price">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="Unit">
            <Select>
              <Select.Option value="Piece">Piece</Select.Option>
              <Select.Option value="PCS">PCS</Select.Option>
              <Select.Option value="KG">KG</Select.Option>
              <Select.Option value="Liter">Liter</Select.Option>
              <Select.Option value="ML">ML</Select.Option>
              <Select.Option value="TRAY">TRAY</Select.Option>
              <Select.Option value="TUB">TUB</Select.Option>
              <Select.Option value="LARGE">LARGE</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="currentStock" label="Current Stock (Optional)" tooltip="Leave empty for unlimited stock">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Leave blank for no stock tracking" />
          </Form.Item>
          <Form.Item name="minStockAlert" label="Minimum Stock Alert (Optional)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Minimum quantity alert level" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>{editingItem ? 'Update' : 'Create'}</Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SubCodeMaster;
