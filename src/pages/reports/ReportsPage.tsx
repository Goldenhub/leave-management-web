import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader } from "../../components/ui/Card";
import { PageLoader } from "../../components/ui/Spinner";
import { departmentsApi, employeesApi, leaveTypesApi, leavesApi } from "../../api";
import { LeaveStatus } from "../../types";

export default function ReportsPage() {
  const { data: departmentsData, isLoading: deptsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentsApi.getAll,
  });

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: employeesApi.getAllWithoutFilter,
  });
  const { data: leaveTypesData, isLoading: typesLoading } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: leaveTypesApi.getAll,
  });
  const { data: leavesData, isLoading: leavesLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: leavesApi.getAllWithoutFilter,
  });

  const loading = deptsLoading || employeesLoading || typesLoading || leavesLoading;

  const leaves = leavesData?.data;
  console.log(leaves);
  const totalLeaves = leaves?.length;
  const pendingLeaves = leaves?.filter((l) => l.status === LeaveStatus.Pending).length;
  const approvedLeaves = leaves?.filter((l) => l.status === LeaveStatus.Approved).length;
  const rejectedLeaves = leaves?.filter((l) => l.status === LeaveStatus.Rejected).length;
  const canceledLeaves = leaves?.filter((l) => l.status === LeaveStatus.Canceled).length;

  if (loading) return <PageLoader message="Loading report..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Departments" subtitle="Total departments" />
          <div className="text-3xl font-bold text-neutral-900">{departmentsData?.data?.length}</div>
        </Card>

        <Card>
          <CardHeader title="Employees" subtitle="Total employees" />
          <div className="text-3xl font-bold text-neutral-900">{employeesData?.data?.length}</div>
        </Card>

        <Card>
          <CardHeader title="Leave Types" subtitle="Total leave types" />
          <div className="text-3xl font-bold text-neutral-900">{leaveTypesData?.data?.length}</div>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader title="Leaves" subtitle="Summary by status" />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-neutral-50 border border-neutral-100">
              <p className="text-sm text-neutral-500">Total</p>
              <p className="text-2xl font-semibold">{totalLeaves}</p>
            </div>

            <div className="p-4 rounded-md bg-amber-50 border border-amber-100">
              <p className="text-sm text-neutral-500">Pending</p>
              <p className="text-2xl font-semibold">{pendingLeaves}</p>
            </div>

            <div className="p-4 rounded-md bg-green-50 border border-green-100">
              <p className="text-sm text-neutral-500">Approved</p>
              <p className="text-2xl font-semibold">{approvedLeaves}</p>
            </div>

            <div className="p-4 rounded-md bg-red-50 border border-red-100">
              <p className="text-sm text-neutral-500">Rejected</p>
              <p className="text-2xl font-semibold">{rejectedLeaves}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-md bg-neutral-50 border border-neutral-100">
              <p className="text-sm text-neutral-500">Canceled</p>
              <p className="text-2xl font-semibold">{canceledLeaves}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
