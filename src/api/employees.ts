import apiClient from "./axios";
import { Employee, CreateEmployeeData, UpdateEmployeeData, ApiSuccessResponse, MenuLinks, UpdatePasswordData } from "../types";

interface EmployeeFilters {
  departmentId?: number;
  roleId?: number;
  managerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const employeesApi = {
  getAll: async (filters?: EmployeeFilters): Promise<ApiSuccessResponse<Employee[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Employee[]>>("/employees", { params: filters });
    return response.data;
  },
  getMenu: async (): Promise<ApiSuccessResponse<MenuLinks[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<MenuLinks[]>>("/employees/menu");
    return response.data;
  },

  getById: async (id: number | string): Promise<ApiSuccessResponse<Employee>> => {
    const response = await apiClient.get<ApiSuccessResponse<Employee>>(`/employees/${id}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<ApiSuccessResponse<Employee>> => {
    const response = await apiClient.get<ApiSuccessResponse<Employee>>(`/employees/by-employee-id/${employeeId}`);
    return response.data;
  },

  create: async (data: CreateEmployeeData): Promise<ApiSuccessResponse<Employee>> => {
    const response = await apiClient.post<ApiSuccessResponse<Employee>>("/employees", data);
    return response.data;
  },

  update: async (id: number | string, data: UpdateEmployeeData): Promise<ApiSuccessResponse<Employee>> => {
    const response = await apiClient.patch<ApiSuccessResponse<Employee>>(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  // Get subordinates (for managers)
  getSubordinates: async (managerId: string): Promise<ApiSuccessResponse<Employee[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Employee[]>>(`/employees/${managerId}/subordinates`);
    return response.data;
  },

  // Get managers (for assignment dropdown)
  getManagers: async (): Promise<ApiSuccessResponse<Employee[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Employee[]>>("/employees/managers");
    return response.data;
  },

  updatePassword: async (data: UpdatePasswordData): Promise<ApiSuccessResponse<{ id: string }>> => {
    const response = await apiClient.patch<ApiSuccessResponse<{ id: string }>>("/employees/update-password", data);
    return response.data;
  },
};
