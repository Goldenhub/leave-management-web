import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { leavesApi } from '../../api/leaves';
import { useAuthStore } from '../../stores/authStore';
import { LeaveStatus, Permissions } from '../../types';
import { Card, CardHeader, Button, StatusBadge, PageLoader, EmptyState } from '../../components/ui';

export function DashboardPage() {
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  // Fetch leave balances
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['leaveBalances'],
    queryFn: () => leavesApi.getBalances(),
  });

  // Fetch recent leaves
  const { data: recentLeaves, isLoading: leavesLoading } = useQuery({
    queryKey: ['myLeaves', { limit: 5 }],
    queryFn: () => leavesApi.getMyLeaves({ limit: 5 }),
  });


  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => leavesApi.getPendingApprovals(),
    enabled: hasPermission(Permissions.LEAVE_APPROVE),
  });

  const isLoading = balancesLoading || leavesLoading;

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-neutral-500 mt-1">
            Here's what's happening with your leave requests
          </p>
        </div>
        <Link to="/leaves/apply">
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

      {/* Leave Balance Cards */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Leave Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances?.map((balance) => (
            <Card key={balance.leaveTypeId} className="relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
                style={{ backgroundColor: '#6366f1' }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    {balance.leaveType.name}
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">
                    {balance.remaining}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    of {balance.total} days remaining
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50"
                >
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {balance.pending > 0 && (
                <p className="text-xs text-warning-600 mt-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                  {balance.pending} day(s) pending approval
                </p>
              )}
            </Card>
          )) || (
            <Card className="col-span-full">
              <EmptyState
                title="No leave balances found"
                description="Your leave balances will appear here once configured."
              />
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leave Requests */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-neutral-200">
            <CardHeader
              title="Recent Requests"
              subtitle="Your recent leave applications"
              action={
                <Link to="/leaves" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all
                </Link>
              }
            />
          </div>
          <div className="divide-y divide-neutral-100">
            {recentLeaves?.data?.length ? (
              recentLeaves.data.map((leave) => (
                <div key={leave.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">
                        {leave.leaveType?.name || 'Leave'}
                      </p>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        <span className="text-neutral-400 ml-1">
                          ({getDaysCount(leave.startDate, leave.endDate)} day(s))
                        </span>
                      </p>
                    </div>
                    <StatusBadge status={leave.status} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8">
                <EmptyState
                  title="No leave requests"
                  description="You haven't submitted any leave requests yet."
                  action={{
                    label: 'Apply for Leave',
                    onClick: () => navigate('/leaves/apply'),
                  }}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Pending Approvals (for managers) */}
        {hasPermission(Permissions.LEAVE_APPROVE) && (
          <Card padding="none">
            <div className="px-6 py-4 border-b border-neutral-200">
              <CardHeader
                title="Pending Approvals"
                subtitle="Team leave requests awaiting your approval"
                action={
                  <Link to="/approvals" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all
                  </Link>
                }
              />
            </div>
            <div className="divide-y divide-neutral-100">
              {approvalsLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full" />
                </div>
              ) : pendingApprovals?.data?.length ? (
                pendingApprovals.data.slice(0, 5).map((leave) => (
                  <div key={leave.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {leave.employee?.firstName?.[0]}{leave.employee?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {leave.leaveType?.name} • {getDaysCount(leave.startDate, leave.endDate)} day(s)
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/approvals')}>Review</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8">
                  <EmptyState
                    title="No pending approvals"
                    description="All team leave requests have been processed."
                    icon={
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Stats for non-managers */}
        {!hasPermission(Permissions.LEAVE_APPROVE) && (
          <Card>
            <CardHeader title="Quick Stats" subtitle="Your leave summary this year" />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success-50 rounded-lg">
                <p className="text-sm text-success-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-success-700 mt-1">
                  {recentLeaves?.data?.filter(l => l.status === LeaveStatus.Approved).length || 0}
                </p>
              </div>
              <div className="p-4 bg-warning-50 rounded-lg">
                <p className="text-sm text-warning-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-warning-700 mt-1">
                  {recentLeaves?.data?.filter(l => l.status === LeaveStatus.Pending).length || 0}
                </p>
              </div>
              <div className="p-4 bg-danger-50 rounded-lg">
                <p className="text-sm text-danger-600 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-danger-700 mt-1">
                  {recentLeaves?.data?.filter(l => l.status === LeaveStatus.Rejected).length || 0}
                </p>
              </div>
              <div className="p-4 bg-neutral-100 rounded-lg">
                <p className="text-sm text-neutral-600 font-medium">Canceled</p>
                <p className="text-2xl font-bold text-neutral-700 mt-1">
                  {recentLeaves?.data?.filter(l => l.status === LeaveStatus.Canceled).length || 0}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
