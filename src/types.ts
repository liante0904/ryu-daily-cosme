export interface ApiResult {
  message?: string;
  error?: string;
  detail?: string;
  [key: string]: unknown;
}
