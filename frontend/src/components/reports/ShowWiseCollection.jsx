import { useState, useEffect } from 'react';
import {
  DatePicker,
  Card,
  Table,
  Button,
  Input,
  Space,
  Row,
  Col,
  message,
  Statistic,
  Tag,
  TimePicker,
  Divider,
  Typography,
  Empty
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  BarChartOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';
import Layout from '../common/Layout';

const { Title, Text } = Typography;

const ShowWiseCollection = () => {
  const [dateStr, setDateStr] = useState(moment().format('YYYY-MM-DD'));
  const [slots, setSlots] = useState([
    { name: 'Morning Show', start: '10:00', end: '13:00', color: '#52c41a' },
    { name: 'Matinee Show', start: '13:00', end: '16:00', color: '#1890ff' },
    { name: 'Evening Show', start: '18:00', end: '21:00', color: '#faad14' },
    { name: 'Night Show', start: '21:00', end: '23:59', color: '#722ed1' }
  ]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalShows: 0,
    totalBills: 0,
    totalSales: 0,
    topShow: null
  });

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const updateSlot = (idx, patch) => {
    setSlots(s => s.map((slot, i) => i === idx ? { ...slot, ...patch } : slot));
  };

  const addSlot = () => {
    setSlots([...slots, { name: 'Custom Show', start: '00:00', end: '01:00', color: '#eb2f96' }]);
  };

  const removeSlot = (idx) => {
    if (slots.length <= 1) {
      message.warning('At least one show slot is required');
      return;
    }
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const generate = async () => {
    try {
      setLoading(true);
      const payload = slots.map(s => ({ name: s.name, start: s.start, end: s.end }));
      const params = new URLSearchParams();
      params.set('date', dateStr);
      params.set('slots', JSON.stringify(payload));
      const { data: resp } = await api.get(`/reports/show-wise-collection?${params.toString()}`);
      const reportData = resp.report || [];
      setData(reportData);

      // Calculate summary
      const totalBills = reportData.reduce((sum, r) => sum + (r.totalBills || 0), 0);
      const totalSales = reportData.reduce((sum, r) => sum + (r.totalSales || 0), 0);
      const topShow = reportData.length > 0
        ? reportData.reduce((max, r) => (r.totalSales > (max?.totalSales || 0) ? r : max), null)
        : null;

      setSummary({
        totalShows: reportData.length,
        totalBills,
        totalSales,
        topShow
      });

      message.success('Report generated successfully');
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  const columns = [
    {
      title: 'Show',
      dataIndex: 'slotName',
      key: 'slotName',
      render: (name, record) => {
        const slot = slots.find(s => s.name === name);
        return (
          <Space direction="vertical" size={0}>
            <Tag color={slot?.color || 'blue'} style={{ fontSize: 13, padding: '4px 12px' }}>
              {name}
            </Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              <ClockCircleOutlined /> {record.start} - {record.end}
            </Text>
          </Space>
        );
      },
      width: 180,
      fixed: isMobile ? false : 'left'
    },
    {
      title: 'Bills',
      dataIndex: 'totalBills',
      key: 'totalBills',
      align: 'center',
      render: (v) => <Tag color="blue">{v}</Tag>,
      width: 80
    },
    {
      title: 'Cash',
      dataIndex: 'cash',
      key: 'cash',
      align: 'right',
      render: (v) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₹{v?.toFixed(2) || '0.00'}
        </Text>
      ),
      width: 120
    },
    {
      title: 'UPI',
      dataIndex: 'upi',
      key: 'upi',
      align: 'right',
      render: (v) => (
        <Text strong style={{ color: '#1890ff' }}>
          ₹{v?.toFixed(2) || '0.00'}
        </Text>
      ),
      width: 120
    },
    {
      title: 'Card',
      dataIndex: 'card',
      key: 'card',
      align: 'right',
      render: (v) => (
        <Text strong style={{ color: '#722ed1' }}>
          ₹{v?.toFixed(2) || '0.00'}
        </Text>
      ),
      width: 120
    },
    {
      title: 'Mixed',
      dataIndex: 'mixed',
      key: 'mixed',
      align: 'right',
      render: (v) => (
        <Text strong style={{ color: '#faad14' }}>
          ₹{v?.toFixed(2) || '0.00'}
        </Text>
      ),
      width: 120
    },
    {
      title: 'Total Sales',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right',
      render: (v) => (
        <Text strong style={{ fontSize: 15, color: '#000' }}>
          ₹{v?.toFixed(2) || '0.00'}
        </Text>
      ),
      width: 140,
      fixed: isMobile ? false : 'right'
    }
  ];

  return (
    <Layout>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={16}>
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                <BarChartOutlined /> Show-wise Collection Report
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                Analyze sales performance by show timings
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Space wrap>
              <DatePicker
                value={moment(dateStr)}
                onChange={v => setDateStr(v?.format('YYYY-MM-DD') || moment().format('YYYY-MM-DD'))}
                format="DD MMM YYYY"
                size="large"
                style={{
                  background: 'white',
                  borderRadius: 8
                }}
              />
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={generate}
                loading={loading}
                style={{
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  fontWeight: 600
                }}
              >
                Generate
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      {data.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={12} md={6}>
            <Card className="stat-card gradient-primary" style={{ borderRadius: 12 }}>
              <Statistic
                title={<span style={{ color: 'white', fontSize: 13 }}>Total Shows</span>}
                value={summary.totalShows}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: 'white', fontSize: isMobile ? 24 : 28 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="stat-card gradient-success" style={{ borderRadius: 12 }}>
              <Statistic
                title={<span style={{ color: 'white', fontSize: 13 }}>Total Bills</span>}
                value={summary.totalBills}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: 'white', fontSize: isMobile ? 24 : 28 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="stat-card gradient-warning" style={{ borderRadius: 12 }}>
              <Statistic
                title={<span style={{ color: 'white', fontSize: 13 }}>Total Collection</span>}
                value={summary.totalSales}
                prefix="₹"
                precision={2}
                valueStyle={{ color: 'white', fontSize: isMobile ? 24 : 28 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="stat-card gradient-danger" style={{ borderRadius: 12 }}>
              <Statistic
                title={<span style={{ color: 'white', fontSize: 13 }}>Top Show</span>}
                value={summary.topShow?.slotName || 'N/A'}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: 'white', fontSize: isMobile ? 16 : 20 }}
              />
              {summary.topShow && (
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4 }}>
                  ₹{summary.topShow.totalSales?.toFixed(2)}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Show Time Slots Configuration */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Configure Show Timings</span>
          </Space>
        }
        extra={
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addSlot}
            size={isMobile ? 'middle' : 'large'}
          >
            Add Show
          </Button>
        }
        style={{ marginBottom: 24, borderRadius: 12 }}
      >
        <Row gutter={[16, 16]}>
          {slots.map((s, idx) => (
            <Col xs={24} sm={12} md={8} lg={6} key={idx}>
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  border: `2px solid ${s.color}`,
                  background: `${s.color}10`
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Input
                    value={s.name}
                    onChange={e => updateSlot(idx, { name: e.target.value })}
                    placeholder="Show Name"
                    size="large"
                    style={{ fontWeight: 600 }}
                  />
                  <Row gutter={8}>
                    <Col span={12}>
                      <Input
                        placeholder="Start (HH:mm)"
                        value={s.start}
                        onChange={e => updateSlot(idx, { start: e.target.value })}
                        size="large"
                      />
                    </Col>
                    <Col span={12}>
                      <Input
                        placeholder="End (HH:mm)"
                        value={s.end}
                        onChange={e => updateSlot(idx, { end: e.target.value })}
                        size="large"
                      />
                    </Col>
                  </Row>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeSlot(idx)}
                    block
                    disabled={slots.length <= 1}
                  >
                    Remove
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Report Table */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              Show-wise Collection Details ({data.length} shows)
            </span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        {data.length === 0 ? (
          <Empty
            description="No data available. Configure show timings and click Generate to view the report."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '40px 0' }}
          />
        ) : (
          <>
            <Table
              dataSource={data}
              columns={columns}
              rowKey={(r) => r.slotName + r.start + r.end}
              pagination={false}
              size="middle"
              scroll={{ x: 800 }}
              bordered
              summary={(pageData) => {
                const totalBills = pageData.reduce((sum, r) => sum + (r.totalBills || 0), 0);
                const totalCash = pageData.reduce((sum, r) => sum + (r.cash || 0), 0);
                const totalUPI = pageData.reduce((sum, r) => sum + (r.upi || 0), 0);
                const totalCard = pageData.reduce((sum, r) => sum + (r.card || 0), 0);
                const totalMixed = pageData.reduce((sum, r) => sum + (r.mixed || 0), 0);
                const grandTotal = pageData.reduce((sum, r) => sum + (r.totalSales || 0), 0);

                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
                      <Table.Summary.Cell index={0}>
                        <Text strong style={{ fontSize: 15 }}>GRAND TOTAL</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="center">
                        <Tag color="blue" style={{ fontSize: 13 }}>{totalBills}</Tag>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                          ₹{totalCash.toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
                          ₹{totalUPI.toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <Text strong style={{ color: '#722ed1', fontSize: 14 }}>
                          ₹{totalCard.toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <Text strong style={{ color: '#faad14', fontSize: 14 }}>
                          ₹{totalMixed.toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
                        <Text strong style={{ fontSize: 16, color: '#000' }}>
                          ₹{grandTotal.toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />

            <Divider />

            <div style={{ textAlign: 'center', color: '#999' }}>
              <Text type="secondary">
                Report generated for {moment(dateStr).format('DD MMMM YYYY')}
              </Text>
            </div>
          </>
        )}
      </Card>
    </Layout>
  );
};

export default ShowWiseCollection;
