import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveTypesApi } from "../../api/leave-types";
import { ApiError, LeaveType, RequirementType } from "../../types";
import { Button, Input, Card, Modal, PageLoader, EmptyState, Textarea, Select, toast } from "../../components/ui";
import { ErrorType } from "../auth/LoginPage";
import { AxiosError } from "axios";

// const colorOptions = [
//   '#6366f1', // Indigo
//   '#10b981', // Green
//   '#f59e0b', // Amber
//   '#ef4444', // Red
//   '#3b82f6', // Blue
//   '#8b5cf6', // Purple
//   '#ec4899', // Pink
//   '#14b8a6', // Teal
// ];

export function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    maxDays: number;
    requirements: {
      type: RequirementType;
      value: string;
    }[];
  }>({
    name: "",
    description: "",
    maxDays: 0,
    requirements: [],
  });

  const [reqFormData, setReqFormData] = useState({
    type: RequirementType.DOCUMENT,
    value: "",
  });

  const addRequirement = () => {
    if (!reqFormData.value.trim()) return;

    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, { ...reqFormData }],
    }));

    setReqFormData({
      type: RequirementType.DOCUMENT,
      value: "",
    });
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const { data: leaveTypes, isLoading } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: leaveTypesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: leaveTypesApi.create,
    onSuccess: () => {
      toast.success("Leave type created successfully");
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      closeModal();
    },
    onError: (error: AxiosError<ApiError, unknown>) => {
      toast.error(error.response?.data?.message || "Failed to create leave type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LeaveType> }) => leaveTypesApi.update(id, data),
    onSuccess: () => {
      toast.success("Leave type updated successfully");
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
      closeModal();
    },
    onError: (error: AxiosError<ApiError, unknown>) => {
      toast.error(error.response?.data?.message || "Failed to update leave type");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leaveTypesApi.delete,
    onSuccess: () => {
      toast.success("Leave type deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["leaveTypes"] });
    },
    onError: (error: ErrorType) => {
      toast.error(error.response?.data?.message || "Failed to delete leave type");
    },
  });

  const openModal = (type?: LeaveType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || "",
        maxDays: type.maxDays || 0,
        requirements: (type.requirements ?? []).map((req) => ({
          type: req.type,
          value: req.value,
        })),
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
        maxDays: 0,
        requirements: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Leave type name is required");
      return;
    }

    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this leave type?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading leave types..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Leave Types</h1>
          <p className="text-neutral-500 mt-1">Configure the types of leave available in your organization</p>
        </div>
        <Button
          onClick={() => openModal()}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Leave Type
        </Button>
      </div>

      {/* Leave Types Grid */}
      {leaveTypes?.data?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaveTypes?.data.map((type) => (
            <Card key={type.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{type.name}</h3>
                  <p className="text-sm text-neutral-500">{type.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openModal(type)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(type.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-sm mb-6">
                <div>
                  <span className="text-neutral-500 block">Max Days</span>
                  <span className="font-semibold text-neutral-900">{type.maxDays || "Unlimited"}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Requirements</span>
                  <ul className="font-semibold text-neutral-900">
                    {type.requirements &&
                      type.requirements.length > 0 &&
                      type.requirements.map((req) => (
                        <li key={req.value} className="bg-blue-50 px-2 py-1 rounded mb-1">
                          {req.type.replace("_", " ")}: {req.value} {req.type === RequirementType.MIN_SERVICE ? "months" : ""}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState title="No leave types found" description="Get started by creating your first leave type." action={{ label: "Add Leave Type", onClick: () => openModal() }} />
        </Card>
      )}

      {/* Main Leave Type Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingType ? "Edit Leave Type" : "Add Leave Type"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Annual Leave" required />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Brief description of this leave type" rows={3} />
          <Input label="Max Days" type="number" min={0} value={formData.maxDays} onChange={(e) => setFormData((prev) => ({ ...prev, maxDays: parseInt(e.target.value) || 0 }))} />
          {/* Requirements */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-neutral-900">Requirements</h4>

            {/* Existing requirements */}
            {formData.requirements && formData.requirements.length > 0 ? (
              <ul className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <li key={req.value} className="flex items-center justify-between text-sm bg-neutral-50 rounded px-3 py-2">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 mr-2">{req.type}</span>
                      <span>{req.value}</span>
                    </div>
                    <button onClick={() => removeRequirement(index)} className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50">
                      {" "}
                      x{" "}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400 italic">No requirements defined.</p>
            )}

            {/* Add requirement */}
            <div className="grid grid-cols-3 gap-2">
              <Select
                label="Type"
                value={reqFormData.type}
                onChange={(e) =>
                  setReqFormData((prev) => ({
                    ...prev,
                    type: e.target.value as RequirementType,
                  }))
                }
                options={[
                  { value: RequirementType.DOCUMENT, label: "Document" },
                  { value: RequirementType.MIN_SERVICE, label: "Minimum Service" },
                ]}
              />

              <Input
                label="Value"
                value={reqFormData.value}
                onChange={(e) =>
                  setReqFormData((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                placeholder="e.g. 6 Months"
              />

              <Button type="button" onClick={addRequirement} className="self-end">
                Add
              </Button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingType ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
