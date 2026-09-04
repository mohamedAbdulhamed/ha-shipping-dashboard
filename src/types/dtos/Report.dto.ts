import { ApiResponse } from "..";

export interface FetchProfitOrdersResponse {
  id: number;
  billOfLading: string;
  orderSerialNumber: string;
  senderName: string;
  senderGovernorate: string;
  senderCity: string;
  senderAddress: string;
  receiverName: string;
  phoneNumber1: string;
  phoneNumber2?: string;
  receiverGovernorate: string;
  receiverCity: string;
  receiverAddress: string;
  description: string;
  shippingCost: number;
  codAmount: number;
  netAmount: number;
  quantity: number;
  serviceType: string;
  financialStatus: string;
  financialCloseDate: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: string | null;
}

export interface FetchProfitReportsResponse extends ApiResponse {
  Result: {
    data: FetchProfitOrdersResponse[],
    netProfit: number;
    totalCount: number;
    totalPageCount: number;
  }
}