import apiClient from './axios';
import { Employee, CreateEmployeeData, UpdateEmployeeData, PaginatedResponse } from '../types';

interface EmployeeFilters {
  departmentId?: number;
  roleId?: number;
  managerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}



export const employeesApi = {
  getAll: async (filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> => {
    const response = await apiClient.get<PaginatedResponse<Employee>>('/employees', { params: filters });
    return response.data;
  },
    getMenu: async ()=> {
    const response = await apiClient.get('/employees/menu');
    return response.data;
  },

  getById: async (id: number | string): Promise<Employee> => {
    const response = await apiClient.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<Employee> => {
    const response = await apiClient.get<Employee>(`/employees/by-employee-id/${employeeId}`);
    return response.data;
  },

  create: async (data: CreateEmployeeData): Promise<Employee> => {
    const response = await apiClient.post<Employee>('/employees', data);
    return response.data;
  },

  update: async (id: number | string, data: UpdateEmployeeData): Promise<Employee> => {
    const response = await apiClient.patch<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  // Get subordinates (for managers)
  getSubordinates: async (managerId: string): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>(`/employees/${managerId}/subordinates`);
    return response.data;
  },

  // Get managers (for assignment dropdown)
  getManagers: async (): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>('/employees/managers');
    return response.data;
  },
};
