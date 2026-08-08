import { Card, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadFile } from '../services/file';

const { Dragger } = Upload;

export default function FileUpload() {
  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const uploadFileObj = file as File;

    try {
      const result = await uploadFile(uploadFileObj);
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

      <Card>
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
    </div>
  );
}
