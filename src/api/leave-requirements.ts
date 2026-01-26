import apiClient from "./axios";
import { LeaveRequirement, CreateLeaveRequirementData, ApiSuccessResponse } from "../types";

export const leaveRequirementsApi = {
  getAll: async (): Promise<ApiSuccessResponse<LeaveRequirement[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<LeaveRequirement[]>>("/leave-requirements");
    return response.data;
  },

  getByLeaveType: async (leaveTypeId: number): Promise<ApiSuccessResponse<LeaveRequirement[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<LeaveRequirement[]>>(`/leave-requirements/leave-type/${leaveTypeId}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiSuccessResponse<LeaveRequirement>> => {
    const response = await apiClient.get<ApiSuccessResponse<LeaveRequirement>>(`/leave-requirements/${id}`);
    return response.data;
  },

  create: async (data: CreateLeaveRequirementData): Promise<ApiSuccessResponse<LeaveRequirement>> => {
    const response = await apiClient.post<ApiSuccessResponse<LeaveRequirement>>("/leave-requirements", data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateLeaveRequirementData>): Promise<ApiSuccessResponse<LeaveRequirement>> => {
    const response = await apiClient.patch<ApiSuccessResponse<LeaveRequirement>>(`/leave-requirements/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-requirements/${id}`);
  },
};
