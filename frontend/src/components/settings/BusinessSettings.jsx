import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  message,
  Row,
  Col,
  Divider,
  Space,
  Tabs,
  Alert,
  Upload,
  Select,
  Image,
  Modal
} from 'antd';
import {
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PrinterOutlined,
  SettingOutlined,
  SaveOutlined,
  NumberOutlined,
  UploadOutlined,
  EyeOutlined,
  PictureOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import Layout from '../common/Layout';
import api from '../../services/api';
import moment from 'moment';

const BusinessSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState('');
  const [paperWidth, setPaperWidth] = useState(80);
  const [showPreview, setShowPreview] = useState(false);
  const [menuSlideFiles, setMenuSlideFiles] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings');
      // Ensure menuSlides array exists with proper structure
      const settings = {
        ...data.settings,
        menuSlides: data.settings?.menuSlides?.length > 0
          ? data.settings.menuSlides
          : [
              { type: 'image', title: '', subtitle: '', description: '', imageUrl: '', videoUrl: '', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '' },
              { type: 'image', title: '', subtitle: '', description: '', imageUrl: '', videoUrl: '', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '' },
              { type: 'image', title: '', subtitle: '', description: '', imageUrl: '', videoUrl: '', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '' }
            ]
      };
      form.setFieldsValue(settings);
      setLogoUrl(data.settings?.logo || '');
      setPaperWidth(data.settings?.thermalPrinterSettings?.paperWidth || 80);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      const url = info.file.response.imageUrl;
      setLogoUrl(url);
      form.setFieldsValue({ logo: url });
      message.success('Logo uploaded successfully');
    } else if (info.file.status === 'error') {
      message.error('Logo upload failed');
    }
  };

  const handleMenuSlideUpload = async (info, index) => {
    if (info.file.status === 'done') {
      const url = info.file.response.imageUrl;
      // Get current menuSlides array
      const currentSlides = form.getFieldValue('menuSlides') || [];
      // Update the specific slide's imageUrl
      if (currentSlides[index]) {
        currentSlides[index] = {
          ...currentSlides[index],
          imageUrl: url
        };
        form.setFieldsValue({ menuSlides: currentSlides });
        message.success('Slide image uploaded successfully! Click Save Settings to apply.');
      }
    } else if (info.file.status === 'error') {
      message.error('Failed to upload slide image');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      await api.put('/settings', values);
      message.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    {
      key: 'business',
      label: (
        <Space>
          <ShopOutlined />
          Business Info
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Alert
              message="Business Information"
              description="Configure your shop details that appear on bills and reports"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="shopName"
              label="Shop Name"
              rules={[{ required: true, message: 'Please enter shop name' }]}
            >
              <Input
                prefix={<ShopOutlined />}
                placeholder="Enter shop name"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="shopMobile"
              label="Shop Mobile"
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter mobile number"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="shopEmail"
              label="Shop Email"
            >
              <Input
                prefix={<MailOutlined />}
                type="email"
                placeholder="Enter email address"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="gstNumber"
              label="GST Number"
            >
              <Input
                placeholder="Enter GST number"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="shopAddress"
              label="Shop Address"
            >
              <Input.TextArea
                prefix={<EnvironmentOutlined />}
                placeholder="Enter complete address"
                rows={3}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'billing',
      label: (
        <Space>
          <NumberOutlined />
          Billing Settings
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Alert
              message="Bill Number Configuration"
              description="Control bill numbering format and starting number"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="billPrefix"
              label="Bill Prefix"
              tooltip="Prefix for bill numbers (e.g., BILL, INV)"
            >
              <Input
                prefix={<FileTextOutlined />}
                placeholder="BILL"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="billStartNumber"
              label="Starting Bill Number"
              tooltip="Bill numbering will start from this number"
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                size="large"
                placeholder="1"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="currentBillNo"
              label="Current Bill Number"
              tooltip="Last used bill number (auto-incremented)"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                size="large"
                disabled
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider />
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="gstEnabled"
              label="Enable GST"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="defaultGstPercent"
              label="Default GST %"
              dependencies={['gstEnabled']}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                size="large"
                placeholder="5"
                suffix="%"
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'printer',
      label: (
        <Space>
          <PrinterOutlined />
          Printer Settings
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Alert
              message="Thermal Printer Configuration"
              description="Configure your thermal printer for bill printing"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['thermalPrinterSettings', 'printerName']}
              label="Printer Name"
            >
              <Input
                prefix={<PrinterOutlined />}
                placeholder="ThermalPrinter"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['thermalPrinterSettings', 'paperWidth']}
              label="Paper Width"
            >
              <Select
                size="large"
                onChange={(value) => setPaperWidth(value)}
                options={[
                  { value: 80, label: '80mm (Standard Thermal Paper)' },
                  { value: 79, label: '79mm (Medium Thermal Paper)' },
                  { value: 76.2, label: '76.2mm (3 inch Thermal Paper)' },
                  { value: 58, label: '58mm (Small Thermal Paper)' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Upload Logo"
              tooltip="Upload your shop logo for thermal bills"
            >
              <Upload
                name="image"
                action={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/upload`}
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }}
                listType="picture-card"
                showUploadList={false}
                onChange={handleLogoUpload}
              >
                {logoUrl ? (
                  <Image
                    src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${logoUrl}`}
                    alt="logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preview={false}
                  />
                ) : (
                  <div>
                    <UploadOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8 }}>Upload Logo</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item name="logo" hidden>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name={['thermalPrinterSettings', 'footerText']}
              label="Footer Text"
            >
              <Input.TextArea
                placeholder="Thank You! Visit Again"
                rows={2}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Button
              type="dashed"
              icon={<EyeOutlined />}
              onClick={() => setShowPreview(true)}
              block
              size="large"
            >
              Preview Thermal Bill ({paperWidth}mm)
            </Button>
          </Col>
        </Row>
      ),
    },
    {
      key: 'permissions',
      label: (
        <Space>
          <SettingOutlined />
          Permissions
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Alert
              message="Default User Permissions"
              description="Configure default permissions for cashier users"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={['defaultPermissions', 'userCanEditPrice']}
              label="Can Edit Price"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Allowed"
                unCheckedChildren="Not Allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={['defaultPermissions', 'userCanGiveDiscount']}
              label="Can Give Discount"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Allowed"
                unCheckedChildren="Not Allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={['defaultPermissions', 'maxUserDiscount']}
              label="Max Discount %"
              dependencies={[['defaultPermissions', 'userCanGiveDiscount']]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                size="large"
                placeholder="10"
                suffix="%"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider />
          </Col>
          <Col xs={24}>
            <Alert
              message="Customer Order Management"
              description="Control who can convert customer orders to bills"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['defaultPermissions', 'customerCanConvertOrderToBill']}
              label="Allow Customer Order to Bill Conversion"
              valuePropName="checked"
              tooltip="If enabled, staff can generate bills from customer orders placed via menu"
            >
              <Switch
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'menu',
      label: (
        <Space>
          <FileTextOutlined />
          Menu Slider
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Alert
              message="Customer Menu Slider"
              description="Simple slider configuration for the customer menu. Leave fields empty to hide that content."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24}>
            <Form.Item
              name="shopTagline"
              label="Shop Tagline"
              tooltip="Displayed below shop name on menu"
            >
              <Input
                placeholder="Delicious treats just a tap away"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider>Slide 1 (Optional)</Divider>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['menuSlides', 0, 'title']}
              label="Title"
            >
              <Input placeholder="Welcome to Smart Cafe" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['menuSlides', 0, 'subtitle']}
              label="Subtitle"
            >
              <Input placeholder="Order from your seat!" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label="Upload Slide Image"
              tooltip="Upload image for slide 1. After upload, click Save Settings to apply changes."
            >
              <Upload
                name="image"
                action={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/upload`}
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }}
                listType="picture"
                maxCount={1}
                onChange={(info) => handleMenuSlideUpload(info, 0)}
                showUploadList={true}
              >
                <Button icon={<UploadOutlined />} size="large" block>
                  Upload Image for Slide 1
                </Button>
              </Upload>
              {form.getFieldValue(['menuSlides', 0, 'imageUrl']) && (
                <div style={{ marginTop: 12, padding: 12, background: '#f5f7fa', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Current Slide 1 Image:</div>
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${form.getFieldValue(['menuSlides', 0, 'imageUrl'])}`}
                    alt="Slide 1 Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML += '<div style="color: red; font-size: 12px;">Image not found or failed to load</div>';
                    }}
                  />
                </div>
              )}
            </Form.Item>
            <Form.Item name={['menuSlides', 0, 'imageUrl']} hidden>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider>Slide 2 (Optional)</Divider>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['menuSlides', 1, 'title']}
              label="Title"
            >
              <Input placeholder="Special Offers" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['menuSlides', 1, 'subtitle']}
              label="Subtitle"
            >
              <Input placeholder="Check out our deals!" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label="Upload Slide Image"
              tooltip="Upload image for slide 2. After upload, click Save Settings to apply changes."
            >
              <Upload
                name="image"
                action={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/upload`}
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }}
                listType="picture"
                maxCount={1}
                onChange={(info) => handleMenuSlideUpload(info, 1)}
                showUploadList={true}
              >
                <Button icon={<UploadOutlined />} size="large" block>
                  Upload Image for Slide 2
                </Button>
              </Upload>
              {form.getFieldValue(['menuSlides', 1, 'imageUrl']) && (
                <div style={{ marginTop: 12, padding: 12, background: '#f5f7fa', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Current Slide 2 Image:</div>
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${form.getFieldValue(['menuSlides', 1, 'imageUrl'])}`}
                    alt="Slide 2 Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML += '<div style="color: red; font-size: 12px;">Image not found or failed to load</div>';
                    }}
                  />
                </div>
              )}
            </Form.Item>
            <Form.Item name={['menuSlides', 1, 'imageUrl']} hidden>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Divider>Slide 3 (Optional)</Divider>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['menuSlides', 2, 'title']}
              label="Title"
            >
              <Input placeholder="Fast Service" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={['menuSlides', 2, 'subtitle']}
              label="Subtitle"
            >
              <Input placeholder="Quick and easy ordering" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label="Upload Slide Image"
              tooltip="Upload image for slide 3. After upload, click Save Settings to apply changes."
            >
              <Upload
                name="image"
                action={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/upload`}
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }}
                listType="picture"
                maxCount={1}
                onChange={(info) => handleMenuSlideUpload(info, 2)}
                showUploadList={true}
              >
                <Button icon={<UploadOutlined />} size="large" block>
                  Upload Image for Slide 3
                </Button>
              </Upload>
              {form.getFieldValue(['menuSlides', 2, 'imageUrl']) && (
                <div style={{ marginTop: 12, padding: 12, background: '#f5f7fa', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Current Slide 3 Image:</div>
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${form.getFieldValue(['menuSlides', 2, 'imageUrl'])}`}
                    alt="Slide 3 Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML += '<div style="color: red; font-size: 12px;">Image not found or failed to load</div>';
                    }}
                  />
                </div>
              )}
            </Form.Item>
            <Form.Item name={['menuSlides', 2, 'imageUrl']} hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Business Settings
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Configure your business information, billing, and printer settings
        </p>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            billPrefix: 'BILL',
            billStartNumber: 1,
            currentBillNo: 0,
            gstEnabled: false,
            defaultGstPercent: 5,
            thermalPrinterSettings: {
              printerName: 'ThermalPrinter',
              paperWidth: 48,
              enableLogo: false,
              footerText: 'Thank You! Visit Again',
            },
            defaultPermissions: {
              userCanEditPrice: false,
              userCanGiveDiscount: true,
              maxUserDiscount: 10,
            },
          }}
        >
          <Tabs
            defaultActiveKey="business"
            items={items}
            tabPosition="top"
            type="card"
          />

          <Divider />

          <Row justify="end">
            <Col>
              <Space>
                <Button size="large" onClick={() => form.resetFields()}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                >
                  Save Settings
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Thermal Bill Preview Modal */}
      <Modal
        title={`Thermal Bill Preview - ${paperWidth}mm Paper`}
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowPreview(false)}>
            Close Preview
          </Button>
        ]}
        width={paperWidth === 80 ? 450 : 350}
        centered
      >
        <div style={{
          width: paperWidth === 80 ? '72mm' : '50mm',
          margin: '0 auto',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: paperWidth === 80 ? '12px' : '11px',
          border: '2px dashed #ccc',
          backgroundColor: '#fff'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            {logoUrl && (
              <div style={{ marginBottom: '8px' }}>
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${logoUrl}`}
                  alt="logo"
                  style={{ maxWidth: '50px', maxHeight: '50px' }}
                />
              </div>
            )}
            <div style={{
              fontSize: paperWidth === 80 ? '16px' : '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {form.getFieldValue('shopName') || 'SMART CAFE'}
            </div>
            {form.getFieldValue('shopTagline') && (
              <div style={{ fontSize: paperWidth === 80 ? '11px' : '10px', marginTop: '2px' }}>
                {form.getFieldValue('shopTagline')}
              </div>
            )}
            {form.getFieldValue('shopAddress') && (
              <div style={{ fontSize: paperWidth === 80 ? '10px' : '9px', marginTop: '4px' }}>
                {form.getFieldValue('shopAddress')}
              </div>
            )}
            {form.getFieldValue('shopMobile') && (
              <div style={{ fontSize: paperWidth === 80 ? '10px' : '9px' }}>
                Tel: {form.getFieldValue('shopMobile')}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Bill Details */}
          <div style={{ fontSize: paperWidth === 80 ? '10px' : '9px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bill No: {form.getFieldValue('billPrefix') || 'BILL'}-001</span>
              <span>{moment().format('DD/MM/YY')}</span>
            </div>
            <div>Time: {moment().format('hh:mm A')}</div>
            <div>Cashier: Admin</div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Items Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: paperWidth === 80 ? '10px' : '9px',
            fontWeight: 'bold'
          }}>
            <span style={{ flex: 2 }}>ITEM</span>
            <span style={{ flex: 1, textAlign: 'center' }}>QTY</span>
            <span style={{ flex: 1, textAlign: 'right' }}>RATE</span>
            <span style={{ flex: 1, textAlign: 'right' }}>AMT</span>
          </div>

          <div style={{ borderTop: '1px solid #000', margin: '4px 0' }}></div>

          {/* Sample Items */}
          <div style={{ fontSize: paperWidth === 80 ? '10px' : '9px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ flex: 2 }}>Coffee</span>
              <span style={{ flex: 1, textAlign: 'center' }}>2</span>
              <span style={{ flex: 1, textAlign: 'right' }}>50</span>
              <span style={{ flex: 1, textAlign: 'right' }}>100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ flex: 2 }}>Sandwich</span>
              <span style={{ flex: 1, textAlign: 'center' }}>1</span>
              <span style={{ flex: 1, textAlign: 'right' }}>80</span>
              <span style={{ flex: 1, textAlign: 'right' }}>80</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Totals */}
          <div style={{ fontSize: paperWidth === 80 ? '10px' : '9px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>₹180.00</span>
            </div>
            {form.getFieldValue('gstEnabled') && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST ({form.getFieldValue('defaultGstPercent') || 5}%):</span>
                <span>₹{(180 * (form.getFieldValue('defaultGstPercent') || 5) / 100).toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: paperWidth === 80 ? '12px' : '11px',
              fontWeight: 'bold',
              marginTop: '4px'
            }}>
              <span>GRAND TOTAL:</span>
              <span>₹{form.getFieldValue('gstEnabled')
                ? (180 * (1 + (form.getFieldValue('defaultGstPercent') || 5) / 100)).toFixed(2)
                : '180.00'}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Payment */}
          <div style={{ fontSize: paperWidth === 80 ? '10px' : '9px' }}>
            <div>Payment Mode: Cash</div>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            fontSize: paperWidth === 80 ? '11px' : '10px',
            marginTop: '8px'
          }}>
            <div style={{ fontWeight: 'bold' }}>
              {form.getFieldValue(['thermalPrinterSettings', 'footerText']) || 'Thank You! Visit Again'}
            </div>
            <div style={{ fontSize: paperWidth === 80 ? '9px' : '8px', marginTop: '4px' }}>
              Powered by Smart Cafe POS
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default BusinessSettings;
