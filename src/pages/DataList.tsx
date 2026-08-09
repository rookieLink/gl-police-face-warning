import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Space, Typography, Button, ConfigProvider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDataList, type DataItem } from '../services/file';

const { Text } = Typography;

export default function DataList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filename = searchParams.get('filename') || '';

  const [dataList, setDataList] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchDataList = useCallback(async (currentPage = 1, pageSize = 10) => {
    if (!filename) return;
    setLoading(true);
    try {
      const res = await getDataList({ filename, currentPage, pageSize, forUse: 0 });
      setDataList(res.list);
      setPagination(prev => ({ ...prev, current: currentPage, pageSize, total: res.total }));
    } catch {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  }, [filename]);

  useEffect(() => {
    fetchDataList();
  }, [fetchDataList]);

  const columns: TableProps<DataItem>['columns'] = [
    {
      title: '接警编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '所属责任区',
      dataIndex: 'area',
      key: 'area',
      width: 120,
      ellipsis: true,
    },
    {
      title: '报警时间',
      dataIndex: 'call_time',
      key: 'call_time',
      width: 170,
    },
    {
      title: '警情等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          '1': 'red',
          '2': 'orange',
          '3': 'gold',
          '4': 'blue',
        };
        return <Tag color={colorMap[text] || 'default'}>{text}级</Tag>;
      },
    },
    {
      title: '接警类别',
      dataIndex: 'call_type',
      key: 'call_type',
      width: 120,
    },
    {
      title: '事发地点',
      dataIndex: 'location',
      key: 'location',
      width: 200,
      ellipsis: true,
    },
    {
      title: '报警内容',
      dataIndex: 'content',
      key: 'content',
      width: 250,
      ellipsis: true,
    },
    {
      title: '天气情况',
      dataIndex: 'weather',
      key: 'weather',
      width: 100,
    },
    {
      title: '事发星期',
      dataIndex: 'weekday',
      key: 'weekday',
      width: 100,
    },
    {
      title: '处警结果',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/file-management/list')}
        >
          返回
        </Button>
        <h2 style={{ margin: 0 }}>数据列表</h2>
        <Tag color="blue">{filename}</Tag>
      </Space>

      <Card>
        <ConfigProvider locale={zhCN}>
          <Table
            columns={columns}
            dataSource={dataList}
            rowKey={(_, index) => String(index)}
            loading={loading}
            scroll={{ x: 1500, y: 'calc(100vh - 340px)' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, pageSize) => fetchDataList(page, pageSize),
            }}
          />
        </ConfigProvider>
      </Card>
    </div>
  );
}
