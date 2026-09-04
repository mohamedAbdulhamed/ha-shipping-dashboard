import type { QueryClient } from '@tanstack/react-query';
import User from '../entities/User';
import { GridPaginationModel } from "@mui/x-data-grid-premium";
import { GridFilters } from '@/hooks/useGrid';


export interface AppRootProps {
  queryClient: QueryClient;
}

export const ROLES = {
  ADMIN: "Admin",
  OPERATION: "Operation",
  COMPANY: "Company",
  REPRESENT: "Courier", // Representative
  SENDER: "Sender"
} as const;

export const HEADER_HEIGHT = 80;
export const FOOTER_HEIGHT = 80;
export const APPBAR_HEIGHT = 30;
export const SIDEBAR_WIDTH = 270;
export const SIDEBAR_WIDTH_COLLAPSED = 80;

export type colorsType = {
  grey: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  primary: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  greenAccent: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  redAccent: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  blueAccent: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
};

export type authObject = {
  token: string | null;
  user: User | null;
};

export type DataGridConfig = {
  /** Height of the grid container in pixels, @default 500 */
  containerHeight?: number;
  /** Minimum height of the grid container in pixels, @default 300 */
  containerMinHeight?: number;
  /** Height for the overlay in pixels, @default 300 */
  overlayHeight?: number;
  /** Row height when in list view, @default 64 */
  listViewRowHeight?: number;
  /** Default row height when not in list view, @default 52 */
  defaultRowHeight?: number;
};

export interface QueryOptions<T> {
  paginationModel?: GridPaginationModel;
  filterModel?: GridFilters<Partial<T>>;
  // sortModel?: GridSortModel;
}

export interface ApiResponse {
  Version: string;
  StatusCode: number;
  ErrorMessage: string | null;
  Result: any;
  ResponseTime: string;
  Success: boolean;
  ApiLog: {
    ApiLogEntryId: number;
    Application: string;
    User: string;
    Machine: string;
    RequestIpAddress: string;
    RequestUri: string;
    RequestMethod: string;
    RequestTimestamp: string;
    ResponseStatusCode: number;
    ResponseTimestamp: string;
    Browser: string;
    IsBrowserMobile: boolean;
  };
}

export type FlatResult<T> = T[];

export type PaginatedResult<T, Extra = Record<string, any>> = {
  data: T[];
  totalCount: number;
  totalPageCount: number;
} & Extra;

export interface FetchAllResponse<T, Extra = Record<string, any>> extends ApiResponse {
  Result: PaginatedResult<T, Extra> | FlatResult<T>;
}
