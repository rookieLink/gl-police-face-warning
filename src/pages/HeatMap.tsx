import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Spin, message, Tag, Tabs } from 'antd';
import {
  FireOutlined,
  DotChartOutlined,
  HeatMapOutlined,
} from '@ant-design/icons';
import { fetchHeatMapData } from '../services/user';
import type { SearchResult } from '../services/user';
import './HeatMap.scss';

type MapMode = 'heatmap' | 'dot';

const mapModeConfig = {
  heatmap: { label: '热力图', icon: <HeatMapOutlined /> },
  dot: { label: '点阵图', icon: <DotChartOutlined /> },
};

export default function HeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResult[]>([]);
  const [mapMode, setMapMode] = useState<MapMode>('heatmap');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchHeatMapData({ timeRange: 'day', deduplicate: false });
      setData(res.list || []);
    } catch {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        // 按坐标分组，同一坐标只渲染一次
        const groupedData = new Map<string, SearchResult[]>();
        validData.forEach(item => {
          const key = `${item.lng.toFixed(4)},${item.lat.toFixed(4)}`;
          if (!groupedData.has(key)) {
            groupedData.set(key, []);
          }
          groupedData.get(key)!.push(item);
        });

        groupedData.forEach((items, key) => {
          const [lng, lat] = key.split(',').map(Number);

          const count = items.length;
          const sfzList = items.map(i => i.sfz).join('、');
          const yjdw = items[0].yjdw;

          const popupContent = `
            <div style="padding: 10px; min-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${yjdw}</div>
              <div style="margin-bottom: 4px;"><strong>拍到人数：</strong><span style="color: #1890ff; font-weight: bold; font-size: 16px;">${count}</span> 人</div>
              <div style="margin-bottom: 4px;"><strong>身份证号：</strong></div>
              <div style="max-height: 100px; overflow-y: auto; font-size: 12px; color: #666;">${sfzList}</div>
            </div>
          `;

          const popup = new (window.mapboxgl as unknown as { Popup: new (options: { offset: number }) => { setHTML: (html: string) => unknown } }).Popup({ offset: 25 })
            .setHTML(popupContent);

          new (window.mapboxgl as unknown as {
            Marker: new () => {
              setLngLat: (lnglat: number[]) => {
                setPopup: (popup: unknown) => {
                  addTo: (map: unknown) => void;
                };
              };
            };
          }).Marker({
            color: 'red'
          }).setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });

        // // 使用 layergl 渲染点
        // const pointData = Array.from(groupedData.entries()).map(([key, items]) => {
        //   const [lng, lat] = key.split(',').map(Number);
        //   return {
        //     geometry: {
        //       type: 'Point',
        //       coordinates: [lng, lat],
        //     },
        //     properties: {
        //       count: items.length,
        //     },
        //   };
        // });

        // const view = new window.layergl.View({
        //   map: window.layergl.map.getMapBoxGLMap(map),
        // });

        // const pointLayer = new window.layergl.PointLayer({
        //   blend: 'lighter',
        //   size: 12,
        //   color: 'rgba(255, 77, 79, 0.9)',
        //   shape: 'circle',
        //   repeat: false,
        //   enablePicked: true,
        //   autoSelect: true,
        //   onClick: () => {},
        //   onMousemove: () => {},
        // });

        // view.addLayer(pointLayer);
        // pointLayer.setData(pointData);
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
          <span>当日预警分布分析</span>
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
        <Tag color="green">今日数据 | {mapModeConfig[mapMode].label}</Tag>
      </div>
    </div>
  );
}
