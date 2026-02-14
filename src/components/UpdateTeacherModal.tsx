import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateTeacher, UpdateTeacherRequest, Teacher, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface UpdateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  teacher: Teacher;
  loading?: boolean;
}

export default function UpdateTeacherModal({
  isOpen,
  onClose,
  onSubmit,
  teacher,
  loading = false,
}: UpdateTeacherModalProps) {
  const [formData, setFormData] = useState<UpdateTeacherRequest>({
    name: teacher.name,
    email: teacher.email,
    mobile: teacher.mobile,
    salaryType: teacher.salaryType,
    salaryRate: teacher.salaryRate,
    isActive: teacher.isActive,
    assignedBatches: Array.isArray(teacher.assignedBatches)
      ? teacher.assignedBatches.map((b) => (typeof b === 'object' ? b._id : b))
      : [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        mobile: teacher.mobile,
        salaryType: teacher.salaryType,
        salaryRate: teacher.salaryRate,
        isActive: teacher.isActive,
        assignedBatches: Array.isArray(teacher.assignedBatches)
          ? teacher.assignedBatches.map((b) => (typeof b === 'object' ? b._id : b))
          : [],
      });
    }
  }, [isOpen, teacher]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'salaryRate'
          ? parseFloat(value) || 0
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.salaryRate !== undefined && formData.salaryRate <= 0) {
      newErrors.salaryRate = 'Salary rate must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await updateTeacher(teacher._id, formData);
      toast.success('Teacher updated successfully');
      handleClose();
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting && !loading) {
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Update Teacher</h2>
          <button
            onClick={handleClose}
            disabled={submitting || loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="salaryType" className="block text-sm font-medium text-gray-700 mb-2">
                Salary Type
              </label>
              <select
                id="salaryType"
                name="salaryType"
                value={formData.salaryType || 'PER_CLASS'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="PER_CLASS">Per Class</option>
                <option value="MONTHLY_FIXED">Monthly Fixed</option>
                <option value="HOURLY">Hourly</option>
              </select>
            </div>

            <div>
              <label htmlFor="salaryRate" className="block text-sm font-medium text-gray-700 mb-2">
                Salary Rate (₹)
              </label>
              <input
                type="number"
                id="salaryRate"
                name="salaryRate"
                value={formData.salaryRate || 0}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.salaryRate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.salaryRate && <p className="mt-1 text-sm text-red-600">{errors.salaryRate}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive ?? true}
                  onChange={handleChange}
                  className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting || loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {(submitting || loading) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Teacher</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
