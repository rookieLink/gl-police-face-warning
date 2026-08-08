import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Button, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Pie, Line } from '@ant-design/charts';
import { getVisualizationData, type PieDataItem, type LineDataItem } from '../services/file';

export default function Visualization() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filename = searchParams.get('filename') || '';

  const [loading, setLoading] = useState(false);
  const [areaPieData, setAreaPieData] = useState<PieDataItem[]>([]);
  const [timePieData, setTimePieData] = useState<PieDataItem[]>([]);
  const [dayLineData, setDayLineData] = useState<LineDataItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!filename) return;
      setLoading(true);
      try {
        const res = await getVisualizationData(filename);
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
  }, [filename]);

  const areaPieConfig = {
    data: areaPieData,
    angleField: 'num',
    colorField: 'name',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      text: 'name',
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
            onClick={() => navigate('/data-analysis/list')}
          >
            返回
          </Button>
        </Space>
        <Empty description="请从文件列表选择文件进行分析" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/data-analysis/list')}
        >
          返回
        </Button>
        <h2 style={{ margin: 0 }}>可视化分析</h2>
      </div>

      <Spin spinning={loading}>
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
    </div>
  );
}
