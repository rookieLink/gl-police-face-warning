import { useState } from 'react';
import { Card, Upload, message, Select, Space, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadFile } from '../../services/file';

const { Dragger } = Upload;
const { Text } = Typography;

const forUseOptions = [
  { value: 1, label: '警情分析' },
  { value: 0, label: '其他' },
];

export default function FileUpload() {
  const [forUse, setForUse] = useState<number>(1);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const uploadFileObj = file as File;

    try {
      const result = await uploadFile(uploadFileObj, forUse);
      onSuccess?.(result);
      message.success(`${uploadFileObj.name} 上传成功`);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    customRequest: handleUpload,
    showUploadList: false,
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
      return true;
    },
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>文件上传</h2>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space align="center">
            <Text>数据用途：</Text>
            <Select
              value={forUse}
              onChange={(value) => setForUse(value)}
              options={forUseOptions}
              style={{ width: 150 }}
            />
          </Space>
        </div>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传，仅支持 Excel 数据表文件（.xls, .xlsx, .csv），单个文件不超过 10MB
          </p>
        </Dragger>
      </Card>
    </div>
  );
}
