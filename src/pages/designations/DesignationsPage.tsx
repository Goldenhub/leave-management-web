import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designationsApi } from '../../api/designations';
import { departmentsApi } from '../../api/departments';
import { Designation } from '../../types';
import { Button, Input, Select, Card, Modal, PageLoader, EmptyState, toast } from '../../components/ui';

export function DesignationsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [formData, setFormData] = useState({ title: '', departmentId: '' });

  const { data: designations, isLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: designationsApi.create,
    onSuccess: () => {
      toast.success('Designation created successfully');
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create designation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => designationsApi.update(id, data),
    onSuccess: () => {
      toast.success('Designation updated successfully');
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update designation');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: designationsApi.delete,
    onSuccess: () => {
      toast.success('Designation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['designations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete designation');
    },
  });

  const openModal = (designation?: Designation) => {
    if (designation) {
      setEditingDesignation(designation);
      setFormData({ title: designation.title, departmentId: designation.departmentId.toString() });
    } else {
      setEditingDesignation(null);
      setFormData({ title: '', departmentId: departmentFilter || '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDesignation(null);
    setFormData({ title: '', departmentId: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.departmentId) {
      toast.error('Please fill in all fields');
      return;
    }

    const data = { title: formData.title, departmentId: parseInt(formData.departmentId) };

    if (editingDesignation) {
      updateMutation.mutate({ id: editingDesignation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this designation?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter designations by department
  const filteredDesignations = departmentFilter
    ? designations?.filter(d => d.departmentId === parseInt(departmentFilter))
    : designations;

  // Group designations by department
  const groupedDesignations = filteredDesignations?.reduce((acc, des) => {
    const deptId = des.departmentId;
    if (!acc[deptId]) acc[deptId] = [];
    acc[deptId].push(des);
    return acc;
  }, {} as Record<number, Designation[]>);

  if (isLoading) {
    return <PageLoader message="Loading designations..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Designations</h1>
          <p className="text-neutral-500 mt-1">Manage job titles and positions</p>
        </div>
        <Button
          onClick={() => openModal()}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Designation
        </Button>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div className="w-full sm:w-64">
          <Select
            placeholder="All Departments"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { value: '', label: 'All Departments' },
              ...(departments?.map(d => ({ value: d.id.toString(), label: d.name })) || []),
            ]}
          />
        </div>
      </Card>

      {/* Designations List */}
      {filteredDesignations?.length ? (
        <div className="space-y-6">
          {Object.entries(groupedDesignations || {}).map(([deptId, desigs]) => {
            const dept = departments?.find(d => d.id === parseInt(deptId));
            return (
              <Card key={deptId}>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{dept?.name}</h3>
                    <p className="text-sm text-neutral-500">{desigs.length} designation(s)</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {desigs.map(des => (
                    <div
                      key={des.id}
                      className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3"
                    >
                      <span className="font-medium text-neutral-800">{des.title}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal(des)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(des.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No designations found"
            description={departmentFilter ? 'No designations in this department.' : 'Get started by creating your first designation.'}
            action={!departmentFilter ? { label: 'Add Designation', onClick: () => openModal() } : undefined}
          />
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDesignation ? 'Edit Designation' : 'Add Designation'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Software Engineer"
            required
          />
          <Select
            label="Department"
            value={formData.departmentId}
            onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
            placeholder="Select department"
            options={departments?.map(d => ({ value: d.id.toString(), label: d.name })) || []}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingDesignation ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
