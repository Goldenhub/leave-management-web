import apiClient from "./axios";
import { ApiSuccessResponse } from "../types";

export const permissionsApi = {
  getAll: async (): Promise<ApiSuccessResponse<string[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<string[]>>("/app/permissions");
    return response.data;
  },
};
