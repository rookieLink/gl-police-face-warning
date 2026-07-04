import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

/** 查询参数 */
export interface SearchParams {
  sfz?: string;
  yjdw?: string;
}

/** 查询结果项 */
export interface SearchResult {
  id: string;
  sfz: string;
  yjsj: string;
  yjdw: string;
  yjdwdm: string;
  dt: string;
  xt: string;
  lng: number;
  lat: number;
  xsd: number;
}

/** API 返回的数据结构 */
export interface ApiResponse {
  list: SearchResult[];
  total: number;
}

export const searchUsers = async (params: SearchParams): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>('/api/gulou-face/search', params);
  return res as unknown as ApiResponse;
};

export default api;
