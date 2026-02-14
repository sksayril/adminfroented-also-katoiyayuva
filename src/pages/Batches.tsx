import { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Edit, Trash2, Clock, DollarSign, Users, BookOpen, User, CheckCircle, XCircle, Filter, Eye, UserPlus } from 'lucide-react';
import { getBatches, deleteBatch, Batch, BatchesQueryParams, ApiError } from '../services/api';
import { toast } from 'react-toastify';
import CreateBatchModal from '../components/CreateBatchModal';
import UpdateBatchModal from '../components/UpdateBatchModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import BatchDetailsModal from '../components/BatchDetailsModal';
import AssignTeacherModal from '../components/AssignTeacherModal';
import { SkeletonCard, Skeleton } from '../components/Skeleton';

export default function Batches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<BatchesQueryParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedBatchForAssign, setSelectedBatchForAssign] = useState<Batch | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, [filters]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getBatches(filters);
      setBatches(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load batches');
      toast.error(apiError.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchBatches();
  };

  const handleUpdateClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedBatch(null);
    fetchBatches();
  };

  const handleDeleteClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowDeleteDialog(true);
  };

  const handleViewDetails = (batch: Batch) => {
    setSelectedBatchId(batch._id);
    setShowDetailsModal(true);
  };

  const handleAssignTeacher = (batch: Batch) => {
    setSelectedBatchForAssign(batch);
    setShowAssignTeacherModal(true);
  };

  const handleAssignTeacherSuccess = () => {
    fetchBatches();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBatch) return;

    try {
      setDeleting(true);
      await deleteBatch(selectedBatch._id);
      toast.success('Batch deleted successfully');
      setShowDeleteDialog(false);
      setSelectedBatch(null);
      fetchBatches();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete batch');
    } finally {
      setDeleting(false);
    }
  };

  const getBatchTypeColor = (type: string) => {
    switch (type) {
      case 'OFFLINE':
        return 'bg-blue-100 text-blue-700';
      case 'ONLINE':
        return 'bg-purple-100 text-purple-700';
      case 'HYBRID':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && batches.length === 0) {
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

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" height={16} className="mb-2" />
                  <Skeleton variant="text" width="40%" height={32} />
                </div>
                <Skeleton variant="circular" width={48} height={48} />
              </div>
            </div>
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
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Batches</h1>
              <p className="text-sm text-slate-300">
                Manage batches and schedules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter Batches</h3>
            <button
              onClick={() => setFilters({})}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => setFilters((prev) => ({
                  ...prev,
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kids Batch
              </label>
              <select
                value={filters.isKidsBatch === undefined ? '' : filters.isKidsBatch.toString()}
                onChange={(e) => setFilters((prev) => ({
                  ...prev,
                  isKidsBatch: e.target.value === '' ? undefined : e.target.value === 'true',
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">All Batches</option>
                <option value="true">Kids Batch</option>
                <option value="false">Regular Batch</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && batches.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchBatches}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Batches Grid */}
      {batches.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No batches found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first batch.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Create Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            const courseName = typeof batch.courseId === 'object' && batch.courseId !== null ? batch.courseId.name : 'N/A';
            const courseCategory = typeof batch.courseId === 'object' && batch.courseId !== null ? batch.courseId.courseCategory : '';
            const teacherName = typeof batch.teacherId === 'object' && batch.teacherId !== null ? batch.teacherId.name : 'N/A';
            const teacherEmail = typeof batch.teacherId === 'object' && batch.teacherId !== null ? batch.teacherId.email : '';

            return (
              <div
                key={batch._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Batch Header */}
                <div className="bg-slate-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{batch.name}</h3>
                    {batch.isActive ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Batch Content */}
                <div className="p-6">
                  {/* Time Slot */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{batch.timeSlot}</span>
                  </div>

                  {/* Weekdays */}
                  {batch.weekdays && batch.weekdays.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Weekdays:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {batch.weekdays.map((day, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
                          >
                            {day.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Info */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <BookOpen className="w-4 h-4 mr-2 text-slate-500" />
                    <div>
                      <span className="font-medium">{courseName}</span>
                      {courseCategory && (
                        <span className="text-gray-500 ml-1">({courseCategory})</span>
                      )}
                    </div>
                  </div>

                  {/* Teacher Info */}
                  {batch.teacherId === null || (typeof batch.teacherId === 'string' && batch.teacherId === '') ? (
                    <div className="mb-3">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2 text-yellow-600" />
                          <span className="text-yellow-800 font-medium">No teacher assigned</span>
                        </div>
                        <button
                          onClick={() => handleAssignTeacher(batch)}
                          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          Assign Teacher
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-lg">
                        <div className="flex items-center text-sm text-gray-700">
                          <User className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="font-medium">{teacherName}</span>
                        </div>
                        <button
                          onClick={() => handleAssignTeacher(batch)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          Change Teacher
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fee Info */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly Fee</span>
                      <span className="text-sm font-bold text-gray-800">
                        ₹{batch.monthlyFee ? batch.monthlyFee.toLocaleString('en-IN') : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Students Info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Students</span>
                      <span className="text-sm text-gray-600">
                        {batch.currentStudents} / {batch.maxStudents}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gray-400"
                        style={{
                          width: `${Math.min((batch.currentStudents / batch.maxStudents) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(batch)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleUpdateClick(batch)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(batch)}
                      className="w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading overlay for filter changes */}
      {loading && batches.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
            <span className="text-slate-700">Loading batches...</span>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      <CreateBatchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSuccess}
      />

      {/* Update Batch Modal */}
      {selectedBatch && (
        <UpdateBatchModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedBatch(null);
          }}
          onSubmit={handleUpdateSuccess}
          batch={selectedBatch}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedBatch(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Batch"
        message={`Are you sure you want to delete ${selectedBatch?.name}? This action cannot be undone.`}
      />

      {/* Batch Details Modal */}
      <BatchDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBatchId('');
        }}
        batchId={selectedBatchId}
      />

      {/* Assign Teacher Modal */}
      {selectedBatchForAssign && (
        <AssignTeacherModal
          isOpen={showAssignTeacherModal}
          onClose={() => {
            setShowAssignTeacherModal(false);
            setSelectedBatchForAssign(null);
          }}
          onSubmit={handleAssignTeacherSuccess}
          batchId={selectedBatchForAssign._id}
          batchName={selectedBatchForAssign.name}
          currentTeacherId={
            typeof selectedBatchForAssign.teacherId === 'object' && selectedBatchForAssign.teacherId !== null
              ? selectedBatchForAssign.teacherId._id
              : selectedBatchForAssign.teacherId
          }
        />
      )}
    </div>
  );
}
