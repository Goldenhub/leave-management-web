import apiClient from "./axios";
import { ApiSuccessResponse, CreateDepartmentData, Department, PaginatedResponse } from "../types";

export const departmentsApi = {
  getAll: async (): Promise<ApiSuccessResponse<Department[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Department[]>>("/departments");
    return response.data;
  },

  getPaginated: async (page = 1, limit = 10): Promise<PaginatedResponse<Department>> => {
    const response = await apiClient.get<PaginatedResponse<Department>>("/departments", {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApiSuccessResponse<Department>> => {
    const response = await apiClient.get<ApiSuccessResponse<Department>>(`/departments/${id}`);
    return response.data;
  },

  create: async (data: CreateDepartmentData): Promise<ApiSuccessResponse<Department>> => {
    const response = await apiClient.post<ApiSuccessResponse<Department>>("/departments", data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateDepartmentData>): Promise<ApiSuccessResponse<Department>> => {
    const response = await apiClient.put<ApiSuccessResponse<Department>>(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },
};
