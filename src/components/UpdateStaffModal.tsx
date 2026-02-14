import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateStaff, UpdateStaffRequest, Staff as StaffType, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface UpdateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  staff: StaffType | null;
}

export default function UpdateStaffModal({
  isOpen,
  onClose,
  onSubmit,
  staff,
}: UpdateStaffModalProps) {
  const [formData, setFormData] = useState<UpdateStaffRequest>({
    name: '',
    email: '',
    mobile: '',
    salaryType: 'MONTHLY_FIXED',
    salaryRate: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        mobile: staff.mobile || '',
        salaryType: staff.salaryType || 'MONTHLY_FIXED',
        salaryRate: staff.salaryRate || 0,
        isActive: staff.isActive !== undefined ? staff.isActive : true,
      });
    }
  }, [isOpen, staff]);

  if (!isOpen || !staff) return null;

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
    if (formData.salaryRate !== undefined && formData.salaryRate < 0) {
      newErrors.salaryRate = 'Salary rate cannot be negative';
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
      await updateStaff(staff._id, formData);
      toast.success('Staff updated successfully');
      handleClose();
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Update Staff</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
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
              <label htmlFor="salaryRate" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Salary (₹)
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-slate-700 border-gray-300 rounded focus:ring-slate-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
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
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Staff'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
