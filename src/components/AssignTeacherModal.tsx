import { useState, useEffect } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { assignTeacherToBatch, getTeachers, Teacher, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  batchId: string;
  batchName: string;
  currentTeacherId?: string | null;
}

export default function AssignTeacherModal({
  isOpen,
  onClose,
  onSubmit,
  batchId,
  batchName,
  currentTeacherId,
}: AssignTeacherModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      setSelectedTeacherId('');
      setError('');
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await getTeachers(true); // Only active teachers
      setTeachers(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeacherId) {
      setError('Please select a teacher');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await assignTeacherToBatch(batchId, selectedTeacherId);
      toast.success(currentTeacherId ? 'Teacher changed successfully' : 'Teacher assigned to batch successfully');
      handleClose();
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to assign teacher to batch');
      toast.error(apiError.message || 'Failed to assign teacher to batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedTeacherId('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentTeacherId ? 'Change Teacher' : 'Assign Teacher'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Batch: {batchName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher <span className="text-red-500">*</span>
            </label>
            {loadingTeachers ? (
              <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <select
                id="teacherId"
                name="teacherId"
                value={selectedTeacherId}
                onChange={(e) => {
                  setSelectedTeacherId(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {teachers.length === 0 && !loadingTeachers && (
              <p className="mt-2 text-sm text-gray-500">No active teachers available</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedTeacherId || loadingTeachers}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {currentTeacherId ? 'Changing...' : 'Assigning...'}
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  {currentTeacherId ? 'Change Teacher' : 'Assign Teacher'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
