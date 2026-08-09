import { useState, useEffect } from 'react';
import { Card, Spin, message, Radio, Statistic, Row, Col, Tag } from 'antd';
import {
  LineChartOutlined,
  RiseOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { fetchAnalysisData } from '../../services/user';
import type { AnalysisDataItem } from '../../services/user';
import './Analysis.scss';

type GroupBy = 'day' | 'week' | 'month';

const groupByConfig = {
  day: { label: '按日', icon: <CalendarOutlined />, days: 30 },
  week: { label: '按周', icon: <LineChartOutlined />, weeks: 12 },
  month: { label: '按月', icon: <RiseOutlined />, months: 12 },
};

export default function Analysis() {
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [data, setData] = useState<AnalysisDataItem[]>([]);
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalAppearances: 0,
    maleCount: 0,
    femaleCount: 0,
    locationCount: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalysisData({ groupBy, deduplicate: false });
      setData(res.list || []);
      setStats({
        totalPersons: res.totalPersons || 0,
        totalAppearances: res.totalAppearances || 0,
        maleCount: res.maleCount || 0,
        femaleCount: res.femaleCount || 0,
        locationCount: res.locationCount || 0,
      });
    } catch {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupBy]);

  const chartData = data.map(item => ({
    date: item.date,
    count: item.count,
  }));

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    height: 350,
    color: '#1890ff',
    shape: 'smooth',
    style: {
      lineWidth: 3,
    },
    point: false,
    scale: {
      x: {
        tickCount: groupBy === 'day' ? 6 : groupBy === 'week' ? 4 : 6,
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
  };

  const getTitle = () => {
    switch (groupBy) {
      case 'day':
        return '近30天人员数量变化';
      case 'week':
        return '近12周人员数量变化';
      case 'month':
        return '近一年人员数量变化';
    }
  };

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <div className="analysis-title">
          <LineChartOutlined className="title-icon" />
          <span>数据分析</span>
        </div>
        <div className="analysis-controls">
          <Radio.Group
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            {Object.entries(groupByConfig).map(([key, config]) => (
              <Radio.Button key={key} value={key} className="group-radio-btn">
                {config.icon} {config.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </div>

      <Row gutter={16} className="analysis-stats">
        <Col span={6}>
          <Card className="stat-card stat-total" bordered={false}>
            <Statistic
              title="出现总人数"
              value={stats.totalPersons}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card stat-appearance" bordered={false}>
            <Statistic
              title="出现总人次数"
              value={stats.totalAppearances}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card stat-gender" bordered={false}>
            <Statistic
              title="男女人数"
              value={`${stats.maleCount} / ${stats.femaleCount}`}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card stat-location" bordered={false}>
            <Statistic
              title="预警点位数"
              value={stats.locationCount}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="analysis-chart-card" bordered={false}>
        <div className="chart-header">
          <span className="chart-title">{getTitle()}</span>
        </div>
        <Spin spinning={loading}>
          <div className="analysis-chart">
            {data.length > 0 ? (
              <Line {...config} />
            ) : (
              !loading && (
                <div className="analysis-empty">
                  <LineChartOutlined className="empty-icon" />
                  <p>暂无数据</p>
                </div>
              )
            )}
          </div>
        </Spin>
      </Card>

      <div className="analysis-footer">
        <Tag color="blue">数据来源：鼓楼分局巡防预警系统</Tag>
        <Tag color="green">实时更新</Tag>
      </div>
    </div>
  );
}
