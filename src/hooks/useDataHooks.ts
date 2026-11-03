import { useQuery, UseQueryResult } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { fetchAll } from "@/services/api/entities.api";
import { PaginatedResult } from "@/types";
import { ApiUrls } from "@/common/constants";
import { FetchBranchesResponse } from "@/types/dtos/Branch.dto";
import {
  FetchAllEmployeeNames,
  FetchCustomersResponse,
  FetchRolesResponse,
} from "@/types/dtos/User.dto";
import { FetchAllowedTransitions, FetchFinancialStatusesResponse, FetchServiceTypesResponse, FetchShipmentStatusResponse } from "@/types/dtos/Order.dto";

/**
 * Custom hook to fetch branches from the API.
 * @returns {Object} An object containing:
 * - `branches`: The array of fetched branches or undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useBranches() {
  const axiosPrivate = useAxiosPrivate();
  const query: UseQueryResult<PaginatedResult<FetchBranchesResponse>> =
    useQuery({
      queryKey: ["branches"],
      queryFn: () =>
        fetchAll<FetchBranchesResponse>(axiosPrivate, ApiUrls.fetchAllBranches),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  return {
    branches: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Custom hook to fetch roles from the API.
 * @returns {Object} An object containing:
 * - `roles`: The array of fetched roles 或 undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useRoles() {
  const axiosPrivate = useAxiosPrivate();
  const query = useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      fetchAll<FetchRolesResponse>(axiosPrivate, ApiUrls.fetchAllRoles),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return {
    roles: query.data?.data,
    isLoading: query.isLoading,
  };
}

/**
 * Custom hook to fetch customers from the API.
 * @returns {Object} An object containing:
 * - `customers`: The array of fetched customers or undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useCustomers() {
  const axiosPrivate = useAxiosPrivate();
  const query = useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      fetchAll<FetchCustomersResponse>(
        axiosPrivate,
        ApiUrls.fetchAllCustomerNames
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
  return {
    customers: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Custom hook to fetch service types from the API.
 * @returns {Object} An object containing:
 * - `serviceTypes`: The array of fetched serviceTypes or undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useServiceTypes() {
  const axiosPrivate = useAxiosPrivate();
  const query = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: () =>
      fetchAll<FetchServiceTypesResponse>(
        axiosPrivate,
        ApiUrls.fetchAllServiceTypes
      ),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
  return {
    serviceTypes: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Custom hook to fetch shipment statuses from the API.
 * @returns {Object} An object containing:
 * - `shipmentStatuses`: The array of fetched shipmentStatuses or undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useShipmentStatuses() {
  const axiosPrivate = useAxiosPrivate();
  const query = useQuery({
    queryKey: ["shipmentStatuses"],
    queryFn: () =>
      fetchAll<FetchShipmentStatusResponse>(
        axiosPrivate,
        ApiUrls.fetchAllShipmentStatuses
      ),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
  return {
    shipmentStatuses: query.data?.data,
    isLoading: query.isLoading,
  };
}

/**
 * Custom hook to fetch financial statuses from the API.
 * @returns {Object} An object containing:
 * - `financialStatuses`: The array of fetched financial statuses or undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useFinancialStatuses() {
  const axiosPrivate = useAxiosPrivate();
  const query = useQuery({
    queryKey: ["financialStatuses"],
    queryFn: () =>
      fetchAll<FetchFinancialStatusesResponse>(
        axiosPrivate,
        ApiUrls.fetchAllFinancialStatuses
      ),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
  return {
    financialStatuses: query.data?.data,
    isLoading: query.isLoading,
  };
}

/**
 * Custom hook to fetch employees from the API.
 * @returns {Object} An object containing:
 * - `employees`: The array of fetched employees or undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useEmployees() {
  const axiosPrivate = useAxiosPrivate();
  const query = useQuery({
    queryKey: ["employees"],
    queryFn: () =>
      fetchAll<FetchAllEmployeeNames>(
        axiosPrivate,
        ApiUrls.fetchAllEmployeeNames
      ),
    staleTime: 15 * 60 * 1000,
    gcTime: 45 * 60 * 1000,
  });
  return {
    employees: query.data?.data,
    isLoading: query.isLoading,
  };
}

/**
 * Custom hook to fetch allowed transitions for an order from the API.
 * @param orderId
 * @returns {Object} An object containing:
 * - `allowedTransitions`: The array of fetched allowed transitions or undefined if not loaded.
 * - `isLoading`: A boolean indicating if the data is still loading.
 */
export function useAllowedTransitions({ orderId }: { orderId: string }) {
  const axiosPrivate = useAxiosPrivate();
  const query = useQuery({
    queryKey: ["allowedTransitions", orderId],
    enabled: !!orderId,
    queryFn: () =>
      fetchAll<FetchAllowedTransitions>(
        axiosPrivate,
        `${ApiUrls.fetchAllowedTransitions}${orderId}`
      ),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  return {
    allowedTransitions: query.data?.data,
    isLoading: query.isLoading,
  };
}
