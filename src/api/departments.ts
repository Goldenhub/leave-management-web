import apiClient from './axios';
import { Department, PaginatedResponse } from '../types';

interface CreateDepartmentData {
  name: string;
  code: string;
}

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments');
    return response.data;
  },

  getPaginated: async (page = 1, limit = 10): Promise<PaginatedResponse<Department>> => {
    const response = await apiClient.get<PaginatedResponse<Department>>('/departments', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Department> => {
    const response = await apiClient.get<Department>(`/departments/${id}`);
    return response.data;
  },

  create: async (data: CreateDepartmentData): Promise<Department> => {
    const response = await apiClient.post<Department>('/departments', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateDepartmentData>): Promise<Department> => {
    const response = await apiClient.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },
};
