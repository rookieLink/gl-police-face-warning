import { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Modal, Descriptions, Tag, message, Card, Alert, Avatar } from 'antd';
import {
  EnvironmentOutlined,
  SendOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Gauge } from '@ant-design/charts';

declare global {
  interface Window {
    BMap: typeof BMap;
  }
}

interface UserData {
  key: string;
  name: string;
  age: number;
  address: string;
  phone: string;
  status: 'normal' | 'warning' | 'danger';
  avatar: string;
  similarity: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastSeen: string;
}

const userData: UserData[] = [
  {
    key: '1',
    name: '张三',
    age: 32,
    address: '北京市朝阳区',
    phone: '138****8888',
    status: 'normal',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
    similarity: 95.8,
    location: { lat: 39.9042, lng: 116.4074, address: '北京市朝阳区建国门外大街1号' },
    lastSeen: '2024-01-15 14:30:00',
  },
  {
    key: '2',
    name: '李四',
    age: 42,
    address: '上海市浦东新区',
    phone: '139****9999',
    status: 'warning',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiSi',
    similarity: 87.3,
    location: { lat: 31.2304, lng: 121.4737, address: '上海市浦东新区陆家嘴环路1000号' },
    lastSeen: '2024-01-15 13:45:00',
  },
  {
    key: '3',
    name: '王五',
    age: 28,
    address: '广州市天河区',
    phone: '137****7777',
    status: 'danger',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangWu',
    similarity: 72.1,
    location: { lat: 23.1291, lng: 113.2644, address: '广州市天河区天河路385号' },
    lastSeen: '2024-01-15 12:20:00',
  },
];

const statusMap = {
  normal: { color: 'green', text: '正常' },
  warning: { color: 'orange', text: '预警' },
  danger: { color: 'red', text: '危险' },
};

interface BaiduMapProps {
  lat: number;
  lng: number;
  address: string;
  status: 'normal' | 'warning' | 'danger';
}

function BaiduMap({ lat, lng, address, status }: BaiduMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || !window.BMap) return;

    const map = new window.BMap.Map(mapRef.current);
    const point = new window.BMap.Point(lng, lat);

    map.centerAndZoom(point, 15);
    map.enableScrollWheelZoom(true);
    map.addControl(new window.BMap.NavigationControl());
    map.addControl(new window.BMap.ScaleControl());

    const marker = new window.BMap.Marker(point);
    map.addOverlay(marker);

    const opts = {
      width: 250,
      height: 100,
      title: '位置信息',
    };
    const infoWindow = new window.BMap.InfoWindow(
      `<div style="padding: 10px;">
        <p><strong>地址：</strong>${address}</p>
        <p><strong>坐标：</strong>${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
        <p><strong>状态：</strong><span style="color: ${
          status === 'danger' ? '#ff4d4f' : status === 'warning' ? '#faad14' : '#52c41a'
        }">${statusMap[status].text}</span></p>
      </div>`,
      opts
    );

    marker.addEventListener('click', () => {
      map.openInfoWindow(infoWindow, point);
    });

    map.openInfoWindow(infoWindow, point);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { destroy?: () => void }).destroy?.();
      }
    };
  }, [lat, lng, address, status]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export default function User() {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [pushLoading, setPushLoading] = useState(false);

  const handleViewDetail = (record: UserData) => {
    setCurrentUser(record);
    setDetailVisible(true);
  };

  const handlePushWarning = async () => {
    if (!currentUser) return;
    setPushLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success(`已向 ${currentUser.name} 推送预警信息`);
    } catch {
      message.error('推送失败');
    } finally {
      setPushLoading(false);
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusMap) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '最后出现',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: UserData) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            <EnvironmentOutlined /> 查看位置
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2>用户管理</h2>
      <Table columns={columns} dataSource={userData} pagination={{ pageSize: 10 }} />

      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>人员详情 - {currentUser?.name}</span>
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button
            key="push"
            type="primary"
            danger
            icon={<SendOutlined />}
            loading={pushLoading}
            onClick={handlePushWarning}
          >
            预警推送
          </Button>,
        ]}
      >
        {currentUser && (
          <div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={100}
                  src={currentUser.avatar}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div style={{ marginTop: 8, fontWeight: 'bold', fontSize: 16 }}>{currentUser.name}</div>
              </div>
              <div style={{ flex: 1 }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label={<><UserOutlined /> 姓名</>}>{currentUser.name}</Descriptions.Item>
                  <Descriptions.Item label="年龄">{currentUser.age}岁</Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined /> 电话</>}>{currentUser.phone}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={statusMap[currentUser.status].color}>
                      {statusMap[currentUser.status].text}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<><ClockCircleOutlined /> 最后出现</>} span={2}>
                    {currentUser.lastSeen}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><EnvironmentOutlined /> 详细地址</>} span={2}>
                    {currentUser.location.address}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>

            <Card
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 120, height: 80 }}>
                  <Gauge
                    percent={98}
                    data = { {
                      target: 120,
                      total: 400,
                      name: 'score',
                    }}
                    // startAngle={Math.PI}
                    // endAngle={0}
                    // innerRadius={0.75}
                    // range={{
                    //   color: currentUser.similarity >= 90 ? ['#52c41a', '#52c41a'] :
                    //          currentUser.similarity >= 80 ? ['#1890ff', '#1890ff'] : ['#ff4d4f', '#ff4d4f'],
                    // }}
                    // indicator={{
                    //   length: '75%',
                    //   style: { stroke: '#ccc', lineWidth: 2 },
                    // }}
                    // axis={{
                    //   tickCount: 5,
                    //   tickLength: -8,
                    //   style: { stroke: '#ccc' },
                    //   subTickLine: { length: -4, style: { stroke: '#ccc' } },
                    // }}
                    // statistic={{
                    //   title: { style: { fontSize: '10px', color: '#666' }, content: '相似度' },
                    //   content: {
                    //     style: { fontSize: '16px', fontWeight: 'bold', color: currentUser.similarity >= 90 ? '#52c41a' : currentUser.similarity >= 80 ? '#1890ff' : '#ff4d4f' },
                    //     content: `${currentUser.similarity}%`,
                    //   },
                    // }}
                    // style={{ width: 120, height: 80 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Tag color={currentUser.similarity >= 90 ? 'success' : currentUser.similarity >= 80 ? 'processing' : 'error'}>
                    {currentUser.similarity >= 90 ? '高度匹配' : currentUser.similarity >= 80 ? '中度匹配' : '低度匹配'}
                  </Tag>
                </div>
              </div>
            </Card>

            <Card
              title={
                <Space>
                  <EnvironmentOutlined />
                  <span>实时位置</span>
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ width: '100%', height: 350, borderRadius: 8, overflow: 'hidden' }}>
                <BaiduMap
                  lat={currentUser.location.lat}
                  lng={currentUser.location.lng}
                  address={currentUser.location.address}
                  status={currentUser.status}
                />
              </div>
              <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                坐标：{currentUser.location.lat.toFixed(4)}, {currentUser.location.lng.toFixed(4)}
              </div>
            </Card>

            {currentUser.status === 'danger' && (
              <Alert
                message="危险警告"
                description="该人员处于危险状态，请立即采取行动！"
                type="error"
                showIcon
                icon={<ExclamationCircleOutlined />}
                style={{ marginBottom: 16 }}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
