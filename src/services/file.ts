import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  // baseURL: 'http://localhost:5001',
  baseURL: 'http://50.32.42.5:9003',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => {
    const res = response.data;
    // if (res.status === 200 && res.success === '成功') {
    if (res.status === 200) {
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

// ==================== 文件上传 ====================

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadFile = async (file: File, forUse: number = 1): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('forUse', String(forUse));

  const res = await api.post<UploadResponse>('/api/file/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res as unknown as UploadResponse;
};

// ==================== 文件列表 ====================

export interface FileItem {
  filename: string;
  extension: string;
  size: number;
  url: string;
  upload_time: string;
  modified_time: string;
  forUse: number;
}

export interface FileListParams {
  currentPage?: number;
  pageSize?: number;
  forUse?: number;
}

export interface FileListResponse {
  list: FileItem[];
  total: number;
}

export const getFileList = async (params: FileListParams = {}): Promise<FileListResponse> => {
  const res = await api.post<FileListResponse>('/api/file/list', params);
  return res as unknown as FileListResponse;
};

// ==================== 文件详情 ====================

export const getFileInfo = async (filename: string, forUse: number = 0): Promise<FileItem> => {
  const res = await api.post<FileItem>('/api/file/info', { filename, forUse });
  return res as unknown as FileItem;
};

// ==================== 文件删除 ====================

export const deleteFile = async (filename: string, forUse: number = 0): Promise<void> => {
  await api.post('/api/file/delete', { filename, forUse });
};

// ==================== 文件重命名 ====================

export interface RenameParams {
  filename: string;
  new_name: string;
  forUse?: number;
}

export const renameFile = async (params: RenameParams): Promise<void> => {
  await api.post('/api/file/rename', params);
};

// ==================== 文件解析 ====================

export interface FileParseResponse {
  type: string;
  headers: string[];
  rows: (string | number)[][];
  totalRows: number;
}

export const parseFile = async (filename: string, forUse: number = 0): Promise<FileParseResponse> => {
  const res = await api.post<FileParseResponse>('/api/file/parse', { filename, forUse });
  return res as unknown as FileParseResponse;
};

// ==================== 数据列表查询 ====================

export interface DataItem {
  id: string;
  area: string;
  call_time: string;
  level: string;
  call_type: string;
  caller_type: string;
  location: string;
  content: string;
  disp_type: string;
  site: string;
  loss: string;
  x: number;
  y: number;
  cause: string;
  weather: string;
  weekday: string;
  summary: string;
  result: string;
}

export interface DataListParams {
  filename: string;
  currentPage?: number;
  pageSize?: number;
  forUse?: number;
}

export interface DataListResponse {
  list: DataItem[];
  total: number;
}

export const getDataList = async (params: DataListParams): Promise<DataListResponse> => {
  const res = await api.post<DataListResponse>('/api/file/json-query/list', params);
  return res as unknown as DataListResponse;
};

// ==================== 可视化分析 ====================

export interface PieDataItem {
  name: string;
  num: number;
}

export interface LineDataItem {
  date: string;
  num: number;
}

export interface VisualizationData {
  areaPieData: PieDataItem[];
  timePieData: PieDataItem[];
  dayLineData: LineDataItem[];
}

export const getVisualizationData = async (filename: string, forUse: number = 0): Promise<VisualizationData> => {
  const res = await api.post<VisualizationData>('/api/file/json-analysis', { filename, forUse });
  return res as unknown as VisualizationData;
};

// ==================== 热力图数据查询 ====================

export interface HeatMapParams {
  filename: string;
  timeRange?: number; // 0:全部, 1:0-7点, 2:7-12点, 3:12-18点, 4:18-24点
  forUse?: number;
}

export interface HeatMapResponse {
  list: DataItem[];
  total: number;
}

export const getHeatMapData = async (params: HeatMapParams): Promise<HeatMapResponse> => {
  const res = await api.post<HeatMapResponse>('/api/file/json-heatmap', params);
  return res as unknown as HeatMapResponse;
};

export default api;
