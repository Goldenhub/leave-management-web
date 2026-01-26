import apiClient from './axios';
import { Role, PaginatedResponse } from '../types';

interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string;
}

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/roles');
    return response.data;
  },

  getPaginated: async (page = 1, limit = 10): Promise<PaginatedResponse<Role>> => {
    const response = await apiClient.get<PaginatedResponse<Role>>('/roles', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: number | string ): Promise<Role> => {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (data: CreateRoleData): Promise<Role> => {
    const response = await apiClient.post<Role>('/roles', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateRoleData>): Promise<Role> => {
    const response = await apiClient.patch<Role>(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};
