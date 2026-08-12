export interface IApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IPaginatedData<T> {
  items: T[];
  pagination: IPagination;
}

export type IPaginatedResponse<T> = IApiResponse<IPaginatedData<T>>;

export interface SuccessResponse {
  success: boolean;
  id?: string;
}

export interface ErrorDetail {
  property?: string;
  constraints?: Record<string, string>;
  message?: string;
}
