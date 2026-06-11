export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
  orderBy: { [key: string]: 'asc' | 'desc' };
}

export function buildPagination(params: PaginationParams): PaginationResult {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = (params.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    page,
    pageSize,
    orderBy: { [sortBy]: sortOrder }
  };
}
