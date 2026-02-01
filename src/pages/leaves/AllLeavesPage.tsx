import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { leavesApi } from "../../api/leaves";
import { leaveTypesApi } from "../../api/leave-types";
import { LeaveStatus } from "../../types";
import { Card, Select, StatusBadge, PageLoader, EmptyState, Input } from "../../components/ui";
import { differenceInBusinessDays } from "date-fns";

export function AllLeavesPage() {
  const [filters, setFilters] = useState({
    status: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
  });

  const { data: leaves, isLoading } = useQuery({
    queryKey: ["allLeaves", filters],
    queryFn: () =>
      leavesApi.getAll({
        status: (filters.status as LeaveStatus) || undefined,
        leaveTypeId: filters.leaveTypeId ? parseInt(filters.leaveTypeId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
  });

  const { data: leaveTypes } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: leaveTypesApi.getAll,
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return differenceInBusinessDays(end, start) + 1;
  };

  // Summary stats
  const stats = {
    total: leaves?.data?.length || 0,
    pending: leaves?.data?.filter((l) => l.status === LeaveStatus.Pending).length || 0,
    approved: leaves?.data?.filter((l) => l.status === LeaveStatus.Approved).length || 0,
    rejected: leaves?.data?.filter((l) => l.status === LeaveStatus.Rejected).length || 0,
  };

  if (isLoading) {
    return <PageLoader message="Loading all leaves..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">All Leave Requests</h1>
        <p className="text-neutral-500 mt-1">View and manage all employee leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-sm text-neutral-500">Total</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
        </Card>
        <Card className="text-center bg-warning-50 border-warning-100">
          <p className="text-sm text-warning-600">Pending</p>
          <p className="text-2xl font-bold text-warning-700">{stats.pending}</p>
        </Card>
        <Card className="text-center bg-success-50 border-success-100">
          <p className="text-sm text-success-600">Approved</p>
          <p className="text-2xl font-bold text-success-700">{stats.approved}</p>
        </Card>
        <Card className="text-center bg-danger-50 border-danger-100">
          <p className="text-sm text-danger-600">Rejected</p>
          <p className="text-2xl font-bold text-danger-700">{stats.rejected}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            placeholder="All Statuses"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            options={[
              { value: "", label: "All Statuses" },
              { value: LeaveStatus.Pending, label: "Pending" },
              { value: LeaveStatus.Approved, label: "Approved" },
              { value: LeaveStatus.Rejected, label: "Rejected" },
              { value: LeaveStatus.Canceled, label: "Canceled" },
            ]}
          />
          <Select placeholder="All Leave Types" value={filters.leaveTypeId} onChange={(e) => setFilters((prev) => ({ ...prev, leaveTypeId: e.target.value }))} options={[{ value: "", label: "All Leave Types" }, ...(leaveTypes?.data?.map((t) => ({ value: t.id.toString(), label: t.name })) || [])]} />
          <Input type="date" placeholder="From Date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
          <Input type="date" placeholder="To Date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
        </div>
      </Card>

      {/* Leaves Table */}
      {leaves?.data?.length ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Leave Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Dates</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {leaves.data.map((leave) => (
                  <tr key={leave.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {leave.employee?.firstName?.[0]}
                            {leave.employee?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 text-sm">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </p>
                          <p className="text-xs text-neutral-500">{leave.employee?.department?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{leave.leaveType?.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{getDaysCount(leave.startDate, leave.endDate)} day(s)</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{formatDate(leave.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No leave requests found"
            description="Adjust your filters or check back later."
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </Card>
      )}
    </div>
  );
}
