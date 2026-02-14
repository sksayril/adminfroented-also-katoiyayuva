import { useState, useEffect } from 'react';
import { X, Loader2, Mail, Phone, DollarSign, Calendar, CheckCircle, XCircle, UserCheck, Eye, EyeOff } from 'lucide-react';
import { getStaffById, Staff as StaffType, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
}

export default function StaffDetailsModal({ isOpen, onClose, staffId }: StaffDetailsModalProps) {
  const [staff, setStaff] = useState<StaffType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen && staffId) {
      fetchStaffDetails();
    }
  }, [isOpen, staffId]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await getStaffById(staffId);
      setStaff(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to load staff details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Staff Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : staff ? (
            <div className="space-y-6">
              {/* Staff Name and Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {staff.imageUrl && (
                    <img
                      src={staff.imageUrl}
                      alt={staff.name}
                      className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{staff.name}</h3>
                    <p className="text-sm text-gray-600">{staff.staffId}</p>
                  </div>
                </div>
                <div>
                  {staff.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-800">{staff.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Mobile</p>
                    <p className="text-sm font-semibold text-gray-800">{staff.mobile}</p>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Salary Type</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {staff.salaryType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Monthly Salary</p>
                  <p className="text-lg font-bold text-gray-800">
                    ₹{staff.salaryRate.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Password Information */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Password</p>
                      <p className="text-sm font-mono text-gray-800">
                        {showPassword ? staff.password : '••••••••'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Information */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Role</p>
                    <p className="text-sm font-semibold text-gray-800">{staff.role}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Created At</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(staff.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(staff.updatedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No staff details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
