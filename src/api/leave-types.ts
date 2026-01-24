import apiClient from './axios';
import { LeaveType, CreateLeaveTypeData, LeaveRequirement, CreateLeaveRequirementData,  } from '../types';

export const leaveTypesApi = {
  getAll: async (): Promise<LeaveType> => {
    const response = await apiClient.get<LeaveType>('/leave-types');
    return response.data;
  },

  getById: async (id: number): Promise<LeaveType> => {
    const response = await apiClient.get<LeaveType>(`/leave-types/${id}`);
    return response.data;
  },

  create: async (data: CreateLeaveTypeData): Promise<LeaveType> => {
    const response = await apiClient.post<LeaveType>('/leave-types', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateLeaveTypeData>): Promise<LeaveType> => {
    const response = await apiClient.patch<LeaveType>(`/leave-types/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-types/${id}`);
  },

  // Requirements management
  getRequirements: async (leaveTypeId: number): Promise<LeaveRequirement[]> => {
    const response = await apiClient.get<LeaveRequirement[]>(`/leave-types/${leaveTypeId}/requirements`);
    return response.data;
  },

  addRequirement: async (leaveTypeId: number, data: Omit<CreateLeaveRequirementData, 'leaveTypeId'>): Promise<LeaveRequirement> => {
    const response = await apiClient.post<LeaveRequirement>(`/leave-types/${leaveTypeId}/requirements`, data);
    return response.data;
  },

  removeRequirement: async (leaveTypeId: number, requirementId: number): Promise<void> => {
    await apiClient.delete(`/leave-types/${leaveTypeId}/requirements/${requirementId}`);
  },
};
