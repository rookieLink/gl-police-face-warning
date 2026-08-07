import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.status === 200 && res.success === '成功') {
      return res.data;
    }
    message.error(res.error || '请求失败');
    return Promise.reject(new Error(res.error || '请求失败'));
  },
  (error) => {
    const res = error.response?.data;
    message.error(res?.error || res?.message || '网络错误，请检查连接');
    return Promise.reject(error);
  }
);

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<UploadResponse>('/api/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res as unknown as UploadResponse;
};

export default api;
