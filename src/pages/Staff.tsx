import { useState, useEffect } from 'react';
import { UserCheck, Plus, Loader2, Edit, Trash2, Mail, Phone, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { getStaff, deleteStaff, Staff as StaffType, ApiError } from '../services/api';
import { toast } from 'react-toastify';
import CreateStaffModal from '../components/CreateStaffModal';
import UpdateStaffModal from '../components/UpdateStaffModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { SkeletonCard, Skeleton } from '../components/Skeleton';
import StaffDetailsModal from '../components/StaffDetailsModal';

export default function Staff() {
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchStaff();
  }, [filterActive]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getStaff({ role: 'STAFF', isActive: filterActive });
      setStaff(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load staff');
      toast.error(apiError.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchStaff();
  };

  const handleUpdateClick = (staffMember: StaffType) => {
    setSelectedStaff(staffMember);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedStaff(null);
    fetchStaff();
  };

  const handleDeleteClick = (staffMember: StaffType) => {
    setSelectedStaff(staffMember);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;

    try {
      setDeleting(true);
      await deleteStaff(selectedStaff._id);
      toast.success('Staff deleted successfully');
      setShowDeleteDialog(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete staff');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (staffMember: StaffType) => {
    setSelectedStaffId(staffMember._id);
    setShowDetailsModal(true);
  };

  const togglePasswordVisibility = (staffId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [staffId]: !prev[staffId],
    }));
  };

  if (loading && staff.length === 0) {
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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your staff members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Staff
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setFilterActive(undefined)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterActive === undefined
              ? 'bg-slate-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterActive(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterActive === true
              ? 'bg-slate-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilterActive(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterActive === false
              ? 'bg-slate-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Staff Grid */}
      {staff.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No staff found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first staff member.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Create Staff
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((staffMember) => (
            <div
              key={staffMember._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Staff Header */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white relative">
                {staffMember.imageUrl && (
                  <div className="absolute top-4 right-4">
                    <img
                      src={staffMember.imageUrl}
                      alt={staffMember.name}
                      className="w-16 h-16 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{staffMember.name}</h3>
                  {staffMember.isActive ? (
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
                <p className="text-sm text-slate-300">{staffMember.staffId}</p>
              </div>

              {/* Staff Content */}
              <div className="p-6">
                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{staffMember.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{staffMember.mobile}</span>
                  </div>
                </div>

                {/* Salary Info */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Salary Type</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {staffMember.salaryType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Monthly Salary</span>
                    <span className="text-sm font-bold text-slate-800">
                      ₹{staffMember.salaryRate.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Password Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-700">
                        {showPassword[staffMember._id] ? staffMember.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(staffMember._id)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword[staffMember._id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(staffMember)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleUpdateClick(staffMember)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(staffMember)}
                    className="w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Staff Modal */}
      <CreateStaffModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSuccess}
      />

      {/* Update Staff Modal */}
      {selectedStaff && (
        <UpdateStaffModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedStaff(null);
          }}
          onSubmit={handleUpdateSuccess}
          staff={selectedStaff}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Staff"
        message={`Are you sure you want to delete ${selectedStaff?.name}? This action cannot be undone.`}
      />

      {/* Staff Details Modal */}
      <StaffDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStaffId('');
        }}
        staffId={selectedStaffId}
      />
    </div>
  );
}
