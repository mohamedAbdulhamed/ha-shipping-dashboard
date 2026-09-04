import { Branch } from "@/entities/Order";
import User from "@/entities/User";
import { ApiResponse } from "..";

// Sign in
export interface SignUserRequest {
  phoneNumber: User["phoneNumber"];
  password: string;
  rememberMe?: boolean;
}

export interface SignUserResponse extends ApiResponse {
  Result: {
    token: string;
    user: {
      fullName: User["fullName"];
      phoneNumber: User["phoneNumber"];
      governorate: User["governorate"];
      city: User["city"];
      address: User["address"];
      role: User["role"];
    };
  };
}

export interface RefreshTokenResponse extends ApiResponse {
  Result: {
    token: string;
    user: {
      fullName: User["fullName"];
      phoneNumber: User["phoneNumber"];
      governorate: User["governorate"];
      city: User["city"];
      address: User["address"];
      role: User["role"];
    };
  };
}

// Register
export interface CreateUserRequest {
  phoneNumber: User["phoneNumber"];
  fullName: User["fullName"];
  governorate: User["governorate"];
  city: User["city"];
  address: User["address"];
  membershipCode: User["membershipCode"];
  branchId: Branch["id"];
  password: string;
  role: string;
}

export interface CreateUserResponse extends ApiResponse {
  Result: string;
}

// Get All
export interface FetchUsersResponse {
  id: User["id"];
  fullName: User["fullName"];
  membershipCode: User["membershipCode"];
  phoneNumber: User["phoneNumber"];
  governorate: User["governorate"];
  city: User["city"];
  address: User["address"];
  isActive: User["isActive"];
  role: User["role"];
  branchId: Branch["id"];
  createdAt: User["createdAt"];
}

export interface FetchAllEmployeeNames {
  id: string;
  phoneNumber: string;
  name: string;
}

export interface FetchCustomersResponse {
  id: string;
  phoneNumber: string;
  name: string;
}

export interface FetchRolesResponse {
  id: string;
  name: string;
  normalizedName: string;
  concurrencyStamp: string | null;
}

// Get By Id
export interface FetchUserResponse extends ApiResponse {
  Result: {
    id: User["id"];
    fullName: User["fullName"];
    phoneNumber: User["phoneNumber"];
    email: string | null;
    membershipCode: User["membershipCode"];
    governorate: User["governorate"];
    city: User["city"];
    address: User["address"];
    isActive: User["isActive"];
    role: User["role"];
    createdAt: User["createdAt"];
    branchId: Branch["id"];
  };
}

// Update
export interface UpdateUserRequest {
  fullName: User["fullName"];
  phoneNumber: User["phoneNumber"];
  membershipCode: User["membershipCode"];
  branchId: Branch["id"];
}

export interface UpdateUserResponse extends ApiResponse {
  Result: string;
}
