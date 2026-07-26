import axios from 'axios';
import { message } from 'antd';

/**
 * Axios 实例配置
 * baseURL: http://50.32.42.5:9003
 * timeout: 10000ms
 */
const api = axios.create({
  baseURL: 'http://localhost:5001',
  // baseURL: 'http://50.32.42.5:9003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 响应拦截器
 * 统一处理接口返回格式
 * 成功格式: { status: 200, success: '成功', data: {...} }
 * 失败格式: { status: 400, success: '失败', error: '错误信息' }
 */
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

// ==================== 通用类型定义 ====================

/**
 * 预警记录数据项
 * @property id - 记录ID
 * @property sfz - 身份证号
 * @property yjsj - 预警时间 (格式: YYYY-MM-DD HH:mm:ss)
 * @property yjdw - 预警点位名称
 * @property yjdwdm - 预警点位代码
 * @property dt - 大图URL
 * @property xt - 小图URL
 * @property lng - 经度 (WGS84坐标系)
 * @property lat - 纬度 (WGS84坐标系)
 * @property xsd - 相似度 (0-100)
 */
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

// ==================== 分页查询接口 ====================

/**
 * 分页查询请求参数
 * @api POST /api/gulou-face/search
 * @property sfz - 身份证号 (可选, 模糊查询)
 * @property yjdw - 预警点位 (可选, 模糊查询)
 * @property currentPage - 当前页码 (默认: 1)
 * @property pageSize - 每页条数 (默认: 10)
 */
export interface SearchParams {
  sfz?: string;
  yjdw?: string;
  currentPage?: number;
  pageSize?: number;
}

/**
 * 分页查询响应数据
 * @api POST /api/gulou-face/search
 * @property list - 数据列表
 * @property total - 总记录数
 */
export interface ApiResponse {
  list: SearchResult[];
  total: number;
}

/**
 * 分页查询预警数据
 * @api POST /api/gulou-face/search
 * @param params - 查询参数
 * @returns Promise<ApiResponse> - 返回分页数据
 * @example
 * 请求: { sfz: "3201", currentPage: 1, pageSize: 10 }
 * 响应: { list: [...], total: 100 }
 */
export const searchUsers = async (params: SearchParams): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>('/api/gulou-face/search', params);
  return res as unknown as ApiResponse;
};

// ==================== 全量查询接口 ====================

/**
 * 全量查询请求参数
 * @api POST /api/gulou-face
 * @property sfz - 身份证号 (可选, 模糊查询)
 * @property yjdw - 预警点位 (可选, 模糊查询)
 */
export interface ListParams {
  sfz?: string;
  yjdw?: string;
}

/**
 * 全量查询预警数据
 * @api POST /api/gulou-face
 * @param params - 查询参数 (可选)
 * @returns Promise<ApiResponse> - 返回全量数据
 * @example
 * 请求: { sfz: "3201" }
 * 响应: { list: [...], total: 500 }
 */
export const fetchAllUsers = async (params: ListParams = {}): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>('/api/gulou-face', params);
  return res as unknown as ApiResponse;
};

// ==================== 热力图接口 ====================

/**
 * 热力图查询请求参数
 * @api POST /api/gulou-face/heatmap
 * @property timeRange - 时间范围
 *   - 'day' - 今日
 *   - '7days' - 近7日
 *   - 'month' - 近一个月
 * @property deduplicate - 是否按身份证号去重
 *   - true - 去重, 每人只保留一条记录
 *   - false - 不去重, 保留所有记录
 */
export interface HeatMapParams {
  timeRange: 'day' | '7days' | 'month';
  deduplicate: boolean;
}

/**
 * 热力图查询响应数据
 * @api POST /api/gulou-face/heatmap
 * @property list - 预警记录列表
 * @property totalPersons - 出现总人数 (去重后)
 * @property totalAppearances - 出现总人次数
 * @property totalLocations - 预警点位数
 */
export interface HeatMapResponse {
  list: SearchResult[];
  totalPersons: number;
  totalAppearances: number;
  totalLocations: number;
}

/**
 * 查询热力图数据
 * @api POST /api/gulou-face/heatmap
 * @param params - 查询参数
 * @returns Promise<HeatMapResponse> - 返回热力图数据
 * @example
 * 请求: { timeRange: '7days', deduplicate: false }
 * 响应: {
 *   list: [...],
 *   totalPersons: 150,
 *   totalAppearances: 500,
 *   totalLocations: 12
 * }
 */
export const fetchHeatMapData = async (params: HeatMapParams): Promise<HeatMapResponse> => {
  const res = await api.post<HeatMapResponse>('/api/gulou-face/heatmap', params);
  return res as unknown as HeatMapResponse;
};

// ==================== 数据分析接口 ====================

/**
 * 数据分析查询请求参数
 * @api POST /api/gulou-face/analysis
 * @property groupBy - 分组方式
 *   - 'day' - 按日分组, 返回近30天数据
 *   - 'week' - 按周分组, 返回近12周数据
 *   - 'month' - 按月分组, 返回近12个月数据
 * @property deduplicate - 是否按身份证号去重
 */
export interface AnalysisParams {
  groupBy: 'day' | 'week' | 'month';
  deduplicate: boolean;
}

/**
 * 分析数据项
 * @property date - 日期标签 (按日: "M/D", 按周: "第N周", 按月: "N月")
 * @property count - 该时间段内的出现人次
 */
export interface AnalysisDataItem {
  date: string;
  count: number;
}

/**
 * 数据分析响应数据
 * @api POST /api/gulou-face/analysis
 * @property list - 时间序列数据列表
 * @property totalPersons - 出现总人数
 * @property totalAppearances - 出现总人次数
 * @property maleCount - 男性人数
 * @property femaleCount - 女性人数
 * @property locationCount - 预警点位数
 */
export interface AnalysisResponse {
  list: AnalysisDataItem[];
  totalPersons: number;
  totalAppearances: number;
  maleCount: number;
  femaleCount: number;
  locationCount: number;
}

/**
 * 查询数据分析数据
 * @api POST /api/gulou-face/analysis
 * @param params - 查询参数
 * @returns Promise<AnalysisResponse> - 返回分析数据
 * @example
 * 请求: { groupBy: 'day', deduplicate: true }
 * 响应: {
 *   list: [{ date: "1/1", count: 45 }, ...],
 *   totalPersons: 250,
 *   totalAppearances: 1200,
 *   maleCount: 150,
 *   femaleCount: 100,
 *   locationCount: 15
 * }
 */
export const fetchAnalysisData = async (params: AnalysisParams): Promise<AnalysisResponse> => {
  const res = await api.post<AnalysisResponse>('/api/gulou-face/analysis', params);
  return res as unknown as AnalysisResponse;
};

export default api;
