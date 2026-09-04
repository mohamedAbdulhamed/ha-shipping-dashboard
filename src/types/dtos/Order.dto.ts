import Order, { Branch } from "@/entities/Order";
import User from "@/entities/User";
import { ApiResponse } from "..";

export interface FetchOrdersResponse {
  id: Order["id"];
  billOfLading: Order["billOfLading"];
  orderSerialNumber?: Order["orderSerialNumber"];

  /* Sender Details */
  senderName: Order["senderName"];
  senderGovernorate: Order["senderGovernorate"];
  senderCity: Order["senderCity"];
  senderAddress: Order["senderAddress"];

  /* Receiver Details */
  receiverName: Order["receiverName"];
  receiverGovernorate: Order["receiverGovernorate"];
  receiverCity: Order["receiverCity"];
  receiverAddress: Order["receiverAddress"];
  phoneNumber1: Order["phoneNumber1"];
  phoneNumber2?: Order["phoneNumber2"];

  /*order details*/
  description?: Order["description"];
  codAmount: Order["codAmount"];
  shippingCost: Order["shippingCost"];
  netAmount: Order["netAmount"];
  quantity: Order["quantity"];
  serviceType: Order["serviceType"];
  financialStatus: Order["financialStatus"];
  financialCloseDate: string | null;

  /* Timestamps */
  createdAt?: Order["createdAt"];
  updatedAt?: Order["updatedAt"];

  /* Navigations */
  createdById: User["id"];
  createdBy: User | null;

  branchId: string;
  branch: Branch;
  orderStatusHistory: Order["orderStatusHistory"] | null;
}

export interface FetchOrderResponse extends ApiResponse {
  Result: {
    id: Order["id"];
    billOfLading: Order["billOfLading"];
    orderSerialNumber?: Order["orderSerialNumber"];

    senderName: Order["senderName"];
    senderGovernorate: Order["senderGovernorate"];
    senderCity: Order["senderCity"];
    senderAddress: Order["senderAddress"];

    receiverName: Order["receiverName"];
    phoneNumber1: Order["phoneNumber1"];
    phoneNumber2?: Order["phoneNumber2"];
    receiverGovernorate: Order["receiverGovernorate"];
    receiverCity: Order["receiverCity"];
    receiverAddress: Order["receiverAddress"];

    description?: Order["description"];
    shippingCost: Order["shippingCost"];
    codAmount: Order["codAmount"];
    quantity: Order["quantity"];
    serviceType: Order["serviceType"];

    createdAt?: Order["createdAt"];
    updatedAt?: Order["updatedAt"];
    createdById: Order["createdById"];
    createdBy: User | null;
    orderStatusHistory: Order["orderStatusHistory"] | null;
    shipmentStatus: string;
  };
}

export interface CreateOrderRequest {
  orderSerialNumber?: Order["orderSerialNumber"];

  /* Sender Details */
  senderId?: User["id"];
  senderName?: Order["senderName"];
  senderGovernorate?: Order["senderGovernorate"];
  senderCity?: Order["senderCity"];
  senderAddress?: Order["senderAddress"];

  /* Receiver Details */
  receiverName: Order["receiverName"];
  phoneNumber1: Order["phoneNumber1"]; // max length: 13
  phoneNumber2?: Order["phoneNumber2"]; // max length: 13
  receiverGovernorate: Order["receiverGovernorate"];
  receiverCity: Order["receiverCity"];
  receiverAddress: Order["receiverAddress"];

  /* Order Details */
  description?: Order["description"];
  shippingCost: Order["shippingCost"];
  codAmount: Order["codAmount"];
  quantity: Order["quantity"];
  serviceType: number;
  branchId: Branch["id"];
  shipWithJT?: boolean;
}

export interface UpdateOrderRequest {
  orderSerialNumber?: Order["orderSerialNumber"];

  senderName: Order["senderName"];
  senderGovernorate: Order["senderGovernorate"];
  senderCity: Order["senderCity"];
  senderAddress: Order["senderAddress"];

  receiverName: Order["receiverName"];
  phoneNumber1: Order["phoneNumber1"];
  phoneNumber2?: Order["phoneNumber2"];
  receiverGovernorate: Order["receiverGovernorate"];
  receiverCity: Order["receiverCity"];
  receiverAddress: Order["receiverAddress"];

  description?: Order["description"];
  shippingCost: Order["shippingCost"];
  codAmount: Order["codAmount"];
  quantity: Order["quantity"];
  serviceType: number;
}

export interface UpdateOrderResponse extends ApiResponse {
  Result: string;
}

// export interface FetchAllResponse<T> extends ApiResponse {

export interface FetchServiceTypesResponse {
  id: number;
  name: string;
}

export interface FetchShipmentStatusResponse {
  id: number;
  name: string;
}

export interface FetchFinancialStatusesResponse {
  id: number;
  name: string;
}

export interface FetchAllowedTransitions {
  value: number;
  name: string;
}

export interface AddOrderStatusRequest {
  orderId: number;
  shipmentStatus: number;
  responsiblePersonId: string;
  note: string;
}
