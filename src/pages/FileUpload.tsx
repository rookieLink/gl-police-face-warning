import { useState } from 'react';
import { Card, Upload, Button, message, List, Tag, Space, Typography, Progress } from 'antd';
import { InboxOutlined, FileOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadFile } from '../services/file';

const { Dragger } = Upload;
const { Text } = Typography;

interface UploadedFile {
  uid: string;
  name: string;
  size: number;
  status: 'uploading' | 'done' | 'error';
  progress?: number;
  url?: string;
  errorMsg?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileUpload() {
  const [fileList, setFileList] = useState<UploadedFile[]>([]);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    const uploadFileObj = file as File;

    const newFile: UploadedFile = {
      uid: `-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: uploadFileObj.name,
      size: uploadFileObj.size,
      status: 'uploading',
      progress: 0,
    };

    setFileList(prev => [newFile, ...prev]);

    try {
      onProgress?.({ percent: 30 });

      const result = await uploadFile(uploadFileObj);

      onProgress?.({ percent: 100 });

      setFileList(prev => prev.map(f =>
        f.uid === newFile.uid
          ? { ...f, status: 'done', progress: 100, url: result.url }
          : f
      ));

      onSuccess?.(result);
      message.success(`${uploadFileObj.name} 上传成功`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '上传失败';

      setFileList(prev => prev.map(f =>
        f.uid === newFile.uid
          ? { ...f, status: 'error', errorMsg }
          : f
      ));

      onError?.(error as Error);
      message.error(`${uploadFileObj.name} ${errorMsg}`);
    }
  };

  const handleDelete = (uid: string) => {
    setFileList(prev => prev.filter(f => f.uid !== uid));
    message.success('文件已删除');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    customRequest: handleUpload,
    showUploadList: false,
    accept: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar',
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB');
        return false;
      }
      return true;
    },
  };

  return (
    <div>
      <h2>文件上传</h2>

      <Card style={{ marginBottom: 24 }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传，仅支持 jpg/png/pdf/doc/xls/txt/zip 格式，单个文件不超过 10MB
          </p>
        </Dragger>
      </Card>

      <Card
        title={
          <Space>
            <FileOutlined />
            <span>上传记录</span>
            <Tag>{fileList.length} 个文件</Tag>
          </Space>
        }
        extra={
          fileList.length > 0 && (
            <Button
              danger
              size="small"
              onClick={() => setFileList([])}
            >
              清空列表
            </Button>
          )
        }
      >
        {fileList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            暂无上传记录
          </div>
        ) : (
          <List
            dataSource={fileList}
            renderItem={(item) => (
              <List.Item
                actions={[
                  item.url && (
                    <Button
                      key="download"
                      type="link"
                      href={item.url}
                      target="_blank"
                    >
                      下载
                    </Button>
                  ),
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item.uid)}
                  >
                    删除
                  </Button>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    item.status === 'done' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                    ) : item.status === 'error' ? (
                      <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
                    ) : (
                      <FileOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                    )
                  }
                  title={
                    <Space>
                      <Text>{item.name}</Text>
                      {item.status === 'uploading' && (
                        <Tag color="processing">上传中</Tag>
                      )}
                      {item.status === 'done' && (
                        <Tag color="success">已完成</Tag>
                      )}
                      {item.status === 'error' && (
                        <Tag color="error">失败</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text type="secondary">{formatFileSize(item.size)}</Text>
                      {item.status === 'uploading' && item.progress !== undefined && (
                        <Progress
                          percent={Math.round(item.progress)}
                          size="small"
                          status="active"
                        />
                      )}
                      {item.status === 'error' && item.errorMsg && (
                        <Text type="danger">{item.errorMsg}</Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
