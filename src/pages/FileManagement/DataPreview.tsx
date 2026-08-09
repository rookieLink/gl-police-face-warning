import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spin, Empty, Tag, Space, Table } from 'antd';
import { ArrowLeftOutlined, FileOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { parseFile } from '../../services/file';
import type { FileParseResponse } from '../../services/file';

export default function DataPreview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filename = searchParams.get('filename') || '';

  const [loading, setLoading] = useState(false);
  const [parseData, setParseData] = useState<FileParseResponse | null>(null);

  const fetchData = useCallback(async () => {
    if (!filename) return;
    setLoading(true);
    try {
      const res = await parseFile(filename, 0);
      setParseData(res);
    } catch {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  }, [filename]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!filename) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/file-management/list')}
          >
            返回
          </Button>
        </Space>
        <Empty description="请从文件列表选择文件进行预览" />
      </div>
    );
  }

  const columns = parseData?.headers.map((header, index) => ({
    title: header,
    dataIndex: `col_${index}`,
    key: `col_${index}`,
    ellipsis: true,
    width: 150,
  })) || [];

  const dataSource = parseData?.rows.map((row, rowIndex) => {
    const record: Record<string, string | number> = { key: rowIndex };
    row.forEach((cell, cellIndex) => {
      record[`col_${cellIndex}`] = cell;
    });
    return record;
  }) || [];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/file-management/list')}
        >
          返回
        </Button>
        <h2 style={{ margin: 0 }}>数据预览</h2>
        {filename && <Tag color="blue">{filename}</Tag>}
      </div>

      <Card
        title={
          <Space>
            <FileOutlined />
            <span>文件数据</span>
          </Space>
        }
        extra={
          parseData && (
            <Space>
              <Tag color="blue">文件类型：{parseData.type}</Tag>
              <Tag color="green">总行数：{parseData.totalRows}</Tag>
              <Tag color="orange">列数：{parseData.headers.length}</Tag>
            </Space>
          )
        }
      >
        <Spin spinning={loading}>
          {parseData && parseData.headers.length > 0 ? (
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              scroll={{ x: 'max-content', y: 'calc(100vh - 380px)' }}
              size="middle"
              bordered
            />
          ) : (
            !loading && <Empty description="暂无数据" />
          )}
        </Spin>
      </Card>
    </div>
  );
}
