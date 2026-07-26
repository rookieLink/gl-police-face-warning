import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Spin, message, Radio, Statistic, Row, Col, Tag } from 'antd';
import {
  FireOutlined,
  RiseOutlined,
  EnvironmentOutlined,
  AlertOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { fetchAllUsers } from '../services/user';
import type { SearchResult } from '../services/user';
import './HeatMap.scss';

declare global {
  interface Window {
    BMap: typeof BMap;
    BMapLib: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      HeatmapOverlay: new (options: { radius: number; opacity: number }) => any;
    };
  }
}

type TimeRange = 'day' | 'week' | 'month';

const timeRangeConfig = {
  day: { label: '今日', icon: <ClockCircleOutlined /> },
  week: { label: '本周', icon: <RiseOutlined /> },
  month: { label: '本月', icon: <FireOutlined /> },
};

const formatTime = (yjsj: string): Date => {
  if (!yjsj) return new Date();
  return new Date(yjsj.replace(/-/g, '/'));
};

const filterByTimeRange = (data: SearchResult[], range: TimeRange): SearchResult[] => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return data.filter(item => {
    const itemDate = formatTime(item.yjsj);
    return itemDate >= start && itemDate <= now;
  });
};

export default function HeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const heatmapOverlayRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<SearchResult[]>([]);
  const [filteredData, setFilteredData] = useState<SearchResult[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('day');

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAllUsers({});
        if (!abortController.signal.aborted) {
          setAllData(res.list || []);
        }
      } catch {
        if (!abortController.signal.aborted) {
          message.error('获取数据失败');
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
    const filtered = filterByTimeRange(allData, timeRange);
    setFilteredData(filtered);
  }, [allData, timeRange]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.BMap) return;

    const map = new window.BMap.Map(mapRef.current);
    map.centerAndZoom(new window.BMap.Point(118.778, 32.058), 12);
    map.enableScrollWheelZoom(true);
    map.addControl(new window.BMap.NavigationControl());
    map.addControl(new window.BMap.ScaleControl());

    const points = filteredData
      .filter(item => item.lat && item.lng)
      .map(item => ({
        lng: item.lng,
        lat: item.lat,
        count: item.xsd,
      }));

    try {
      const heatmapOverlay = new window.BMapLib.HeatmapOverlay({
        radius: 30,
        opacity: 0.6,
      });
      map.addOverlay(heatmapOverlay);
      heatmapOverlay.setDataSet({
        max: 100,
        data: points,
      });
      heatmapOverlayRef.current = heatmapOverlay;
    } catch {
      // Heatmap library not loaded, fallback to markers
      filteredData.forEach(item => {
        if (!item.lat || !item.lng) return;

        const point = new window.BMap.Point(item.lng, item.lat);
        const marker = new window.BMap.Marker(point);
        map.addOverlay(marker);

        const color = item.xsd >= 90 ? '#52c41a' : item.xsd >= 80 ? '#faad14' : '#ff4d4f';
        const infoContent = `
          <div style="padding: 10px; min-width: 180px;">
            <div style="font-weight: bold; margin-bottom: 6px;">${item.sfz}</div>
            <div><strong>时间：</strong>${item.yjsj}</div>
            <div><strong>点位：</strong>${item.yjdw}</div>
            <div><strong>相似度：</strong><span style="color: ${color}; font-weight: bold;">${item.xsd}%</span></div>
          </div>
        `;
        const infoWindow = new window.BMap.InfoWindow(infoContent, { width: 220 });
        marker.addEventListener('click', () => {
          map.openInfoWindow(infoWindow, point);
        });
      });
    }

    if (points.length > 0) {
      const viewPort = map.getViewport(points.map(p => new window.BMap.Point(p.lng, p.lat)));
      map.centerAndZoom(viewPort.center, viewPort.zoom);
    }

    mapInstanceRef.current = map;

    return () => {
      map.clearOverlays();
    };
  }, [filteredData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initMap();
    }, 100);
    return () => clearTimeout(timer);
  }, [initMap]);

  const stats = {
    total: filteredData.length,
    highMatch: filteredData.filter(d => d.xsd >= 90).length,
    locations: new Set(filteredData.map(d => d.yjdw)).size,
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <FireOutlined className="title-icon" />
          <span>预警热力图</span>
        </div>
        <div className="heatmap-controls">
          <Radio.Group
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            {Object.entries(timeRangeConfig).map(([key, config]) => (
              <Radio.Button key={key} value={key} className="time-radio-btn">
                {config.icon} {config.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </div>

      <Row gutter={16} className="heatmap-stats">
        <Col span={8}>
          <Card className="stat-card stat-total" bordered={false}>
            <Statistic
              title="预警总数"
              value={stats.total}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card stat-high" bordered={false}>
            <Statistic
              title="高度匹配"
              value={stats.highMatch}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card stat-location" bordered={false}>
            <Statistic
              title="预警点位"
              value={stats.locations}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="heatmap-map-card" bordered={false}>
        <Spin spinning={loading}>
          <div ref={mapRef} className="heatmap-map" />
          {filteredData.length === 0 && !loading && (
            <div className="heatmap-empty">
              <FireOutlined className="empty-icon" />
              <p>当前时间段暂无预警数据</p>
            </div>
          )}
        </Spin>
        <div className="heatmap-legend">
          <span className="legend-title">预警密度：</span>
          <span className="legend-item low">低</span>
          <span className="legend-item medium">中</span>
          <span className="legend-item high">高</span>
        </div>
      </Card>

      <div className="heatmap-footer">
        <Tag color="blue">数据来源：鼓楼分局巡防系统</Tag>
        <Tag color="green">实时更新</Tag>
      </div>
    </div>
  );
}
