import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { leaveTypesApi } from '../../api';
import { toast } from '../../components/ui';
import { ErrorType } from '../auth/LoginPage';

export const RequirementSchema = z.object({
  type: z.enum(['DOCUMENT', 'MIN_SERVICE']),
  value: z.string().min(1, 'Value is required'),
});

export const LeaveTypeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  maxDays: z.number().min(1, 'Must be at least 1 day'),
  requirements: z.array(RequirementSchema),
});

export type LeaveTypeFormData = z.infer<typeof LeaveTypeSchema>;





export default function CreateLeaveType() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveTypeFormData>({
    resolver: zodResolver(LeaveTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      maxDays: 1,
      requirements: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  });

  const LeaveMutation = useMutation({
    mutationFn: leaveTypesApi.create,
    onSuccess: () => {
          toast.success('Leave type created successfully!');
        },
        onError: (error: ErrorType) => {
          toast.error(error.response?.data?.message || 'Invalid credentials');
        },
  });

  const onSubmit = (data: LeaveTypeFormData) => {
    console.log('Leave Type Payload:', data);
    LeaveMutation.mutate(data);  
  };

  return (
    <div className="max-w-2xl mx-auto  bg-white rounded-xl  shadow-sm p-6">
      <h2 className="text-xl font-semibold text-neutral-800 mb-6">
        Create Leave Type
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* NAME */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Leave Name
          </label>
          <input
            {...register('name')}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
          />
          {errors.name && (
            <p className="text-xs text-danger-600 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* MAX DAYS */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Maximum Days
          </label>
          <input
            type="number"
            {...register('maxDays', { valueAsNumber: true })}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
          />
          {errors.maxDays && (
            <p className="text-xs text-danger-600 mt-1">
              {errors.maxDays.message}
            </p>
          )}
        </div>

        {/* REQUIREMENTS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Requirements
            </span>
            <button
              type="button"
              onClick={() =>
                append({ type: 'DOCUMENT', value: '' })
              }
              className="text-sm text-primary-600 hover:underline"
            >
              + Add Requirement
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border"
              >
                <select
                  {...register(`requirements.${index}.type`)}
                  className="rounded-lg border px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="DOCUMENT">Document</option>
                  <option value="MIN_SERVICE">Minimum Service</option>
                </select>

                <input
                  {...register(`requirements.${index}.value`)}
                  placeholder={
                    field.type === 'DOCUMENT'
                      ? 'e.g. Medical Report'
                      : 'e.g. 6 months'
                  }
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500"
                />

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-danger-500 hover:text-danger-700"
                >
                  ✕
                </button>
              </div>
            ))}

            {errors.requirements && (
              <p className="text-xs text-danger-600">
                All requirements must be filled
              </p>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            Create Leave Type
          </button>
        </div>
      </form>
    </div>
  );
}
