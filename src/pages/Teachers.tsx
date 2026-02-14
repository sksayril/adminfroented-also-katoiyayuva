import { useState, useEffect } from 'react';
import { Users, Plus, Loader2, Edit, Trash2, Mail, Phone, CheckCircle, XCircle, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { getTeachers, deleteTeacher, Teacher, ApiError } from '../services/api';
import { toast } from 'react-toastify';
import CreateTeacherModal from '../components/CreateTeacherModal';
import UpdateTeacherModal from '../components/UpdateTeacherModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { SkeletonCard, Skeleton } from '../components/Skeleton';

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTeachers();
  }, [filterActive]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getTeachers(filterActive);
      setTeachers(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load teachers');
      toast.error(apiError.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchTeachers();
  };

  const handleUpdateClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedTeacher(null);
    fetchTeachers();
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;

    try {
      setDeleting(true);
      await deleteTeacher(selectedTeacher._id);
      toast.success('Teacher deleted successfully');
      setShowDeleteDialog(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete teacher');
    } finally {
      setDeleting(false);
    }
  };

  const togglePasswordVisibility = (teacherId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case 'PER_CLASS':
        return 'Per Class';
      case 'MONTHLY_FIXED':
        return 'Monthly Fixed';
      case 'HOURLY':
        return 'Hourly';
      default:
        return type;
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton variant="text" width={200} height={32} className="mb-2" />
            <Skeleton variant="text" width={300} height={16} />
          </div>
          <Skeleton variant="rectangular" width={150} height={40} />
        </div>

        {/* Filter Skeleton */}
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={100} height={40} />
          ))}
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Teachers</h1>
              <p className="text-sm text-slate-300">
                Manage teachers and their assignments
              </p>
            </div>
          </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Teacher</span>
            </button>
          </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-1">
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilterActive(undefined)}
            className={`px-6 py-3 font-medium transition-colors relative ${
              filterActive === undefined
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>All</span>
            {filterActive === undefined && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setFilterActive(true)}
            className={`px-6 py-3 font-medium transition-colors relative ${
              filterActive === true
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>Active</span>
            {filterActive === true && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setFilterActive(false)}
            className={`px-6 py-3 font-medium transition-colors relative ${
              filterActive === false
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>Inactive</span>
            {filterActive === false && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && teachers.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchTeachers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Teachers Grid */}
      {teachers.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No teachers found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first teacher.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Create Teacher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Teacher Image/Header */}
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800">
                {teacher.imageUrl ? (
                  <img
                    src={teacher.imageUrl}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {teacher.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {teacher.teacherId}
                  </span>
                </div>
              </div>

              {/* Teacher Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{teacher.name}</h3>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{teacher.mobile}</span>
                  </div>
                </div>

                {/* Salary Info */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Salary Type</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {getSalaryTypeLabel(teacher.salaryType)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Rate</span>
                    <span className="text-sm font-bold text-slate-800">
                      ₹{teacher.salaryRate.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {teacher.currentMonthClasses !== undefined && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">This Month</span>
                        <span className="font-semibold text-slate-700">
                          {teacher.currentMonthClasses} classes
                        </span>
                      </div>
                      {teacher.currentMonthSalary !== undefined && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-600">Salary</span>
                          <span className="font-bold text-green-600">
                            ₹{teacher.currentMonthSalary.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword[teacher._id] ? 'text' : 'password'}
                      value={teacher.password}
                      readOnly
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(teacher._id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword[teacher._id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Assigned Batches */}
                {Array.isArray(teacher.assignedBatches) && teacher.assignedBatches.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Assigned Batches ({teacher.assignedBatches.length})
                    </label>
                    <div className="space-y-1">
                      {teacher.assignedBatches.slice(0, 2).map((batch, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-slate-50 px-2 py-1 rounded">
                          {typeof batch === 'object' ? batch.name : batch}
                        </div>
                      ))}
                      {teacher.assignedBatches.length > 2 && (
                        <div className="text-xs text-slate-600">
                          +{teacher.assignedBatches.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleUpdateClick(teacher)}
                    className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(teacher)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay for filter changes */}
      {loading && teachers.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
            <span className="text-slate-700">Loading teachers...</span>
          </div>
        </div>
      )}

      {/* Create Teacher Modal */}
      <CreateTeacherModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSuccess}
      />

      {/* Update Teacher Modal */}
      {selectedTeacher && (
        <UpdateTeacherModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedTeacher(null);
          }}
          onSubmit={handleUpdateSuccess}
          teacher={selectedTeacher}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedTeacher(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
