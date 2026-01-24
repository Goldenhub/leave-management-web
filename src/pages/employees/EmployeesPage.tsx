import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { rolesApi } from '../../api/roles';
import { Employee, EmploymentStatus, Gender } from '../../types';
import { 
  Button, Input, Select, Card, Modal, PageLoader, EmptyState, Badge, toast 
} from '../../components/ui';

export function EmployeesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', { search: searchQuery, departmentId: departmentFilter }],
    queryFn: () => employeesApi.getAll({ search: searchQuery, departmentId: departmentFilter ? parseInt(departmentFilter) : undefined }),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const { data: designations } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
  });

  const { data: managers } = useQuery({
    queryKey: ['managers'],
    queryFn: employeesApi.getManagers,
  });

  const deleteMutation = useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => {
      toast.success('Employee deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    },
  });

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    const config: Record<EmploymentStatus, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
      [EmploymentStatus.Active]: { variant: 'success', label: 'Active' },
      [EmploymentStatus.Suspended]: { variant: 'danger', label: 'Suspended' },
      [EmploymentStatus.Terminated]: { variant: 'neutral', label: 'Terminated' },
    };
    const c = config[status] || { variant: 'neutral', label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (isLoading) {
    return <PageLoader message="Loading employees..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Employees</h1>
          <p className="text-neutral-500 mt-1">Manage your organization's employees</p>
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="w-full sm:w-48">
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
        </div>
      </Card>

      {/* Employee List */}
      {employees?.data?.length ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reports To
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {employees.data.map((employee) => (
                  <tr key={employee.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-xs font-mono text-neutral-400 uppercase">{employee.employeeId}</p>
                          <p className="text-xs text-neutral-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-neutral-900">{employee.designation?.title || '-'}</p>
                      <p className="text-xs text-neutral-500">{employee.department?.name || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {employee.manager ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-neutral-900">{employee.manager.firstName} {employee.manager.lastName}</span>
                          <span className="text-xs text-neutral-500">{employee.manager.designation?.title}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(employee.employmentStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                          className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No employees found"
            description={searchQuery || departmentFilter ? 'Try adjusting your filters.' : 'Get started by adding your first employee.'}
            action={
              !searchQuery && !departmentFilter
                ? { label: 'Add Employee', onClick: () => setIsModalOpen(true) }
                : undefined
            }
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        </Card>
      )}

      {/* Employee Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        departments={departments || []}
        roles={roles || []}
        designations={designations || []}
        managers={managers || []}
      />
    </div>
  );
}

// Employee Form Modal Component
function EmployeeFormModal({
  isOpen,
  onClose,
  employee,
  departments,
  roles,
  designations,
  managers,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  departments: any[];
  roles: any[];
  designations: any[];
  managers: any[];
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    password: '',
    phone: employee?.phone || '',
    gender: employee?.gender || Gender.Male,
    dateOfBirth: employee?.dateOfBirth?.split('T')[0] || '',
    employmentDate: employee?.employmentDate?.split('T')[0] || '',
    departmentId: employee?.departmentId || '',
    designationId: employee?.designationId || '',
    roleId: employee?.roleId || '',
    managerId: employee?.managerId || '',
    employmentStatus: employee?.employmentStatus || EmploymentStatus.Active,
  });

  const createMutation = useMutation({
    mutationFn: employeesApi.create,
    onSuccess: () => {
      toast.success('Employee created successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => employeesApi.update(id, data),
    onSuccess: () => {
      toast.success('Employee updated successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.departmentId || !formData.roleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      ...formData,
      departmentId: parseInt(formData.departmentId as string),
      roleId: parseInt(formData.roleId as string),
      designationId: parseInt(formData.designationId as string),
      managerId: formData.managerId || undefined,
    };

    if (employee) {
      const { password, ...updateData } = payload;
      updateMutation.mutate({ id: employee.id, data: updateData });
    } else {
      if (!formData.password) {
        toast.error('Password is required for new employees');
        return;
      }
      createMutation.mutate(payload as any);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Filter designations by selected department
  const filteredDesignations = formData.departmentId
    ? designations.filter(d => d.departmentId === parseInt(formData.departmentId as string))
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add Employee'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {!employee && (
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: Gender.Male, label: 'Male' },
              { value: Gender.Female, label: 'Female' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hire Date"
            type="date"
            name="employmentDate"
            value={formData.employmentDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Department"
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            required
            options={[
              { value: '', label: 'Select department' },
              ...departments.map(d => ({ value: d.id.toString(), label: d.name })),
            ]}
          />
          <Select
            label="Designation"
            name="designationId"
            value={formData.designationId}
            onChange={handleChange}
            required
            disabled={!formData.departmentId}
            options={[
              { value: '', label: 'Select designation' },
              ...filteredDesignations.map(d => ({ value: d.id.toString(), label: d.title })),
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Role"
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            required
            options={[
              { value: '', label: 'Select role' },
              ...roles.map(r => ({ value: r.id.toString(), label: r.name })),
            ]}
          />
          <Select
            label="Manager"
            name="managerId"
            value={formData.managerId}
            onChange={handleChange}
            options={[
              { value: '', label: 'None (Top Level)' },
              ...managers
                .filter(m => m.id !== employee?.id) // Prevent self-manager
                .map(m => ({ value: m.employeeId, label: `${m.firstName} ${m.lastName} (${m.designation?.title})` })),
            ]}
          />
        </div>

        {employee && (
          <Select
            label="Status"
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
            options={[
              { value: EmploymentStatus.Active, label: 'Active' },
              { value: EmploymentStatus.Suspended, label: 'Suspended' },
              { value: EmploymentStatus.Terminated, label: 'Terminated' },
            ]}
          />
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            {employee ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
