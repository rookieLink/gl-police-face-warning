import { useState, useEffect, useRef } from 'react';
import { Card, Spin, message, Form, Input, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, IdcardOutlined, CameraOutlined } from '@ant-design/icons';
import { fetchAllUsers } from '../services/user';
import type { ListParams, SearchResult } from '../services/user';

declare global {
  interface Window {
    BMap: typeof BMap;
  }
}

export default function WarningMap() {
  const [form] = Form.useForm();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResult[]>([]);

  const fetchData = async (params: ListParams = {}) => {
    setLoading(true);
    try {
      const res = await fetchAllUsers(params);
      setData(res.list || []);
    } catch {
      message.error('获取预警数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAllUsers({});
        if (!abortController.signal.aborted) {
          setData(res.list || []);
        }
      } catch {
        if (!abortController.signal.aborted) {
          message.error('获取预警数据失败');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.BMap || data.length === 0) return;

    const map = new window.BMap.Map(mapRef.current);
    map.centerAndZoom(new window.BMap.Point(118.778, 32.058), 12);
    map.enableScrollWheelZoom(true);
    map.addControl(new window.BMap.NavigationControl());
    map.addControl(new window.BMap.ScaleControl());

    const points: BMap.Point[] = [];

    data.forEach((item) => {
      if (!item.lat || !item.lng) return;

      const point = new window.BMap.Point(item.lng, item.lat);
      points.push(point);

      const marker = new window.BMap.Marker(point);
      map.addOverlay(marker);

      const color = item.xsd >= 90 ? '#52c41a' : item.xsd >= 80 ? '#faad14' : '#ff4d4f';

      const infoContent = `
        <div style="padding: 10px; min-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${item.sfz}</div>
          <div style="margin-bottom: 4px;"><strong>预警时间：</strong>${item.yjsj}</div>
          <div style="margin-bottom: 4px;"><strong>预警点位：</strong>${item.yjdw}</div>
          <div style="margin-bottom: 4px;"><strong>相似度：</strong><span style="color: ${color}; font-weight: bold;">${item.xsd}%</span></div>
          ${item.xt ? `<img src="${item.xt}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 4px; margin-top: 8px;" />` : ''}
        </div>
      `;
      const infoWindow = new window.BMap.InfoWindow(infoContent, { width: 250, height: 200 });

      marker.addEventListener('click', () => {
        map.openInfoWindow(infoWindow, point);
      });
    });

    if (points.length > 0) {
      const viewPort = map.getViewport(points);
      map.centerAndZoom(viewPort.center, viewPort.zoom);
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { clearOverlays: () => void }).clearOverlays();
      }
    };
  }, [data]);

  const handleSearch = (values?: ListParams) => {
    const formValues = values || form.getFieldsValue();
    fetchData(formValues);
  };

  const handleReset = () => {
    form.resetFields();
    fetchData({});
  };

  return (
    <>
      <h2>预警地图</h2>

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

      <Card>
        <Spin spinning={loading}>
          <div ref={mapRef} style={{ width: '100%', height: 'calc(100vh - 360px)', minHeight: 500 }} />
        </Spin>
      </Card>
    </>
  );
}
