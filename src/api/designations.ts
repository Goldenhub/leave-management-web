import apiClient from './axios';
import { Designation, CreateDesignationData } from '../types';

export const designationsApi = {
  getAll: async (): Promise<Designation[]> => {
    const response = await apiClient.get<Designation[]>('/designations');
    return response.data;
  },

  getByDepartment: async (departmentId: number): Promise<Designation[]> => {
    const response = await apiClient.get<Designation[]>(`/designations/department/${departmentId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Designation> => {
    const response = await apiClient.get<Designation>(`/designations/${id}`);
    return response.data;
  },

  create: async (data: CreateDesignationData): Promise<Designation> => {
    const response = await apiClient.post<Designation>('/designations', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateDesignationData>): Promise<Designation> => {
    const response = await apiClient.patch<Designation>(`/designations/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/designations/${id}`);
  },
};
