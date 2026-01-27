import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "../../api/employees";
import { Button, Input, toast } from "../../components/ui";
import { ErrorType } from "../auth/LoginPage"; // Reusing ErrorType for consistency
import { useAuthStore } from "../../stores/authStore";

export function UpdatePasswordPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const navigate = useNavigate();

  const updatePasswordMutation = useMutation({
    mutationFn: employeesApi.updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      useAuthStore.getState().updateUser({
        ...useAuthStore.getState().user!,
        passwordUpdated: true,
      });
      navigate("/dashboard");
    },
    onError: (error: ErrorType) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: formData.currentPassword || undefined,
      newPassword: formData.newPassword,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Update Password</h2>
        <p className="text-neutral-500 mb-8">Ensure your account is using a long, random password to stay secure.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Current Password" type={showPasswords ? "text" : "password"} name="currentPassword" placeholder="••••••••" value={formData.currentPassword} onChange={handleChange} helperText="Leave blank if not required by your account settings" />

          <Input label="New Password" type={showPasswords ? "text" : "password"} name="newPassword" placeholder="••••••••" value={formData.newPassword} onChange={handleChange} helperText="At least 6 characters" />

          <Input label="Confirm New Password" type={showPasswords ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />

          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <input type="checkbox" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            Show passwords
          </label>

          <div className="flex gap-4 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/dashboard")} disabled={updatePasswordMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={updatePasswordMutation.isPending}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
