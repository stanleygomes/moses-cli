import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { AsyncUtil } from './async.util.js';

export class HttpUtil {
  private readonly client: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.client = axios.create({
      timeout: 15000,
      ...config,
    });
  }

  async get<T>(url: string, retries = 2, config?: AxiosRequestConfig): Promise<T> {
    const response = await AsyncUtil.withRetry(() => this.client.get<T>(url, config), retries);
    return response.data;
  }

  static isHttpError(error: unknown): boolean {
    return axios.isAxiosError(error);
  }

  static getStatus(error: unknown): number | undefined {
    return axios.isAxiosError(error) ? error.response?.status : undefined;
  }
}
