import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "../../api/roles";
import { Role, ApiError, UpdateRoleData } from "../../types";
import { Button, Input, Card, Modal, PageLoader, EmptyState, Textarea, toast } from "../../components/ui";
import { AxiosError } from "axios";
import { permissionsApi } from "../../api/permissions";

export function RolesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", permissions: [] as string[] });

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.getAll,
  });

  const { data: allPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      toast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      closeModal();
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to create role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleData }) => rolesApi.update(id, data),
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["roles", "permissions"] });
      closeModal();
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rolesApi.delete,
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message || "Failed to delete role");
    },
  });

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions?.split(",").filter(Boolean) || [],
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "", permissions: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData({ name: "", description: "", permissions: [] });
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission) ? prev.permissions.filter((p) => p !== permission) : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions.join(","),
    };

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteMutation.mutate(Number(id));
    }
  };

  // Group permissions by module
  const permissionGroups: Record<string, string[]> = {};
  allPermissions?.data?.forEach((perm) => {
    const [module] = perm.split(":");
    if (!permissionGroups[module]) {
      permissionGroups[module] = [];
    }
    permissionGroups[module].push(perm);
  });
  console.log(permissionGroups);

  if (isLoading) {
    return <PageLoader message="Loading roles..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Roles & Permissions</h1>
          <p className="text-neutral-500 mt-1">Manage access control for your organization</p>
        </div>
        <Button
          onClick={() => openModal()}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Role
        </Button>
      </div>

      {/* Roles Grid */}
      {roles?.data?.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.data.map((role) => {
            const perms = role.permissions?.split(",").filter(Boolean) || [];
            return (
              <Card key={role.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{role.name}</h3>
                      {role.description && <p className="text-sm text-neutral-500">{role.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openModal(role)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(role.id.toString())} className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {perms.slice(0, 5).map((p) => (
                    <span key={p} className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 rounded">
                      {p}
                    </span>
                  ))}
                  {perms.length > 5 && <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">+{perms.length - 5} more</span>}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState title="No roles found" description="Get started by creating your first role." action={{ label: "Add Role", onClick: () => openModal() }} />
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRole ? "Edit Role" : "Add Role"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Manager" required />
          <Textarea label="Description (Optional)" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Brief description of this role" rows={2} />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Permissions</label>
            <div className="space-y-4">
              {Object.entries(permissionGroups).map(([module, perms]) => (
                <div key={module} className="border border-neutral-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-neutral-900 capitalize mb-2">{module.replace("-", " ")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((p) => {
                      const action = p.split(":")[1];
                      const isSelected = formData.permissions.includes(p);
                      return (
                        <button key={p} type="button" onClick={() => togglePermission(p)} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${isSelected ? "bg-primary-100 text-primary-700 border border-primary-300" : "bg-neutral-100 text-neutral-600 border border-transparent hover:bg-neutral-200"}`}>
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingRole ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
