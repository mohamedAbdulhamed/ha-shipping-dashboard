import { ROLES } from "../types";
import Order, { Branch, OrderStatusHistory } from "./Order";

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Application User
export default interface User {
  id: string;
  phoneNumber: string;
  fullName: string; // max length: 100
  governorate: string;
  city: string;
  address: string;
  membershipCode: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;

  branchId: Branch['id'];
  branch: Branch;
  orders?: Order[];
  orderStatusHistories?: OrderStatusHistory[];

  refreshToken?: string;
  refreshTokenExpiryTime: Date;
};

// export class User {
//   constructor(
//     public id: string,
//     public email: string,
//     private passwordHash: string
//   ) {}
  
//   validatePassword(input: string): boolean {
//     // Business logic
//   }
 // Domain logic
  // hasPermission(permission: string): boolean {
  //   return this.role.permissions.includes(permission);
//  }
// }