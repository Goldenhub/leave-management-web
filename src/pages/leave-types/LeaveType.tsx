import React from 'react';
import { NavLink } from 'react-router-dom';
import { leaveTypesApi } from '../../api';
import { useQuery } from '@tanstack/react-query';







export default function LeaveTypesTable() {


     const { data: leaveTypes, isLoading: leaveTypesLoading } = useQuery({
        queryKey: ['leaveTypes'],
        queryFn: () => leaveTypesApi.getAll(),
        // enabled: hasPemission(Permissions.LEAVE_TYPE_READ),
      });

      console.log(leaveTypesLoading)
      


      const onEdit = (id: number) => {
        // Handle edit action
        console.log('Edit leave type with ID:', id);
      }

      const onDelete = (id: number) => {  
        console.log('Delete leave type with ID:', id);
      }

      

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">
          Leave Types
        </h2>

        <NavLink
           to="/leave-types/create"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
        >
          + Create Leave Type
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50 text-neutral-600">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Description</th>
              <th className="text-left px-4 py-3">Max Days</th>
              <th className="text-left px-4 py-3">Requirements</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leaveTypes?.data?.map((leave) => (
              <tr
                key={leave.id}
                className="border-b last:border-none hover:bg-neutral-50"
              >
                <td className="px-4 py-3 font-medium text-neutral-800">
                  {leave.name}
                </td>

                <td className="px-4 py-3 text-neutral-600">
                  {leave.description}
                </td>

                <td className="px-4 py-3">
                  {leave.maxDays}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {leave.requirements?.map((req) => (
                      <span
                        key={req.id}
                        className="inline-flex w-fit items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
                      >
                        {req.type === 'DOCUMENT'
                          ? `📄 ${req.value}`
                          : `⏳ ${req.value} months`}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(leave.id)}
                      className="rounded-md border px-3 py-1 text-xs hover:bg-neutral-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(leave.id)}
                      className="rounded-md border border-danger-300 text-danger-600 px-3 py-1 text-xs hover:bg-danger-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {leaveTypes?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-neutral-500 py-8"
                >
                  No leave types created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
