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

      {/* Teachers Table */}
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
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-20 bg-slate-700">Teacher</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Salary</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Month</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Password</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Batches</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider sticky right-0 z-20 bg-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher, index) => (
                  <tr key={teacher._id} className={index % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/40 hover:bg-slate-100/70'}>
                    <td className={`px-4 py-4 align-top sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
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
                            <ImageIcon className="w-6 h-6 text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{teacher.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{teacher.teacherId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center text-sm text-slate-700">
                          <Mail className="w-4 h-4 mr-2 text-slate-500" />
                          <span className="truncate max-w-[160px]">{teacher.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-700">
                          <Phone className="w-4 h-4 mr-2 text-slate-500" />
                          <span>{teacher.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div>
                        <p className="text-xs text-slate-500">{getSalaryTypeLabel(teacher.salaryType)}</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">₹{teacher.salaryRate.toLocaleString('en-IN')}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div>
                        <p className="text-sm text-slate-700">{teacher.currentMonthClasses ?? 0} classes</p>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          ₹{(teacher.currentMonthSalary ?? 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="relative">
                        <input
                          type={showPassword[teacher._id] ? 'text' : 'password'}
                          value={teacher.password}
                          readOnly
                          className="w-full max-w-[160px] px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(teacher._id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword[teacher._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(teacher.assignedBatches) && teacher.assignedBatches.length > 0 ? (
                          <>
                            {teacher.assignedBatches.slice(0, 2).map((batch, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                                {typeof batch === 'object' ? batch.name : batch}
                              </span>
                            ))}
                            {teacher.assignedBatches.length > 2 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                +{teacher.assignedBatches.length - 2} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">No batches</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {teacher.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-4 align-top sticky right-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateClick(teacher)}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(teacher)}
                          className="px-2.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
