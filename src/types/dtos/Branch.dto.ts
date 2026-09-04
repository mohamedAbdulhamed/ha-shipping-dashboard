import { Branch } from "@/entities/Order";

export interface FetchBranchesResponse {
  id: Branch["id"];
  name: Branch["name"];
  createdAt: Branch["createdAt"];
  isActive: Branch["isActive"];
}

export interface CreateBranchRequest {
  name: Branch["name"];
}
