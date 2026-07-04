import { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Modal, Descriptions, message, Card, Form, Input, Row, Col, Image, Progress } from 'antd';
import {
  EnvironmentOutlined,
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  IdcardOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { searchUsers } from '../services/user';
import type { SearchParams, SearchResult } from '../services/user';

declare global {
  interface Window {
    BMap: typeof BMap;
  }
}

interface BaiduMapProps {
  lat: number;
  lng: number;
}

function BaiduMap({ lat, lng }: BaiduMapProps) {
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
      width: 200,
      height: 80,
      title: '预警位置',
    };
    const infoWindow = new window.BMap.InfoWindow(
      `<div style="padding: 10px;">
        <p><strong>坐标：</strong>${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
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
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export default function User() {
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<SearchResult | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [dataSource, setDataSource] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const fetchUsers = async (params: SearchParams = {}) => {
    setLoading(true);
    try {
      const data = await searchUsers(params);
      setDataSource(data.list.map((item) => ({ ...item, key: item.id })));
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch {
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await searchUsers({});
        if (!abortController.signal.aborted) {
          setDataSource(data.list.map((item) => ({ ...item, key: item.id })));
          setPagination(prev => ({ ...prev, total: data.total }));
        }
      } catch {
        if (!abortController.signal.aborted) {
          setDataSource([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => abortController.abort();
  }, []);

  const handleSearch = (values?: SearchParams) => {
    const formValues = values || form.getFieldsValue();
    setSearchParams(formValues);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers(formValues);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({});
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers({});
  };

  const handleViewDetail = (record: SearchResult) => {
    setCurrentUser(record);
    setDetailVisible(true);
  };

  const handlePushWarning = async () => {
    if (!currentUser) return;
    setPushLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success(`已向身份证号 ${currentUser.sfz} 推送预警信息`);
    } catch {
      message.error('推送失败');
    } finally {
      setPushLoading(false);
    }
  };

  const handleTableChange = (pag: { current?: number; pageSize?: number }) => {
    const newPagination = { ...pagination, current: pag.current || 1, pageSize: pag.pageSize || 10 };
    setPagination(newPagination);
    fetchUsers({ ...searchParams, currentPage: newPagination.current, pageSize: newPagination.pageSize });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '身份证号', dataIndex: 'sfz', key: 'sfz', width: 180 },
    { title: '预警时间', dataIndex: 'yjsj', key: 'yjsj', width: 160 },
    { title: '预警点位', dataIndex: 'yjdw', key: 'yjdw', width: 150 },
    { title: '预警点位代码', dataIndex: 'yjdwdm', key: 'yjdwdm', width: 120 },
    {
      title: '小图',
      dataIndex: 'xt',
      key: 'xt',
      width: 80,
      render: (url: string) => url ? <Image src={url} width={50} height={50} style={{ objectFit: 'cover' }} preview={{ mask: '查看大图' }} /> : '-',
    },
    { title: '经度', dataIndex: 'lng', key: 'lng', width: 100, render: (v: number) => v?.toFixed(6) },
    { title: '纬度', dataIndex: 'lat', key: 'lat', width: 100, render: (v: number) => v?.toFixed(6) },
    {
      title: '相似度',
      dataIndex: 'xsd',
      key: 'xsd',
      width: 100,
      render: (v: number) => (
        <span style={{ color: v >= 90 ? '#52c41a' : v >= 80 ? '#1890ff' : '#ff4d4f', fontWeight: 'bold' }}>
          {v}%
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: SearchResult) => (
        <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
          <EnvironmentOutlined /> 详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <h2>预警查询</h2>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="horizontal" onFinish={handleSearch}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sfz" label="身份证号">
                <Input placeholder="请输入身份证号" allowClear prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="yjdw" label="预警点位">
                <Input placeholder="请输入预警点位" allowClear prefix={<CameraOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={loading}>
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: '暂无数据',
          filterConfirm: '确定',
          filterReset: '重置',
          filterTitle: '筛选',
          selectAll: '全选',
          selectInvert: '反选',
          sortTitle: '排序',
          triggerDesc: '点击降序',
          triggerAsc: '点击升序',
          cancelSort: '取消排序',
        }}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>预警详情</span>
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={900}
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
            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={currentUser.xt}
                  width={120}
                  height={150}
                  style={{ objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                  preview={{ src: currentUser.dt }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>点击图片查看大图</div>
              </div>
              <div style={{ flex: 1 }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="ID">{currentUser.id}</Descriptions.Item>
                  <Descriptions.Item label="身份证号">{currentUser.sfz}</Descriptions.Item>
                  <Descriptions.Item label="预警时间" span={2}>{currentUser.yjsj}</Descriptions.Item>
                  <Descriptions.Item label="预警点位">{currentUser.yjdw}</Descriptions.Item>
                  <Descriptions.Item label="预警点位代码">{currentUser.yjdwdm}</Descriptions.Item>
                  <Descriptions.Item label="经度">{currentUser.lng?.toFixed(6)}</Descriptions.Item>
                  <Descriptions.Item label="纬度">{currentUser.lat?.toFixed(6)}</Descriptions.Item>
                </Descriptions>
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 4, fontWeight: 'bold', fontSize: 13 }}>相似度</div>
                  <Progress
                    percent={currentUser.xsd}
                    strokeColor={
                      currentUser.xsd >= 90 ? '#52c41a' :
                      currentUser.xsd >= 80 ? '#1890ff' : '#ff4d4f'
                    }
                    size="small"
                  />
                </div>
              </div>
            </div>

            <Card
              title={
                <Space>
                  <EnvironmentOutlined />
                  <span>预警位置</span>
                </Space>
              }
              size="small"
            >
              <div style={{ width: '100%', height: 300, borderRadius: 8, overflow: 'hidden' }}>
                <BaiduMap
                  lat={currentUser.lat}
                  lng={currentUser.lng}
                />
              </div>
              <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                坐标：{currentUser.lat?.toFixed(6)}, {currentUser.lng?.toFixed(6)}
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </>
  );
}
