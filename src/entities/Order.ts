import User from "./User";

// تسليم وتحصيل - استبدال - جلب مرتجع
export type ServiceType =
  | "DeliveryAndCollection"
  | "Replacement"
  | "ReturnPickup";

// export type FinancialStatus = "لم يتم التقفيل" | "قابل للتقفيل" | "تم التقفيل";
export enum FinancialStatus {
  NotCollected = "لم يتم التقفيل",
  Collected = "تم التقفيل",
  Collectable = "قابل للتقفيل",
}

export default interface Order {
  id: number;
  // Searchable
  billOfLading: string; // رقم البوليصه
  // Searchable
  orderSerialNumber?: string; // رقم الطلب التسلسلي

  /* Sender Details */
  // Searchable
  senderName: string; // اسم الراسل
  senderGovernorate: string;
  senderCity: string;
  senderAddress: string;

  /* Receiver Details */
  receiverName: string; // اسم عميل
  receiverGovernorate: string;
  receiverCity: string;
  receiverAddress: string;
  // Searchable
  phoneNumber1: string; // رقم موبايل أول max length: 13
  phoneNumber2?: string; // رقم موبايل ثاني (اختياري) max length: 13

  /*order details*/
  description?: string;
  codAmount: number; // مبلغ التحصيل من العميل (COD)
  shippingCost: number; // قيمه الشحن
  netAmount: number; // cod - shippingCost
  quantity: number; // العدد
  serviceType: ServiceType; // نوع الخدمة
  financialStatus: FinancialStatus;
  financialCloseDate?: Date | string; // تاريخ التقفيل

  /* Timestamps */
  createdAt?: Date | string;
  updatedAt?: Date | string;

  /* Navigations */
  createdById: User["id"];
  createdBy: User;

  // Searchable
  branchId: string; // الفرع (الاعضاء)
  branch: Branch;
  // Searchable
  orderStatusHistory: OrderStatusHistory[]; // حاله الشحنه
}

export type ShipmentStatus =
  | "OrderPickup"
  | "ReceivedPickup"
  | "NotReceivedPickup"
  | "ReceivedWarehouse"
  | "ReturnedWarehouse"
  | "InTransit"
  | "DeliveryFailure"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "طلب بيك اب"
  | "تم استلام بيك اب"
  | "لم يتم استلام بيك اب"
  | "استلام في المخزن"
  | "ارتجاع في المخزن"
  | "قيد التوصيل"
  | "فشل التسليم"
  | "تسليم ناجح"
  | "شحنه ملغاه"
  | "تم الارتجاع للراسل";

export interface OrderStatusHistory {
  id: number;
  orderId: Order["id"];
  order: Order;

  shipmentStatus: ShipmentStatus;

  responsiblePersonId: User["id"];
  responsiblePerson: User | null;

  note: string | null;
  createdAt: Date | string;
}

export interface Branch {
  id: number;
  name: string; // max length: 50, min length: 3
  createdAt: Date;
  isActive: boolean;
  users?: User[];
}
