import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  message,
  Tag,
  Space,
  Typography,
  Table,
  Modal,
  Input,
  Descriptions,
  Popconfirm,
  Spin,
} from 'antd';
import {
  FileOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getDataList,
  deleteFile,
  renameFile,
  getFileInfo,
  type DataItem,
  type FileItem,
} from '../../services/file';

const { Text } = Typography;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function AlarmDataList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filename = searchParams.get('filename') || '';

  const [dataList, setDataList] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [renameVisible, setRenameVisible] = useState(false);
  const [renameFilename, setRenameFilename] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<FileItem | null>(null);

  const fetchDataList = useCallback(async (currentPage = 1, pageSize = 10) => {
    if (!filename) return;
    setLoading(true);
    try {
      const res = await getDataList({ filename, currentPage, pageSize, forUse: 1 });
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

  const handleDelete = async () => {
    try {
      await deleteFile(filename, 1);
      message.success('删除成功');
      navigate('/alarm-analysis/data');
    } catch {
      // 错误已在拦截器处理
    }
  };

  const handleRename = async () => {
    if (!newFilename.trim()) {
      message.warning('请输入新文件名');
      return;
    }
    if (newFilename === renameFilename) {
      message.warning('新文件名与原文件名相同');
      return;
    }

    setRenameLoading(true);
    try {
      await renameFile({ filename: renameFilename, new_name: newFilename.trim(), forUse: 1 });
      message.success('重命名成功');
      setRenameVisible(false);
      navigate(`/alarm-analysis/data?filename=${encodeURIComponent(newFilename.trim())}`);
    } catch {
      // 错误已在拦截器处理
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDetail = async () => {
    if (!filename) return;
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const res = await getFileInfo(filename, 1);
      setDetailData(res);
    } catch {
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openRenameModal = () => {
    setRenameFilename(filename);
    setNewFilename(filename);
    setRenameVisible(true);
  };

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
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
          请从警情数据列表选择文件进行查看
        </div>
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/alarm-analysis/data')}
        >
          返回
        </Button>
        <h2 style={{ margin: 0 }}>警情数据详情</h2>
        <Tag color="blue">{filename}</Tag>
      </Space>

      <Card
        title={
          <Space>
            <FileOutlined />
            <span>数据列表</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={openRenameModal}
            >
              重命名
            </Button>
            <Button
              icon={<InfoCircleOutlined />}
              onClick={handleDetail}
            >
              文件详情
            </Button>
            <Popconfirm
              title="确认删除"
              description={`确定要删除文件 ${filename} 吗？`}
              onConfirm={handleDelete}
              okText="确认"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchDataList(pagination.current, pagination.pageSize)}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
      >
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
      </Card>

      {/* 重命名弹窗 */}
      <Modal
        title="重命名文件"
        open={renameVisible}
        onOk={handleRename}
        onCancel={() => setRenameVisible(false)}
        confirmLoading={renameLoading}
        okText="确认"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">原文件名：</Text>
            <Text>{renameFilename}</Text>
          </div>
          <Input
            addonBefore="新文件名"
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            onPressEnter={handleRename}
            placeholder="请输入新文件名"
          />
        </Space>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="文件详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <Spin spinning={detailLoading}>
          {detailData && (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="文件名">{detailData.filename}</Descriptions.Item>
              <Descriptions.Item label="类型">{detailData.extension}</Descriptions.Item>
              <Descriptions.Item label="大小">{formatFileSize(detailData.size)}</Descriptions.Item>
              <Descriptions.Item label="上传时间">{detailData.upload_time}</Descriptions.Item>
              <Descriptions.Item label="修改时间">{detailData.modified_time}</Descriptions.Item>
              <Descriptions.Item label="下载链接">
                <Button type="link" href={detailData.url} target="_blank">
                  点击下载
                </Button>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </div>
  );
}
