import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leavesApi } from "../../api/leaves";
import { leaveTypesApi } from "../../api/leave-types";
import { ApiError, RequirementType } from "../../types";
import { Button, Input, Select, Textarea, Card, toast, PageLoader } from "../../components/ui";
import { AxiosError } from "axios";

export function LeaveApplyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  // Fetch leave types
  const { data: leaveTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: leaveTypesApi.getAll,
  });

  // Fetch balances to show remaining days
  const { data: balances } = useQuery({
    queryKey: ["leaveBalances"],
    queryFn: () => leavesApi.getBalances(),
  });

  const createLeaveMutation = useMutation({
    mutationFn: (data: { leaveTypeId: string; startDate: string; endDate: string; reason: string }) => leavesApi.create(data, attachments.length > 0 ? attachments : undefined),
    onSuccess: () => {
      toast.success("Leave request submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["myLeaves"] });
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      navigate("/leaves");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to submit leave request");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (fileName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const file = files[0];
    const renamedFile = new File([file], `${fileName}`, { type: file.type });
    setAttachments((prev) => [...prev, ...[renamedFile]]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    // Check if document is required but not uploaded
    const selectedType = leaveTypes?.data?.find((t) => t.id === parseInt(formData.leaveTypeId));
    const hasDocumentRequirement = selectedType?.requirements?.some((r) => r.type === RequirementType.DOCUMENT);

    if (hasDocumentRequirement && attachments.length === 0) {
      toast.error("This leave type requires document upload");
      return;
    }

    createLeaveMutation.mutate({
      leaveTypeId: formData.leaveTypeId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
    });
  };

  const getDaysCount = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const selectedType = leaveTypes?.data?.find((t) => t.id === parseInt(formData.leaveTypeId));
  const selectedBalance = balances?.data?.find((b) => b.leaveTypeId === parseInt(formData.leaveTypeId));
  const daysRequested = getDaysCount();
  const hasDocumentRequirement = selectedType?.requirements?.some((r) => r.type === RequirementType.DOCUMENT);

  if (typesLoading) {
    return <PageLoader message="Loading leave types..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Apply for Leave</h1>
        <p className="text-neutral-500 mt-1">Submit a new leave request</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <Select
            label="Leave Type"
            name="leaveTypeId"
            value={formData.leaveTypeId}
            onChange={handleChange}
            placeholder="Select leave type"
            options={
              leaveTypes?.data?.map((type) => ({
                value: type.id.toString(),
                label: `${type.name}${type.maxDays ? ` (max ${type.maxDays} days)` : ""}`,
              })) || []
            }
          />

          {/* Balance info */}
          {selectedBalance && (
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Available Balance</span>
                <span className="text-lg font-semibold text-primary-700">{selectedBalance.remainingDays} days</span>
              </div>
              {/* {selectedBalance.pending > 0 && <p className="text-xs text-primary-600 mt-1">({selectedBalance.pending} days pending approval)</p>} */}
            </div>
          )}

          {/* Requirements info */}
          {selectedType?.requirements && selectedType.requirements.length > 0 && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-warning-800 mb-2">Requirements for {selectedType.name}</h4>
              <ul className="space-y-1">
                {selectedType.requirements.map((req) => (
                  <li key={req.value} className="text-sm text-warning-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                    {req.type === RequirementType.DOCUMENT && "Document required: "}
                    {req.type === RequirementType.MIN_SERVICE && "Minimum service: "}
                    {req.value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
            <Input label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || new Date().toISOString().split("T")[0]} />
          </div>

          {/* Days summary */}
          {daysRequested > 0 && (
            <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-4">
              <span className="text-sm text-neutral-600">Total Days Requested</span>
              <span className={`text-lg font-semibold ${selectedBalance && daysRequested > selectedBalance.remainingDays ? "text-danger-600" : "text-neutral-900"}`}>
                {daysRequested} day{daysRequested > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Warning if exceeding balance */}
          {selectedBalance && daysRequested > selectedBalance.remainingDays && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-danger-800">Insufficient Balance</p>
                <p className="text-sm text-danger-700 mt-0.5">You're requesting more days than your available balance. This request may require special approval.</p>
              </div>
            </div>
          )}

          {/* Reason */}
          <Textarea label="Reason" name="reason" placeholder="Describe the reason for your leave..." value={formData.reason} onChange={handleChange} rows={4} />

          {/* Attachments */}
          {(hasDocumentRequirement || attachments.length > 0) && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Attachments {hasDocumentRequirement && <span className="text-danger-500">*</span>}</label>

              {/* File list */}
              {attachments.length > 0 && (
                <>
                  <div className="space-y-2 mb-3">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm text-neutral-700">{file.name}</span>
                          <span className="text-xs text-neutral-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button type="button" onClick={() => removeAttachment(index)} className="text-danger-500 hover:text-danger-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {selectedType?.requirements && selectedType.requirements.length > 0 && (
            <div className="bg-blue-50 border border-warning-200 rounded-lg p-4">
              <ul className="space-y-1">
                {selectedType.requirements
                  .filter((req) => req.type === "DOCUMENT")
                  .map((req) => (
                    <li>
                      {/* Upload button */}
                      <Input ref={fileInputRef} type="file" onChange={handleFileSelect(req.value)} className="hidden" accept=".pdf,.png" />
                      <div className="flex gap-6 items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          }
                        >
                          Upload {req.type === "DOCUMENT" && req.value}
                        </Button>
                        <p className="text-xs text-neutral-500 mt-1">Accepted formats: PDF, PNG</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={createLeaveMutation.isPending}>
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
