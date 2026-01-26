import apiClient from "./axios";
import { LeaveType, CreateLeaveTypeData, LeaveRequirement, CreateLeaveRequirementData, ApiSuccessResponse } from "../types";

export const leaveTypesApi = {
  getAll: async (): Promise<ApiSuccessResponse<LeaveType[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<LeaveType[]>>("/leave-types");
    return response.data;
  },

  getById: async (id: number): Promise<ApiSuccessResponse<LeaveType>> => {
    const response = await apiClient.get<ApiSuccessResponse<LeaveType>>(`/leave-types/${id}`);
    return response.data;
  },

  create: async (data: CreateLeaveTypeData): Promise<ApiSuccessResponse<LeaveType>> => {
    const response = await apiClient.post<ApiSuccessResponse<LeaveType>>("/leave-types", data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateLeaveTypeData>): Promise<ApiSuccessResponse<LeaveType>> => {
    const response = await apiClient.put<ApiSuccessResponse<LeaveType>>(`/leave-types/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-types/${id}`);
  },

  // Requirements management
  getRequirements: async (leaveTypeId: number): Promise<ApiSuccessResponse<LeaveRequirement[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<LeaveRequirement[]>>(`/leave-types/${leaveTypeId}/requirements`);
    return response.data;
  },

  addRequirement: async (leaveTypeId: number, data: Omit<CreateLeaveRequirementData, "leaveTypeId">): Promise<ApiSuccessResponse<LeaveRequirement>> => {
    const response = await apiClient.post<ApiSuccessResponse<LeaveRequirement>>(`/leave-types/${leaveTypeId}/requirements`, data);
    return response.data;
  },

  removeRequirement: async (leaveTypeId: number, requirementId: number): Promise<void> => {
    await apiClient.delete(`/leave-types/${leaveTypeId}/requirements/${requirementId}`);
  },
};
