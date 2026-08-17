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
  Dropdown,
} from 'antd';
import {
  FileOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  getFileList,
  deleteFile,
  renameFile,
  getFileInfo,
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

export default function DataAnalysis() {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [renameVisible, setRenameVisible] = useState(false);
  const [renameFilename, setRenameFilename] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<FileItem | null>(null);

  const fetchFileList = useCallback(async (currentPage = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await getFileList({ currentPage, pageSize });
      setFileList(res.list);
      setPagination(prev => ({ ...prev, current: currentPage, pageSize, total: res.total }));
    } catch {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFileList();
  }, [fetchFileList]);

  const handleDelete = async (filename: string) => {
    try {
      await deleteFile(filename);
      message.success('删除成功');
      fetchFileList(pagination.current, pagination.pageSize);
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
      await renameFile({ filename: renameFilename, new_name: newFilename.trim() });
      message.success('重命名成功');
      setRenameVisible(false);
      fetchFileList(pagination.current, pagination.pageSize);
    } catch {
      // 错误已在拦截器处理
    } finally {
      setRenameLoading(false);
    }
  };

  const handleDetail = async (filename: string) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const res = await getFileInfo(filename);
      setDetailData(res);
    } catch {
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openRenameModal = (filename: string) => {
    setRenameFilename(filename);
    setNewFilename(filename);
    setRenameVisible(true);
  };

  const handlePreview = (filename: string) => {
    navigate(`/file-management/preview?filename=${encodeURIComponent(filename)}`);
  };

  const columns: TableProps<FileItem>['columns'] = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true,
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'extension',
      key: 'extension',
      width: 80,
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传时间',
      dataIndex: 'upload_time',
      key: 'upload_time',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record.filename)}
            style={{ padding: 0 }}
          >
            数据预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openRenameModal(record.filename)}
            style={{ padding: 0 }}
          >
            重命名
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除文件 ${record.filename} 吗？`}
            onConfirm={() => handleDelete(record.filename)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>数据分析</h2>

      <Card
        title={
          <Space>
            <FileOutlined />
            <span>文件列表</span>
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchFileList(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={fileList}
          rowKey="filename"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个文件`,
            onChange: (page, pageSize) => fetchFileList(page, pageSize),
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
