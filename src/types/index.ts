// ==========================================
// Enums (matching backend exactly)
// ==========================================

export enum LeaveStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Canceled = "Canceled",
}

export enum ApprovalDecision {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export enum EmploymentStatus {
  Active = "Active",
  Suspended = "Suspended",
  Terminated = "Terminated",
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

export enum RequirementType {
  DOCUMENT = "DOCUMENT",
  MIN_SERVICE = "MIN_SERVICE",
  OTHER = "OTHER",
}

// ==========================================
// Core Entities
// ==========================================

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string; // comma-separated list
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  designations?: Designation[];
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: number;
  title: string;
  departmentId: number;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  employeeId: string;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth: string;
  email: string;
  phone?: string;
  address?: string;
  passwordUpdated: boolean;
  employmentStatus: EmploymentStatus;
  employmentDate: string;
  terminationDate?: string;
  roleId: number;
  role?: Role;
  designationId: number;
  designation?: Designation;
  departmentId: number;
  department?: Department;
  managerId?: string;
  manager?: Employee;
  reports?: Employee[]; // employees reporting to this person
  createdAt: string;
  updatedAt: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  maxDays?: number;
  requirements?: Pick<LeaveRequirement, "type" | "value">[];
}

export interface LeaveRequirement {
  id: number;
  type: RequirementType;
  value: string;
  leaveTypeId: number;
}

export interface LeaveAttachment {
  id: number;
  leaveId: number;
  type: string; // e.g., HOSPITAL_REPORT
  url: string;
}

export interface Leave {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  employeeId: string;
  employee?: Employee;
  leaveTypeId: number;
  leaveType?: LeaveType;
  approvals?: LeaveApproval[];
  attachments?: LeaveAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveApproval {
  id: number;
  leaveId: number;
  leave?: Leave;
  approverId: string;
  approver?: Employee;
  level: number; // 1 = direct manager, 2 = manager's manager
  decision: ApprovalDecision;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: string;
  employee?: Employee;
  leaveTypeId: number;
  leaveType?: LeaveType;
  year: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Auth Types
// ==========================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdatePasswordData {
  currentPassword?: string;
  newPassword: string;
}

export interface AuthResponse {
  data: AuthUser;
  message: string;
  status: string;
}

export interface AuthUser {
  access_token: string;
  user: Employee;
}

// ==========================================
// API Types
// ==========================================

export interface PaginatedResponse<T> {
  statuscode: number;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statuscode: number;
  error?: string;
}

export interface ApiSuccessResponse<T> {
  statuscode: 200 | 201 | 204;
  message: string;
  data?: T;
}

// ==========================================
// Form Types
// ==========================================

export interface MenuLinks {
  label: string;
  icon?: string;
  permissions?: string[];
  url: string;
  subLinks?: MenuLinks[];
}

export interface CreateLeaveRequest {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: File[];
}

export interface ApproveLeaveRequest {
  approverId: string;
  decision: ApprovalDecision;
  comment?: string;
}

export interface CreateEmployeeData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  address?: string;
  dateOfBirth: string;
  employmentDate: string;
  roleId: number;
  departmentId: number;
  designationId: number;
  managerId?: string;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  employmentStatus?: EmploymentStatus;
}

export interface CreateDesignationData {
  title: string;
  departmentId: number;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
}

export interface CreateLeaveTypeData {
  name: string;
  description?: string;
  maxDays?: number;
}

export interface CreateLeaveRequirementData {
  type: RequirementType;
  value: string;
  leaveTypeId: number;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string;
}

// ==========================================
// Permission Constants (matching backend)
// ==========================================

export const Permissions = {
  // Department
  DEPARTMENT_CREATE: "department:create",
  DEPARTMENT_READ: "department:read",
  DEPARTMENT_VIEW: "department:view",
  DEPARTMENT_UPDATE: "department:update",
  DEPARTMENT_DELETE: "department:delete",
  DEPARTMENT_MANAGE: "department:manage",

  // Employee
  EMPLOYEE_CREATE: "employee:create",
  EMPLOYEE_READ: "employee:read",
  EMPLOYEE_VIEW: "employee:view",
  EMPLOYEE_UPDATE: "employee:update",
  EMPLOYEE_DELETE: "employee:delete",
  EMPLOYEE_MANAGE: "employee:manage",

  // Role
  ROLE_CREATE: "role:create",
  ROLE_READ: "role:read",
  ROLE_VIEW: "role:view",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  ROLE_ASSIGN_PERMISSIONS: "role:assignPermissions",
  ROLE_MANAGE: "role:manage",

  // Profile
  PROFILE_VIEW: "profile:view",
  PROFILE_UPDATE: "profile:update",

  // Leave
  LEAVE_CREATE: "leave:create",
  LEAVE_READ: "leave:read",
  LEAVE_VIEW: "leave:view",
  LEAVE_UPDATE: "leave:update",
  LEAVE_DELETE: "leave:delete",
  LEAVE_APPROVE: "leave:approve",
  LEAVE_MANAGE: "leave:manage",

  // Leave Type
  LEAVE_TYPE_CREATE: "leaveType:create",
  LEAVE_TYPE_READ: "leaveType:read",
  LEAVE_TYPE_VIEW: "leaveType:view",
  LEAVE_TYPE_UPDATE: "leaveType:update",
  LEAVE_TYPE_DELETE: "leaveType:delete",
  LEAVE_TYPE_MANAGE: "leaveType:manage",

  // Report
  REPORT_CREATE: "report:create",
  REPORT_READ: "report:read",
  REPORT_VIEW: "report:view",
  REPORT_UPDATE: "report:update",
  REPORT_DELETE: "report:delete",
  REPORT_MANAGE: "report:manage",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// Helper to get all permissions for a module
export const getModulePermissions = (module: string): string[] => {
  return Object.values(Permissions).filter((p) => p.startsWith(`${module}:`));
};
