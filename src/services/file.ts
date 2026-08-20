import axios from 'axios';
import { message } from 'antd';

/**
 * Axios 实例配置
 * baseURL: http://50.32.42.5:9003
 * timeout: 30000ms (文件操作耗时较长, 超时设置为30秒)
 */
const api = axios.create({
  // baseURL: 'http://localhost:5001', 
  baseURL: 'http://50.32.42.5:9003',
  timeout: 30000,
});

/**
 * 响应拦截器
 * 统一处理接口返回格式
 * 成功格式: { status: 200, data: {...} }
 * 失败格式: { status: 400, error: '错误信息' }
 */
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

/**
 * 文件上传响应数据
 * @property url - 文件访问URL
 * @property filename - 文件名
 * @property size - 文件大小 (字节)
 */
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

/**
 * 上传文件
 * @api POST /api/file/upload-excel
 * @param file - 要上传的文件对象
 * @param forUse - 文件用途 (默认: 1)
 * @returns Promise<UploadResponse> - 返回文件上传结果
 */
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

/**
 * 文件列表项
 * @property filename - 文件名
 * @property extension - 文件扩展名
 * @property size - 文件大小 (字节)
 * @property url - 文件访问URL
 * @property upload_time - 上传时间
 * @property modified_time - 修改时间
 * @property forUse - 文件用途
 */
export interface FileItem {
  filename: string;
  extension: string;
  size: number;
  url: string;
  upload_time: string;
  modified_time: string;
  forUse: number;
}

/**
 * 文件列表查询参数
 * @api POST /api/file/list
 * @property currentPage - 当前页码 (默认: 1)
 * @property pageSize - 每页条数 (默认: 10)
 * @property forUse - 文件用途筛选 (可选)
 */
export interface FileListParams {
  currentPage?: number;
  pageSize?: number;
  forUse?: number;
}

/**
 * 文件列表响应数据
 * @api POST /api/file/list
 * @property list - 文件列表
 * @property total - 总记录数
 */
export interface FileListResponse {
  list: FileItem[];
  total: number;
}

/**
 * 查询文件列表
 * @api POST /api/file/list
 * @param params - 查询参数
 * @returns Promise<FileListResponse> - 返回分页文件列表
 * @example
 * 请求: { currentPage: 1, pageSize: 10, forUse: 1 }
 * 响应: { list: [...], total: 50 }
 */
export const getFileList = async (params: FileListParams = {}): Promise<FileListResponse> => {
  const res = await api.post<FileListResponse>('/api/file/list', params);
  return res as unknown as FileListResponse;
};

// ==================== 文件详情 ====================

/**
 * 查询文件详情
 * @api POST /api/file/info
 * @param filename - 文件名
 * @param forUse - 文件用途 (默认: 0)
 * @returns Promise<FileItem> - 返回文件详细信息
 */
export const getFileInfo = async (filename: string, forUse: number = 0): Promise<FileItem> => {
  const res = await api.post<FileItem>('/api/file/info', { filename, forUse });
  return res as unknown as FileItem;
};

// ==================== 文件删除 ====================

/**
 * 删除文件
 * @api POST /api/file/delete
 * @param filename - 文件名
 * @param forUse - 文件用途 (默认: 0)
 * @returns Promise<void>
 */
export const deleteFile = async (filename: string, forUse: number = 0): Promise<void> => {
  await api.post('/api/file/delete', { filename, forUse });
};

// ==================== 文件重命名 ====================

/**
 * 文件重命名请求参数
 * @api POST /api/file/rename
 * @property filename - 原文件名
 * @property new_name - 新文件名
 * @property forUse - 文件用途 (可选)
 */
export interface RenameParams {
  filename: string;
  new_name: string;
  forUse?: number;
}

/**
 * 重命名文件
 * @api POST /api/file/rename
 * @param params - 重命名参数
 * @returns Promise<void>
 */
export const renameFile = async (params: RenameParams): Promise<void> => {
  await api.post('/api/file/rename', params);
};

// ==================== 文件解析 ====================

/**
 * 文件解析响应数据
 * @api POST /api/file/parse
 * @property type - 文件类型
 * @property headers - 表头列表
 * @property rows - 数据行列表 (二维数组)
 * @property totalRows - 总行数
 */
export interface FileParseResponse {
  type: string;
  headers: string[];
  rows: (string | number)[][];
  totalRows: number;
}

/**
 * 解析文件内容
 * @api POST /api/file/parse
 * @param filename - 文件名
 * @param forUse - 文件用途 (默认: 0)
 * @returns Promise<FileParseResponse> - 返回解析后的文件数据
 */
export const parseFile = async (filename: string, forUse: number = 0): Promise<FileParseResponse> => {
  const res = await api.post<FileParseResponse>('/api/file/parse', { filename, forUse });
  return res as unknown as FileParseResponse;
};

// ==================== 数据列表查询 ====================

/**
 * 数据列表项
 * @property id - 记录ID
 * @property area - 区域
 * @property call_time - 呼叫时间
 * @property level - 等级
 * @property call_type - 呼叫类型
 * @property caller_type - 呼叫者类型
 * @property location - 位置
 * @property content - 内容
 * @property disp_type - 调度类型
 * @property site - 站点
 * @property loss - 损失
 * @property x - X坐标 (经度)
 * @property y - Y坐标 (纬度)
 * @property cause - 原因
 * @property weather - 天气
 * @property weekday - 星期
 * @property summary - 摘要
 * @property result - 结果
 */
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

/**
 * 数据列表查询参数
 * @api POST /api/file/json-query/list
 * @property filename - 文件名
 * @property currentPage - 当前页码 (默认: 1)
 * @property pageSize - 每页条数 (默认: 10)
 * @property forUse - 文件用途 (可选)
 */
export interface DataListParams {
  filename: string;
  currentPage?: number;
  pageSize?: number;
  forUse?: number;
}

/**
 * 数据列表响应数据
 * @api POST /api/file/json-query/list
 * @property list - 数据列表
 * @property total - 总记录数
 */
export interface DataListResponse {
  list: DataItem[];
  total: number;
}

/**
 * 查询数据列表
 * @api POST /api/file/json-query/list
 * @param params - 查询参数
 * @returns Promise<DataListResponse> - 返回分页数据列表
 * @example
 * 请求: { filename: "data.xlsx", currentPage: 1, pageSize: 10 }
 * 响应: { list: [...], total: 200 }
 */
export const getDataList = async (params: DataListParams): Promise<DataListResponse> => {
  const res = await api.post<DataListResponse>('/api/file/json-query/list', params);
  return res as unknown as DataListResponse;
};

// ==================== 可视化分析 ====================

/**
 * 饼图数据项
 * @property name - 分类名称
 * @property num - 数量
 */
export interface PieDataItem {
  name: string;
  num: number;
}

/**
 * 折线图数据项
 * @property date - 日期
 * @property num - 数量
 */
export interface LineDataItem {
  date: string;
  num: number;
}

/**
 * 可视化分析数据
 * @property areaPieData - 区域饼图数据
 * @property timePieData - 时间段饼图数据
 * @property dayLineData - 每日趋势折线图数据
 */
export interface VisualizationData {
  areaPieData: PieDataItem[];
  timePieData: PieDataItem[];
  dayLineData: LineDataItem[];
}

/**
 * 查询可视化分析数据
 * @api POST /api/file/json-analysis
 * @param filename - 文件名
 * @param forUse - 文件用途 (默认: 0)
 * @returns Promise<VisualizationData> - 返回可视化分析数据
 */
export const getVisualizationData = async (filename: string, forUse: number = 0): Promise<VisualizationData> => {
  const res = await api.post<VisualizationData>('/api/file/json-analysis', { filename, forUse });
  return res as unknown as VisualizationData;
};

// ==================== 热力图数据查询 ====================

/**
 * 热力图查询请求参数
 * @api POST /api/file/json-heatmap
 * @property filename - 文件名
 * @property timeRange - 时间范围
 *   - 0 - 全部
 *   - 1 - 0-7点
 *   - 2 - 7-12点
 *   - 3 - 12-18点
 *   - 4 - 18-24点
 * @property forUse - 文件用途 (可选)
 */
export interface HeatMapParams {
  filename: string;
  timeRange?: number; // 0:全部, 1:0-7点, 2:7-12点, 3:12-18点, 4:18-24点
  forUse?: number;
}

/**
 * 热力图响应数据
 * @api POST /api/file/json-heatmap
 * @property list - 数据列表
 * @property total - 总记录数
 */
export interface HeatMapResponse {
  list: DataItem[];
  total: number;
}

/**
 * 查询热力图数据
 * @api POST /api/file/json-heatmap
 * @param params - 查询参数
 * @returns Promise<HeatMapResponse> - 返回热力图数据
 * @example
 * 请求: { filename: "data.xlsx", timeRange: 2 }
 * 响应: { list: [...], total: 100 }
 */
export const getHeatMapData = async (params: HeatMapParams): Promise<HeatMapResponse> => {
  const res = await api.post<HeatMapResponse>('/api/file/json-heatmap', params);
  return res as unknown as HeatMapResponse;
};

// ==================== 队伍质态分析 ====================

/**
 * 队伍质态数据项
 * @property id - 警号
 * @property name - 姓名
 * @property work_type - 班次类型
 * @property receive_num - 接警量
 * @property transfer_num - 移交量
 * @property total_score - 总得分
 * @property complaint_num - 投诉量
 * @property resolve_num - 自
 */
export interface TeamAnalysisItem {
  id: string;
  name: string;
  work_type: string;
  receive_num: number;
  transfer_num: number;
  total_score: number;
  complaint_num: number;
  resolve_num: number;
}

/**
 * 队伍质态查询参数
 * @api POST /api/file/team/analysis
 * @property filename - 文件名
 * @property currentPage - 当前页码 (默认: 1)
 * @property pageSize - 每页条数 (默认: 10)
 * @property forUse - 文件用途 (可选)
 */
export interface TeamAnalysisParams {
  filename: string;
  currentPage?: number;
  pageSize?: number;
  forUse?: number;
}

/**
 * 队伍质态响应数据
 * @api POST /api/file/team/analysis
 * @property list - 数据列表
 * @property total - 总记录数
 */
export interface TeamAnalysisResponse {
  list: TeamAnalysisItem[];
  total: number;
}

/**
 * 查询队伍质态数据
 * @api POST /api/file/team/analysis
 * @param params - 查询参数
 * @returns Promise<TeamAnalysisResponse> - 返回队伍质态数据
 * @example
 * 请求: { filename: "data.xlsx", currentPage: 1, pageSize: 10 }
 * 响应: { list: [...], total: 50 }
 */
export const getTeamAnalysisData = async (params: TeamAnalysisParams): Promise<TeamAnalysisResponse> => {
  const res = await api.post<TeamAnalysisResponse>('/api/file/team/analysis', params);
  return res as unknown as TeamAnalysisResponse;
};

export default api;
