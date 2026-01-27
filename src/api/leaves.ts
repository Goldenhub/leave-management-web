import apiClient from "./axios";
import { Leave, LeaveBalance, ApproveLeaveRequest, LeaveStatus, ApiSuccessResponse } from "../types";

interface LeaveFilters {
  status?: LeaveStatus;
  employeeId?: string;
  leaveTypeId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface CreateLeaveData {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export const leavesApi = {
  // Get all leaves with filters (for HR/admin)
  getAll: async (filters?: LeaveFilters): Promise<ApiSuccessResponse<Leave[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Leave[]>>("/leaves", { params: filters });
    return response.data;
  },

  // Get my leaves (for employees)
  getMyLeaves: async (filters?: LeaveFilters): Promise<ApiSuccessResponse<Leave[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Leave[]>>("/leaves/own", { params: filters });
    return response.data;
  },

  // Get pending approvals (for managers)
  getPendingApprovals: async (filters?: LeaveFilters): Promise<ApiSuccessResponse<Leave[]>> => {
    const response = await apiClient.get<ApiSuccessResponse<Leave[]>>("/leaves/pending-approvals", { params: filters });
    return response.data;
  },

  // Get single leave by ID
  getById: async (id: number): Promise<ApiSuccessResponse<Leave>> => {
    const response = await apiClient.get<ApiSuccessResponse<Leave>>(`/leaves/${id}`);
    return response.data;
  },

  // Create new leave request (with optional file attachments)
  create: async (data: CreateLeaveData, files?: File[]): Promise<ApiSuccessResponse<Leave>> => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("leaveTypeId", data.leaveTypeId.toString());
      formData.append("startDate", data.startDate);
      formData.append("endDate", data.endDate);
      formData.append("reason", data.reason);

      files.forEach((file) => {
        formData.append(`attachments`, file);
      });

      const response = await apiClient.post<ApiSuccessResponse<Leave>>("/leaves", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }

    const response = await apiClient.post<ApiSuccessResponse<Leave>>("/leaves", data);
    return response.data;
  },

  // Update leave request (only if pending)
  update: async (id: number, data: Partial<CreateLeaveData>): Promise<ApiSuccessResponse<Leave>> => {
    const response = await apiClient.patch<ApiSuccessResponse<Leave>>(`/leaves/${id}`, data);
    return response.data;
  },

  // Cancel leave request
  cancel: async (id: number): Promise<ApiSuccessResponse<Leave>> => {
    const response = await apiClient.post<ApiSuccessResponse<Leave>>(`/leaves/${id}/cancel`);
    return response.data;
  },

  // Delete leave request
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/leaves/${id}`);
  },

  // Approve leave
  approve: async (id: number, data: ApproveLeaveRequest): Promise<ApiSuccessResponse<Leave>> => {
    const response = await apiClient.post<ApiSuccessResponse<Leave>>(`/leaves/${id}/approve`, data);
    return response.data;
  },

  // Reject leave
  reject: async (id: number, data: ApproveLeaveRequest): Promise<ApiSuccessResponse<Leave>> => {
    const response = await apiClient.post<ApiSuccessResponse<Leave>>(`/leaves/${id}/reject`, data);
    return response.data;
  },

  // Get leave balances
  getBalances: async (employeeId?: string): Promise<ApiSuccessResponse<LeaveBalance[]>> => {
    const url = employeeId ? `/leaves/balances/${employeeId}` : "/leaves/balances";
    const response = await apiClient.get<ApiSuccessResponse<LeaveBalance[]>>(url);
    return response.data;
  },

  // Get team calendar (for managers)
  getTeamCalendar: async (startDate: string, endDate: string): Promise<Leave[]> => {
    const response = await apiClient.get<Leave[]>("/leaves/team-calendar", {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
