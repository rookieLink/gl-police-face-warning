import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Spin, message, Radio, Tag, Switch, Space, Tabs } from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DotChartOutlined,
  HeatMapOutlined,
} from '@ant-design/icons';
import { fetchHeatMapData } from '../services/user';
import type { SearchResult } from '../services/user';
import './HeatMap.scss';

type TimeRange = 'day' | '7days' | 'month';
type MapMode = 'heatmap' | 'dot';

const timeRangeConfig = {
  day: { label: '今日', icon: <ClockCircleOutlined /> },
  '7days': { label: '近7日', icon: <FireOutlined /> },
  month: { label: '近一个月', icon: <UserOutlined /> },
};

const mapModeConfig = {
  heatmap: { label: '热力图', icon: <HeatMapOutlined /> },
  dot: { label: '点阵图', icon: <DotChartOutlined /> },
};

export default function HeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResult[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [deduplicate, setDeduplicate] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>('heatmap');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchHeatMapData({ timeRange, deduplicate });
      setData(res.list || []);
    } catch {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange, deduplicate]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.GeoGlobe || !window.mapboxgl || !window.layergl) return;

    const mapId = `heatmap-${Date.now()}`;
    mapRef.current.id = mapId;

    const geoGlobe = window.GeoGlobe as unknown as {
      Map: new (options: Record<string, unknown>) => {
        on: (event: string, callback: () => void) => void;
        addLayer: (layer: unknown) => void;
        addSource: (id: string, source: unknown) => void;
      };
      Format: {
        WMTS: new () => {
          createLayer: (url: string) => { source: { noFadingParent: boolean } };
        };
        GeoJSONUtil: new () => {
          points: (coords: string[][]) => unknown;
        };
      };
    };

    const map = new geoGlobe.Map({
      container: mapId,
      mapCRS: '4490',
      zoom: 13,
      center: [118.778, 32.058],
      maxZoom: 20,
      minZoom: 8,
      showLogo: false,
    });

    map.on('load', () => {
      const wmts = new geoGlobe.Format.WMTS();
      const jydtLayer = wmts.createLayer('http://pgis-dt.nkg.js:83/geostar/NJ_GA_DT/wmts');
      const jyzjLayer = wmts.createLayer('http://pgis-dt.nkg.js:83/geostar/NJ_GA_ZJ/wmts');

      jydtLayer.source.noFadingParent = true;
      jyzjLayer.source.noFadingParent = true;

      map.addLayer(jydtLayer);
      map.addLayer(jyzjLayer);

      const validData = data.filter(item => item.lat && item.lng);

      if (validData.length === 0) return;

      const coords = validData.map(item => [String(item.lng), String(item.lat)]);

      if (mapMode === 'heatmap') {
        const GeoJSONUtil = new geoGlobe.Format.GeoJSONUtil();
        const pointGeoJSON = GeoJSONUtil.points(coords);

        map.addSource('heat-source', pointGeoJSON);
        map.addLayer({
          id: 'heat-layer',
          type: 'heatmap',
          source: 'heat-source',
          paint: {
            'heatmap-weight': 1,
            'heatmap-radius': 20,
          },
        });
      } else {
        validData.forEach(item => {
          new window.mapboxgl.Marker()
            .setLngLat([item.lng, item.lat])
            .addTo(map);
        });

        const pointData = validData.map(item => ({
          geometry: {
            type: 'Point',
            coordinates: [item.lng, item.lat],
          },
          properties: {
            id: item.id,
            sfz: item.sfz,
          },
        }));

        const view = new window.layergl.View({
          map: window.layergl.map.getMapBoxGLMap(map),
        });

        const pointLayer = new window.layergl.PointLayer({
          blend: 'lighter',
          size: 12,
          color: 'rgba(255, 77, 79, 0.9)',
          shape: 'circle',
          repeat: false,
          enablePicked: true,
          autoSelect: true,
          onClick: (evt) => {
            console.log('点位点击:', evt);
          },
          onMousemove: () => {},
        });

        view.addLayer(pointLayer);
        pointLayer.setData(pointData);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      // cleanup
    };
  }, [data, mapMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initMap();
    }, 100);
    return () => clearTimeout(timer);
  }, [initMap]);

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <FireOutlined className="title-icon" />
          <span>预警热力图</span>
        </div>
        <div className="heatmap-controls">
          <Space size="middle">
            <div className="control-item">
              <span className="control-label">去重：</span>
              <Switch
                checked={deduplicate}
                onChange={setDeduplicate}
                checkedChildren="是"
                unCheckedChildren="否"
              />
            </div>
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
          </Space>
        </div>
      </div>

      <Card className="heatmap-map-card" bordered={false}>
        <div className="map-mode-tabs">
          <Tabs
            activeKey={mapMode}
            onChange={(key) => setMapMode(key as MapMode)}
            items={Object.entries(mapModeConfig).map(([key, config]) => ({
              key,
              label: (
                <span>
                  {config.icon} {config.label}
                </span>
              ),
            }))}
          />
        </div>
        <Spin spinning={loading}>
          <div ref={mapRef} className="heatmap-map" />
          {data.length === 0 && !loading && (
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
        <Tag color="green">{deduplicate ? '已去重' : '未去重'} | {timeRangeConfig[timeRange].label} | {mapModeConfig[mapMode].label}</Tag>
      </div>
    </div>
  );
}
