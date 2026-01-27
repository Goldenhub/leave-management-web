import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leavesApi } from "../../api/leaves";
import { ApiError, LeaveStatus } from "../../types";
import { Button, Select, Card, StatusBadge, PageLoader, EmptyState, Modal, toast } from "../../components/ui";
import { AxiosError } from "axios";

export function LeaveHistoryPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);

  const { data: leaves, isLoading } = useQuery({
    queryKey: ["myLeaves", { status: statusFilter }],
    queryFn: () => leavesApi.getMyLeaves({ status: (statusFilter as LeaveStatus) || undefined }),
  });

  const cancelMutation = useMutation({
    mutationFn: leavesApi.cancel,
    onSuccess: () => {
      toast.success("Leave request canceled");
      queryClient.invalidateQueries({ queryKey: ["myLeaves"] });
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      setCancelModalOpen(false);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to cancel leave");
    },
  });

  const handleCancelClick = (id: number) => {
    setSelectedLeaveId(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (selectedLeaveId) {
      cancelMutation.mutate(selectedLeaveId);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (isLoading) {
    return <PageLoader message="Loading your leave history..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Leave History</h1>
          <p className="text-neutral-500 mt-1">View and manage your leave requests</p>
        </div>
        <Link to="/my-leaves/apply">
          <Button
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Apply for Leave
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: LeaveStatus.Pending, label: "Pending" },
                { value: LeaveStatus.Approved, label: "Approved" },
                { value: LeaveStatus.Rejected, label: "Rejected" },
                { value: LeaveStatus.Canceled, label: "Canceled" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Leave List */}
      {leaves?.data?.length ? (
        <div className="space-y-4">
          {leaves.data.map((leave) => (
            <Card key={leave.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#6366f1" }} />
                    <h3 className="font-semibold text-neutral-900">{leave.leaveType?.name || "Leave"}</h3>
                    <StatusBadge status={leave.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </span>
                    <span className="font-medium text-neutral-700">{getDaysCount(leave.startDate, leave.endDate)} day(s)</span>
                  </div>
                  {leave.reason && <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{leave.reason}</p>}
                </div>

                <div className="flex items-center gap-2">
                  {leave.status === LeaveStatus.Pending && (
                    <Button variant="ghost" size="sm" onClick={() => handleCancelClick(leave.id)} className="text-danger-600 hover:text-danger-700 hover:bg-danger-50">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No leave requests found"
            description={statusFilter ? "Try adjusting your filters." : "You haven't submitted any leave requests yet."}
            action={!statusFilter ? { label: "Apply for Leave", onClick: () => (window.location.href = "/leaves/apply") } : undefined}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </Card>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Leave Request" size="sm">
        <p className="text-neutral-600 mb-6">Are you sure you want to cancel this leave request? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
            Keep Request
          </Button>
          <Button variant="danger" onClick={confirmCancel} isLoading={cancelMutation.isPending} className="flex-1">
            Cancel Request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
