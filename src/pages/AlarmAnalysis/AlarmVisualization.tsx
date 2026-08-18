import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Spin, Button, Empty, Tag, Tabs, Radio, message } from 'antd';
import { ArrowLeftOutlined, LineChartOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Pie, Line } from '@ant-design/charts';
import { getVisualizationData, getHeatMapData, type PieDataItem, type LineDataItem, type DataItem } from '../../services/file';

type ActiveTab = 'chart' | 'map';

const tabConfig = {
  chart: { label: '图表分析', icon: <LineChartOutlined /> },
  map: { label: '警情分布', icon: <EnvironmentOutlined /> },
};

const timeRangeOptions = [
  { value: 0, label: '全部' },
  { value: 1, label: '0-7点' },
  { value: 2, label: '7-12点' },
  { value: 3, label: '12-18点' },
  { value: 4, label: '18-24点' },
];

export default function AlarmVisualization() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filename = searchParams.get('filename') || '';

  const [activeTab, setActiveTab] = useState<ActiveTab>('chart');
  const [loading, setLoading] = useState(false);
  const [areaPieData, setAreaPieData] = useState<PieDataItem[]>([]);
  const [timePieData, setTimePieData] = useState<PieDataItem[]>([]);
  const [dayLineData, setDayLineData] = useState<LineDataItem[]>([]);

  // 热力图相关状态
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [mapData, setMapData] = useState<DataItem[]>([]);
  const [timeRange, setTimeRange] = useState<number>(0);

  // 获取图表数据
  useEffect(() => {
    const fetchData = async () => {
      if (!filename || activeTab !== 'chart') return;
      setLoading(true);
      try {
        const res = await getVisualizationData(filename, 1);
        setAreaPieData(res.areaPieData);
        setTimePieData(res.timePieData);
        setDayLineData(res.dayLineData);
      } catch {
        // 错误已在拦截器处理
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filename, activeTab]);

  // 获取热力图数据
  useEffect(() => {
    const fetchMapData = async () => {
      if (!filename || activeTab !== 'map') return;
      setLoading(true);
      try {
        const res = await getHeatMapData({ filename, timeRange, forUse: 1 });
        setMapData(res.list || []);
      } catch {
        message.error('获取热力图数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, [filename, activeTab, timeRange]);

  // 初始化地图
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.GeoGlobe || !window.mapboxgl) return;
    if (mapData.length === 0) return;

    const mapId = `alarm-heatmap-${Date.now()}`;
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

      const validData = mapData.filter(item => item.x && item.y);
      if (validData.length === 0) return;

      const coords = validData.map(item => [String(item.x), String(item.y)]);
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
    });

    mapInstanceRef.current = map;

    return () => {
      // cleanup
    };
  }, [mapData]);

  useEffect(() => {
    if (activeTab === 'map' && mapData.length > 0) {
      const timer = setTimeout(() => {
        initMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, mapData, initMap]);

  const areaPieConfig = {
    data: areaPieData,
    angleField: 'num',
    colorField: 'name',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      text: (d: PieDataItem) => `${d.name}\n${d.num}`,
      position: 'outside',
    },
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      title: 'name',
      items: [
        (d: PieDataItem) => ({
          name: '数量',
          value: d.num,
        }),
      ],
    },
    interactions: [
      { type: 'element-active' },
    ],
  };

  const timePieConfig = {
    data: timePieData,
    angleField: 'num',
    colorField: 'name',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      text: (d: PieDataItem) => `${d.name}\n${d.num}`,
      position: 'outside',
    },
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      title: 'name',
      items: [
        (d: PieDataItem) => ({
          name: '数量',
          value: d.num,
        }),
      ],
    },
    interactions: [
      { type: 'element-active' },
    ],
  };

  const dayLineConfig = {
    data: dayLineData,
    xField: 'date',
    yField: 'num',
    height: 350,
    color: '#1890ff',
    shape: 'smooth',
    style: {
      lineWidth: 3,
    },
    point: false,
    scale: {
      x: {
        tickCount: 7,
      },
    },
    axis: {
      x: {
        title: false,
        labelAutoRotate: false,
        style: {
          labelFontSize: 12,
          labelFill: '#666',
        },
      },
      y: {
        style: {
          labelFontSize: 12,
          labelFill: '#666',
        },
      },
    },
    tooltip: {
      items: [
        (d: LineDataItem) => ({
          name: '数量',
          value: d.num,
        }),
      ],
    },
  };

  if (!filename) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/alarm-analysis/data')}
          >
            返回
          </Button>
        </Space>
        <Empty description="请从警情数据列表选择文件进行分析" />
      </div>
    );
  }

  const renderChartTab = () => (
    <Spin spinning={loading && activeTab === 'chart'}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="辖区警情数量" bordered={false}>
            {areaPieData.length > 0 ? (
              <div style={{ height: 400 }}>
                <Pie {...areaPieConfig} />
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="时间段警情数量" bordered={false}>
            {timePieData.length > 0 ? (
              <div style={{ height: 400 }}>
                <Pie {...timePieConfig} />
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="日期警情数量趋势" bordered={false}>
            {dayLineData.length > 0 ? (
              <div style={{ height: 400 }}>
                <Line {...dayLineConfig} />
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
      </Row>
    </Spin>
  );

  const renderMapTab = () => (
    <Spin spinning={loading && activeTab === 'map'}>
      <Card
        title={
          <span>
            {/* <EnvironmentOutlined style={{ marginRight: 8 }} /> */}
            警情热力图
          </span>
        }
        bordered={false}
        extra={
          <Radio.Group
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            {timeRangeOptions.map((option) => (
              <Radio.Button key={option.value} value={option.value}>
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        }
      >
        {mapData.length > 0 ? (
          <div ref={mapRef} style={{ height: 600, width: '100%' }} />
        ) : (
          <Empty description="暂无热力图数据" style={{ padding: '100px 0' }} />
        )}
      </Card>
      {mapData.length > 0 && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Tag color="blue">数据来源：警情分析</Tag>
          <Tag color="green">共 {mapData.length} 条警情数据</Tag>
        </div>
      )}
    </Spin>
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/alarm-analysis/data')}
        >
          返回
        </Button>
        <h2 style={{ margin: 0 }}>警情可视化分析</h2>
        {filename && <Tag color="blue">{filename}</Tag>}
      </div>

      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ActiveTab)}
          items={Object.entries(tabConfig).map(([key, config]) => ({
            key,
            label: (
              <span>
                {config.icon} {config.label}
              </span>
            ),
          }))}
        />
        {activeTab === 'chart' && renderChartTab()}
        {activeTab === 'map' && renderMapTab()}
      </Card>
    </div>
  );
}
