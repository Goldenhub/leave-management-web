import apiClient from './axios';
import { 
  Leave, 
  LeaveBalance, 
  ApproveLeaveRequest,
  PaginatedResponse,
  LeaveStatus
} from '../types';

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
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export const leavesApi = {
  // Get all leaves with filters (for HR/admin)
  getAll: async (filters?: LeaveFilters): Promise<PaginatedResponse<Leave>> => {
    const response = await apiClient.get<PaginatedResponse<Leave>>('/leaves', { params: filters });
    return response.data;
  },

  // Get my leaves (for employees)
  getMyLeaves: async (filters?: LeaveFilters): Promise<PaginatedResponse<Leave>> => {
    const response = await apiClient.get<PaginatedResponse<Leave>>('/leaves/my', { params: filters });
    return response.data;
  },

  // Get pending approvals (for managers)
  getPendingApprovals: async (filters?: LeaveFilters): Promise<PaginatedResponse<Leave>> => {
    const response = await apiClient.get<PaginatedResponse<Leave>>('/leaves/pending-approvals', { params: filters });
    return response.data;
  },

  // Get single leave by ID
  getById: async (id: number): Promise<Leave> => {
    const response = await apiClient.get<Leave>(`/leaves/${id}`);
    return response.data;
  },

  // Create new leave request (with optional file attachments)
  create: async (data: CreateLeaveData, files?: File[]): Promise<Leave> => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('leaveTypeId', data.leaveTypeId.toString());
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('reason', data.reason);
      
      files.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
      
      const response = await apiClient.post<Leave>('/leaves', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    
    const response = await apiClient.post<Leave>('/leaves', data);
    return response.data;
  },

  // Update leave request (only if pending)
  update: async (id: number, data: Partial<CreateLeaveData>): Promise<Leave> => {
    const response = await apiClient.patch<Leave>(`/leaves/${id}`, data);
    return response.data;
  },

  // Cancel leave request
  cancel: async (id: number): Promise<Leave> => {
    const response = await apiClient.post<Leave>(`/leaves/${id}/cancel`);
    return response.data;
  },

  // Delete leave request
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/leaves/${id}`);
  },

  // Approve leave
  approve: async (id: number, data: ApproveLeaveRequest): Promise<Leave> => {
    const response = await apiClient.post<Leave>(`/leaves/${id}/approve`, data);
    return response.data;
  },

  // Reject leave
  reject: async (id: number, data: ApproveLeaveRequest): Promise<Leave> => {
    const response = await apiClient.post<Leave>(`/leaves/${id}/reject`, data);
    return response.data;
  },

  // Get leave balances
  getBalances: async (employeeId?: string): Promise<LeaveBalance[]> => {
    const url = employeeId ? `/leaves/balances/${employeeId}` : '/leaves/balances';
    const response = await apiClient.get<LeaveBalance[]>(url);
    return response.data;
  },

  // Get team calendar (for managers)
  getTeamCalendar: async (startDate: string, endDate: string): Promise<Leave[]> => {
    const response = await apiClient.get<Leave[]>('/leaves/team-calendar', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
