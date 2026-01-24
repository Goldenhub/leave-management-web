import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '../../api/leaves';
import { ApprovalDecision } from '../../types';
import { 
  Button, Card, Textarea, Modal, PageLoader, EmptyState, toast 
} from '../../components/ui';

export function LeaveApprovalsPage() {
  const queryClient = useQueryClient();
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    leaveId: number | null;
    action: 'approve' | 'reject' | null;
  }>({ isOpen: false, leaveId: null, action: null });
  const [comments, setComments] = useState('');

  const { data: pendingLeaves, isLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => leavesApi.getPendingApprovals(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, decision, comments }: { id: number; decision: ApprovalDecision; comments?: string }) =>
      decision === ApprovalDecision.Approved
        ? leavesApi.approve(id, { decision, comments })
        : leavesApi.reject(id, { decision, comments }),
    onSuccess: (_, variables) => {
      const action = variables.decision === ApprovalDecision.Approved ? 'approved' : 'rejected';
      toast.success(`Leave request ${action} successfully`);
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process request');
    },
  });

  const openModal = (leaveId: number, action: 'approve' | 'reject') => {
    setActionModal({ isOpen: true, leaveId, action });
    setComments('');
  };

  const closeModal = () => {
    setActionModal({ isOpen: false, leaveId: null, action: null });
    setComments('');
  };

  const handleSubmit = () => {
    if (!actionModal.leaveId || !actionModal.action) return;
    
    approveMutation.mutate({
      id: actionModal.leaveId,
      decision: actionModal.action === 'approve' ? ApprovalDecision.Approved : ApprovalDecision.Rejected,
      comments: comments || undefined,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (isLoading) {
    return <PageLoader message="Loading pending approvals..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Pending Approvals</h1>
        <p className="text-neutral-500 mt-1">
          Review and process leave requests from your team
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-warning-50 border-warning-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-warning-700">Pending</p>
              <p className="text-2xl font-bold text-warning-800">
                {pendingLeaves?.data?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Approval List */}
      {pendingLeaves?.data?.length ? (
        <div className="space-y-4">
          {pendingLeaves.data.map((leave) => (
            <Card key={leave.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Employee Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary-700">
                      {leave.employee?.firstName?.[0]}{leave.employee?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      {leave.employee?.designation?.title || leave.employee?.department?.name}
                    </p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="flex-1 lg:text-center">
                  <div className="flex items-center gap-2 lg:justify-center mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: '#6366f1' }}
                    />
                    <span className="font-medium text-neutral-900">{leave.leaveType?.name}</span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    <span className="font-medium text-neutral-700 ml-2">
                      ({getDaysCount(leave.startDate, leave.endDate)} days)
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(leave.id, 'reject')}
                    className="text-danger-600 border-danger-300 hover:bg-danger-50"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openModal(leave.id, 'approve')}
                    className="bg-success-600 hover:bg-success-700"
                  >
                    Approve
                  </Button>
                </div>
              </div>

              {/* Reason */}
              {leave.reason && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium text-neutral-700">Reason: </span>
                    {leave.reason}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No pending approvals"
            description="All team leave requests have been processed. Great job!"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </Card>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={closeModal}
        title={actionModal.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            {actionModal.action === 'approve'
              ? 'Are you sure you want to approve this leave request?'
              : 'Please provide a reason for rejecting this leave request.'}
          </p>
          
          <Textarea
            label={actionModal.action === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection'}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              actionModal.action === 'approve'
                ? 'Add any comments for the employee...'
                : 'Explain why this request is being rejected...'
            }
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant={actionModal.action === 'approve' ? 'primary' : 'danger'}
              onClick={handleSubmit}
              isLoading={approveMutation.isPending}
              className={actionModal.action === 'approve' ? 'flex-1 bg-success-600 hover:bg-success-700' : 'flex-1'}
              disabled={actionModal.action === 'reject' && !comments.trim()}
            >
              {actionModal.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
