import { useState } from 'react';
import { Card, Upload, message, Select, Space, Typography, Button } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadFile } from '../../services/file';

const { Dragger } = Upload;
const { Text } = Typography;

const forUseOptions = [
  { value: 1, label: '警情分析' },
  { value: 2, label: '队伍质态' },
  { value: 0, label: '其他' },
];

export default function FileUpload() {
  const [forUse, setForUse] = useState<number>(1);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of fileList) {
      try {
        await uploadFile(file.originFileObj as File, forUse);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setUploading(false);
    setFileList([]);

    if (successCount > 0) {
      message.success(`成功上传 ${successCount} 个文件`);
    }
    if (failCount > 0) {
      message.error(`${failCount} 个文件上传失败`);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    accept: '.xls,.xlsx,.csv',
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB');
        return false;
      }
      const isValidType = file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv');
      if (!isValidType) {
        message.error('仅支持 Excel 数据表文件（.xls, .xlsx, .csv）');
        return false;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      setFileList(fileList.filter((item) => item.uid !== file.uid));
    },
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: 600 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Space align="center">
            <Text>数据用途：</Text>
            <Select
              value={forUse}
              onChange={(value) => setForUse(value)}
              options={forUseOptions}
              style={{ width: 150 }}
            />
          </Space>
          <Dragger {...uploadProps} style={{ width: '100%' }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            <p className="ant-upload-hint">
              支持单个或批量上传，仅支持 Excel 数据表文件（.xls, .xlsx, .csv），单个文件不超过 10MB
            </p>
          </Dragger>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
            loading={uploading}
            disabled={fileList.length === 0}
            size="large"
            style={{ width: 200 }}
          >
            {uploading ? '上传中...' : '开始上传'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
