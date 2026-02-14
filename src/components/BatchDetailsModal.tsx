import { useState, useEffect } from 'react';
import { X, Loader2, Clock, BookOpen, User, Users, DollarSign, Calendar, CheckCircle, XCircle, Tag } from 'lucide-react';
import { getBatchById, Batch, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface BatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
}

export default function BatchDetailsModal({ isOpen, onClose, batchId }: BatchDetailsModalProps) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && batchId) {
      fetchBatchDetails();
    }
  }, [isOpen, batchId]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const response = await getBatchById(batchId);
      setBatch(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to load batch details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const courseName = typeof batch?.courseId === 'object' && batch.courseId !== null ? batch.courseId.name : 'N/A';
  const courseCategory = typeof batch?.courseId === 'object' && batch.courseId !== null ? batch.courseId.courseCategory : '';
  const teacherName = typeof batch?.teacherId === 'object' && batch.teacherId !== null ? batch.teacherId.name : 'N/A';
  const teacherEmail = typeof batch?.teacherId === 'object' && batch.teacherId !== null ? batch.teacherId.email : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Batch Details</h2>
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
          ) : batch ? (
            <div className="space-y-6">
              {/* Batch Name and Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{batch.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {batch.isActive ? (
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
                    <span className={`px-3 py-1 text-sm font-semibold rounded ${batch.batchType === 'OFFLINE' ? 'bg-blue-100 text-blue-700' : batch.batchType === 'ONLINE' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {batch.batchType}
                    </span>
                    {batch.isKidsBatch && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded">
                        Kids Batch
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Slot */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Time Slot</p>
                    <p className="text-sm font-semibold text-gray-800">{batch.timeSlot}</p>
                  </div>
                </div>
              </div>

              {/* Weekdays */}
              {batch.weekdays && batch.weekdays.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-2">Weekdays</p>
                      <div className="flex flex-wrap gap-2">
                        {batch.weekdays.map((day, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Course Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Course</p>
                    <p className="text-sm font-semibold text-gray-800">{courseName}</p>
                    {courseCategory && (
                      <p className="text-xs text-gray-500 mt-1">Category: {courseCategory}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Teacher Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Teacher</p>
                    <p className="text-sm font-semibold text-gray-800">{teacherName}</p>
                    {teacherEmail && (
                      <p className="text-xs text-gray-500 mt-1">{teacherEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Students Information */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Students</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        {batch.currentStudents} / {batch.maxStudents}
                      </p>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${(batch.currentStudents / batch.maxStudents) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Fee */}
              {batch.monthlyFee !== undefined && batch.monthlyFee > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Monthly Fee</p>
                      <p className="text-sm font-semibold text-gray-800">
                        ₹{batch.monthlyFee.toLocaleString('en-IN')}
                      </p>
                      {batch.isKidsBatch && batch.discountPercentage > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Discount: {batch.discountPercentage}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Created At</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(batch.createdAt).toLocaleDateString('en-IN', {
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
                        {new Date(batch.updatedAt).toLocaleDateString('en-IN', {
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
              <p className="text-gray-500">No batch details available</p>
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
