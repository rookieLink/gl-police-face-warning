import { useState, useEffect, useCallback } from 'react';
import { Card, Spin, Button, Empty, Tag, Tabs, Table, Space, Row, Col } from 'antd';
import { ArrowLeftOutlined, BarChartOutlined, SearchOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Column, Bar } from '@ant-design/charts';
import type { TableProps } from 'antd';
import {
  getTeamAnalysisData,
  type TeamAnalysisItem,
} from '../../services/file';

type ActiveTab = 'list' | 'chart' | 'chartV';

const tabConfig = {
  chart: { label: '可视分析', icon: <BarChartOutlined /> },
  // chartV: { label: '可视化分析(竖版)', icon: <AppstoreOutlined /> },
  list: { label: '数据列表', icon: <SearchOutlined /> },
};

export default function TeamQualityVisualization() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filename = searchParams.get('filename') || '';

  const [activeTab, setActiveTab] = useState<ActiveTab>('chart');
  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState<TeamAnalysisItem[]>([]);
  const [chartData, setChartData] = useState<TeamAnalysisItem[]>([]);

  const fetchAllData = useCallback(async () => {
    if (!filename) return;
    setLoading(true);
    try {
      const res = await getTeamAnalysisData({ filename, currentPage: 1, pageSize: 1000, forUse: 2 });
      setDataList(res.list);
      setChartData(res.list);
    } catch {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  }, [filename]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const columns: TableProps<TeamAnalysisItem>['columns'] = [
    { title: '警号', dataIndex: 'id', key: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '班次类型', dataIndex: 'work_type', key: 'work_type', width: 120 },
    { title: '接警量', dataIndex: 'receive_num', key: 'receive_num', width: 100, sorter: (a, b) => a.receive_num - b.receive_num },
    { title: '移交量', dataIndex: 'transfer_num', key: 'transfer_num', width: 100, sorter: (a, b) => a.transfer_num - b.transfer_num },
    { title: '自处率', dataIndex: 'resolve_rate', key: 'resolve_rate', width: 100, render: (score: number) => <Tag color={score >= 90 ? 'green' : 'orange'}>{score + '%'}</Tag>, sorter: (a, b) => a.resolve_num - b.resolve_num },
    { title: '总分', dataIndex: 'total_score', key: 'total_score', width: 100, sorter: (a, b) => a.total_score - b.total_score },
    { title: '勤务规范/法制通报/民意诉求', dataIndex: 'complaint_num', key: 'complaint_num', width: 180, render: (num: number) => <Tag color={num > 0 ? 'red' : 'default'}>{num}</Tag>, sorter: (a, b) => a.complaint_num - b.complaint_num },
  ];

  const getReceiveChartData = () => {
    const sorted = [...chartData].sort((a, b) => b.receive_num - a.receive_num);
    const result: { name: string; type: string; value: number }[] = [];
    sorted.forEach(item => {
      result.push({ name: item.name, type: '自处量', value: item.resolve_num });
      result.push({ name: item.name, type: '移交量', value: item.transfer_num });
    });
    return result;
  };

  const getScoreChartData = () => {
    return [...chartData]
      .sort((a, b) => b.total_score - a.total_score)
      .map(item => ({ name: item.name, value: item.total_score }));
  };

  const getComplaintChartData = () => {
    return [...chartData]
      .filter(item => item.complaint_num > 0)
      .sort((a, b) => b.complaint_num - a.complaint_num)
      .map(item => ({ name: item.name, value: item.complaint_num }));
  };

  // ========== 横版配置（标签在上方） ==========

  const receiveChartConfigH = {
    data: getReceiveChartData(),
    xField: 'name',
    yField: 'value',
    colorField: 'type',
    stack: true,
    height: 400,
    scale: {
      color: {
        domain: ['自处量', '移交量'],
        range: ['#2a89ff', '#FF0000'],
      },
    },
    style: { maxWidth:  18},
    label: {
      position: 'inside' as const,
      style: { fill: '#fff', fontSize: 11, fontWeight: 500 },
      text: (d: { value: number }) => d.value > 0 ? d.value : '',
      transform: [
        // {
        //   type: 'overflowStroke'
        // },
        {
          // type: 'contrastReverse'
        },
      ]
    },
    legend: {
      position: 'top' as const,
      itemName: { style: { fontSize: 13 } },
    },
    axis: {
      x: {
        style: { labelFontSize: 11 },
        labelTransform: 'rotate(-45)',
      },
      y: { title: { text: '数量' } },
    },
    interaction: { elementHighlight: true },
  };

  const scoreChartConfigH = {
    data: getScoreChartData(),
    xField: 'name',
    yField: 'value',
    height: 400,
    color: '#d48806',
    style: { maxWidth: 18 },
    // labels: [
    //   {
    //     position: 'top' as const,
    //     dy: -18,
    //     text: (val) => {
    //       console.log(val)
    //       return val
    //     }
    //   },
    //   {
    //     text: 'value'
    //   }
    // ],
    label: {
      position: 'top' as const,
      dy: -18,
      transform: [{
        type: 'overlapHide'
      }]
    },
    tooltip: {
      items: [(d: { name: string; value: number }) => ({ name: '得分', value: d.value })],
    },
    axis: {
      x: { style: { labelFontSize: 11 }, labelTransform: 'rotate(-45)' },
      y: { title: { text: '总分' } },
    },
    interaction: { elementHighlight: true },
  };

  const complaintChartConfigH = {
    data: getComplaintChartData(),
    xField: 'name',
    yField: 'value',
    height: 400,
    color: '#cf1322',
    style: { maxWidth: 18 },
    label: {
      position: 'top' as const,
      dy: -18,
      // transform: [
      //   // {
      //   //   type: 'overflowStroke'
      //   // },
      //   {
      //     type: 'contrastReverse'
      //   },
      //   {
      //     type: 'overlapHide'
      //   }
      // ]
    },
    tooltip: {
      items: [(d: { name: string; value: number }) => ({ name: '数量', value: d.value })],
    },
    axis: {
      x: { style: { labelFontSize: 11 }, labelTransform: 'rotate(-45)' },
      y: { title: { text: '投诉量' }, tickFilter: (d: number) => d % 1 === 0 },
    },
    interaction: { elementHighlight: true },
  };

  // ========== 竖版配置（标签在右侧） ==========

  const receiveChartConfigV = {
    data: getReceiveChartData(),
    xField: 'name',
    yField: 'value',
    colorField: 'type',
    stack: true,
    height: 550,
    // marginRatio: 0.5,
    scale: {
      color: {
        domain: ['自处量', '移交量'],
        range: ['#2a89ff', '#ff4d4f'],
      },
    },
    style: { maxWidth: 18},
    scrollbar: {
      x: { ratio: 0.5 },
    },
    label: {
      position: 'inside' as const,
      style: { fill: '#fff', fontSize: 11, fontWeight: 500 },
      text: (d: { value: number }) => d.value > 0 ? d.value : '',
    },
    legend: {
      position: 'top' as const,
      itemName: { style: { fontSize: 13 } },
    },
    axis: {
      x: { style: { labelFontSize: 11 }, labelTransform: 'rotate(-45)' },
      y: { title: { text: '数量' } },
    },
    interaction: { elementHighlight: true },
  };

  const scoreChartConfigV = {
    data: getScoreChartData(),
    xField: 'name',
    yField: 'value',
    height: 550,
    color: '#d48806',
    style: { maxWidth: 18 },
    scrollbar: {
      x: { ratio: 0.5 },
    },
    label: {
      position: 'right' as const,
      dx: 38,
    },
    tooltip: {
      items: [(d: { name: string; value: number }) => ({ name: '得分', value: d.value })],
    },
    axis: {
      x: { style: { labelFontSize: 11 }, labelTransform: 'rotate(-45)' },
      y: { title: { text: '总分' } },
    },
    interaction: { elementHighlight: true },
  };

  const complaintChartConfigV = {
    data: getComplaintChartData(),
    xField: 'name',
    yField: 'value',
    height: 400,
    color: '#cf1322',
    style: { maxWidth: 18 },
    label: {
      position: 'top' as const,
      dy: -18,
    },
    tooltip: {
      items: [(d: { name: string; value: number }) => ({ name: '数量', value: d.value })],
    },
    axis: {
      x: { style: { labelFontSize: 11 }, labelTransform: 'rotate(-45)' },
      y: { title: { text: '投诉量' }, tickFilter: (d: number) => d % 1 === 0 },
    },
    interaction: { elementHighlight: true },
  };

  if (!filename) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/team-quality/data')}>
            返回
          </Button>
        </Space>
        <Empty description="请从质态数据列表选择文件进行分析" />
      </div>
    );
  }

  const renderListTab = () => (
    <Spin spinning={loading}>
      <Table columns={columns} dataSource={dataList} rowKey="id" scroll={{ x: 1200 }} pagination={false} />
    </Spin>
  );

  const renderChartTab = () => (
    <Spin spinning={loading && activeTab === 'chart'}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="接警量" bordered={false}>
          {chartData.length > 0 ? <Column {...receiveChartConfigH} /> : <Empty description="暂无数据" />}
        </Card>
        <Card title="总得分" bordered={false}>
          {chartData.length > 0 ? <Column {...scoreChartConfigH} /> : <Empty description="暂无数据" />}
        </Card>
        <Card title="勤务规范/法制通报/民意诉求" bordered={false}>
          {getComplaintChartData().length > 0 ? <Column {...complaintChartConfigH} /> : <Empty description="全体民警无勤务规范/法制通报/民意诉求等情况" />}
        </Card>
      </Space>
    </Spin>
  );

  const renderChartVTab = () => (
    <Spin spinning={loading && activeTab === 'chartV'}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="接警量" bordered={false}>
              {chartData.length > 0 ? <Bar {...receiveChartConfigV} /> : <Empty description="暂无数据" />}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="总得分" bordered={false}>
              {chartData.length > 0 ? <Bar {...scoreChartConfigV} /> : <Empty description="暂无数据" />}
            </Card>
          </Col>
        </Row>
        <Card title="勤务规范/法制通报/民意诉求" bordered={false}>
          {getComplaintChartData().length > 0 ? <Column {...complaintChartConfigV} /> : <Empty description="全体民警无勤务规范/法制通报/民意诉求等情况" />}
        </Card>
      </Space>
    </Spin>
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/team-quality/data')}>
          返回
        </Button>
        <h2 style={{ margin: 0 }}>质态分析</h2>
        {filename && <Tag color="blue">{filename}</Tag>}
      </div>

      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ActiveTab)}
          items={Object.entries(tabConfig).map(([key, config]) => ({
            key,
            label: <span>{config.icon} {config.label}</span>,
          }))}
        />
        {activeTab === 'list' && renderListTab()}
        {activeTab === 'chart' && renderChartTab()}
        {activeTab === 'chartV' && renderChartVTab()}
      </Card>
    </div>
  );
}
