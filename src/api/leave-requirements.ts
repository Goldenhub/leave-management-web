import apiClient from './axios';
import { LeaveRequirement, CreateLeaveRequirementData } from '../types';

export const leaveRequirementsApi = {
  getAll: async (): Promise<LeaveRequirement[]> => {
    const response = await apiClient.get<LeaveRequirement[]>('/leave-requirements');
    return response.data;
  },

  getByLeaveType: async (leaveTypeId: number): Promise<LeaveRequirement[]> => {
    const response = await apiClient.get<LeaveRequirement[]>(`/leave-requirements/leave-type/${leaveTypeId}`);
    return response.data;
  },

  getById: async (id: number): Promise<LeaveRequirement> => {
    const response = await apiClient.get<LeaveRequirement>(`/leave-requirements/${id}`);
    return response.data;
  },

  create: async (data: CreateLeaveRequirementData): Promise<LeaveRequirement> => {
    const response = await apiClient.post<LeaveRequirement>('/leave-requirements', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateLeaveRequirementData>): Promise<LeaveRequirement> => {
    const response = await apiClient.patch<LeaveRequirement>(`/leave-requirements/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-requirements/${id}`);
  },
};
