import apiClient from "./axios";
import { Designation, CreateDesignationData, ApiSuccessResponse } from "../types";

export const designationsApi = {
  getAll: async (): Promise<ApiSuccessResponse<Designation[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Designation[]>>("/designations");
    return response.data;
  },

  getByDepartment: async (departmentId: number): Promise<ApiSuccessResponse<Designation[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Designation[]>>(`/designations/department/${departmentId}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiSuccessResponse<Designation>> => {
    const response = await apiClient.get<ApiSuccessResponse<Designation>>(`/designations/${id}`);
    return response.data;
  },

  create: async (data: CreateDesignationData): Promise<ApiSuccessResponse<Designation>> => {
    const response = await apiClient.post<ApiSuccessResponse<Designation>>("/designations", data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateDesignationData>): Promise<ApiSuccessResponse<Designation>> => {
    const response = await apiClient.put<ApiSuccessResponse<Designation>>(`/designations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/designations/${id}`);
  },
};
