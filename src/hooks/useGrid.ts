import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GridPaginationModel } from "@mui/x-data-grid-premium";
import { PaginatedResult, QueryOptions } from "@/types";
import { AxiosInstance, AxiosRequestConfig } from "axios";

interface Filter<T> {
  field: (keyof T & string) | string;
  value: any;
}

export interface GridFilters<T> {
  filters: Array<Filter<T>>;
}

export function useGrid<T, Extra = Record<string, any>>(
  axiosPrivate: AxiosInstance,
  fetchUrl: string,
  queryKeyBase: string,
  fetchFn: (
    axiosPrivate: AxiosInstance,
    fetchUrl: string,
    axiosConfig: AxiosRequestConfig,
    queryOptions: QueryOptions<T>
  ) => Promise<PaginatedResult<T> & Extra>
) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });
  const [filterModel, setFilterModel] = useState<GridFilters<Partial<T>>>({
    filters: [],
  });

  const queryOptions = useMemo(
    () => ({
      paginationModel,
      filterModel,
    }),
    [paginationModel, filterModel]
  );

  const query: UseQueryResult<PaginatedResult<T> & Extra> = useQuery({
    queryKey: [queryKeyBase, queryOptions],
    queryFn: () => fetchFn(axiosPrivate, fetchUrl, {}, queryOptions),
  });

  const { data: result, ...queryMeta } = query;

  const { data = [], totalCount = 0, totalPageCount = 0, ...extras } = result || {};

  const rowCountRef = useRef(totalCount);
  const totalRowCount = useMemo(() => {
    if (totalCount !== undefined) {
      rowCountRef.current = totalCount;
    }
    return rowCountRef.current;
  }, [totalCount]);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  const handleFilterChange = useCallback((model: GridFilters<Partial<T>>) => {
    setFilterModel(model);
  }, []);

  return {
    items: data,
    isLoading: queryMeta.isLoading,
    isFetching: queryMeta.isFetching,
    error: queryMeta.error,
    refetch: queryMeta.refetch,
    totalRowCount,
    totalPageCount,
    paginationModel,
    filterModel,
    handlePaginationChange,
    handleFilterChange,
    extras: extras as Extra,
  };
}
