import {
  ApiResponse,
  FetchAllResponse,
  PaginatedResult,
  QueryOptions,
} from "@/types";
import { AxiosInstance, AxiosRequestConfig } from "axios";

export const fetchAll = async <T, Extra = Record<string, any>>(
  axiosPrivate: AxiosInstance,
  fetchUrl: string,
  axiosConfig: AxiosRequestConfig = {},
  queryOptions: QueryOptions<T> = {}
): Promise<PaginatedResult<T, Extra>> => {
  const { paginationModel, filterModel } = queryOptions;

  const params = new URLSearchParams();
  if (paginationModel) {
    params.append("pageSize", String(paginationModel.pageSize ?? 10));
    params.append("pageNumber", String((paginationModel.page ?? 0) + 1));
  }
  if (filterModel) {
    filterModel.filters.forEach((filter) => {
      params.append(filter.field, filter.value);
    });
  }

  // Call API logic here
  const response = await axiosPrivate.get<FetchAllResponse<T>>(fetchUrl, {
    params: params,
    ...axiosConfig,
  });

  const result = response.data?.Result;

  if (!result) {
    throw new Error("Invalid response structure");
  }

  if (Array.isArray(result)) {
    return {
      data: result,
      totalCount: result.length,
      totalPageCount: 1,
    } as PaginatedResult<T, Extra>;
  }

  // Assume it's already paginated
  return result as PaginatedResult<T, Extra>;
};

export const fetchById = async <T>(
  id: string | number,
  axiosPrivate: AxiosInstance,
  fetchUrl: string,
  axiosConfig: AxiosRequestConfig = {}
): Promise<T> => {
  if (!id) {
    throw new Error("ID is required");
  }

  const response = await axiosPrivate.get<ApiResponse>(
    `${fetchUrl}${id}`,
    axiosConfig
  );
  if (!response.data) throw new Error("Invalid response structure");
  return response.data.Result;
};

export const createEntity = async (
  axiosPrivate: AxiosInstance,
  createUrl: string,
  data: any,
  axiosConfig: AxiosRequestConfig = {}
): Promise<void> => {
  if (!data) {
    throw new Error("Data is required");
  }

  await axiosPrivate.post<ApiResponse>(createUrl, data, axiosConfig);
};

export const updateEntity = async <T>(
  id: string | number,
  axiosPrivate: AxiosInstance,
  updateUrl: string,
  axiosConfig: AxiosRequestConfig = {},
  data: Omit<T, "id">
): Promise<T> => {
  if (!id) {
    throw new Error("ID is required");
  }

  const response = await axiosPrivate.put<ApiResponse>(
    `${updateUrl}${id}`,
    data,
    axiosConfig
  );
  if (!response.data) throw new Error("Invalid response structure");
  return response.data.Result;
};

export const deleteEntity = async (
  id: string | number,
  axiosPrivate: AxiosInstance,
  deleteUrl: string
) => {
  if (!id) {
    throw new Error("ID is required");
  }

  const response = await axiosPrivate.delete<ApiResponse>(`${deleteUrl}${id}`);
  if (!response.data) throw new Error("Invalid response structure");
  return response.data.Result;
};

export const toggleEntityStatus = async (
  id: string | number,
  axiosPrivate: AxiosInstance,
  toggleUrl: string,
  axiosConfig: AxiosRequestConfig = {}
) => {
  if (!id) {
    throw new Error("ID is required");
  }

  const response = await axiosPrivate.patch<ApiResponse>(
    `${toggleUrl}?userId=${id}`,
    {},
    axiosConfig
  );
  if (!response.data) throw new Error("Invalid response structure");
  return response.data.Result;
};
