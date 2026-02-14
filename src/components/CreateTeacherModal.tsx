import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { CreateTeacherRequest, createTeacher, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function CreateTeacherModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreateTeacherModalProps) {
  const [formData, setFormData] = useState<CreateTeacherRequest>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    salaryType: 'PER_CLASS',
    salaryRate: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salaryRate' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          teacherImage: 'Please select a valid image file (jpg, png, webp)',
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          teacherImage: 'Image size should be less than 5MB',
        }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.teacherImage) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.teacherImage;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (formData.salaryRate <= 0) {
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
      const submitData: CreateTeacherRequest = {
        ...formData,
        teacherImage: imageFile || undefined,
      };

      await createTeacher(submitData);
      toast.success('Teacher created successfully');
      handleClose();
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting && !loading) {
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: '',
        salaryType: 'PER_CLASS',
        salaryRate: 0,
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Teacher</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teacher Image (Optional)
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG, WEBP (MAX. 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={submitting || loading}
                />
              </label>
              {imageFile && <p className="text-xs text-gray-500 mt-1">{imageFile.name}</p>}
              {errors.teacherImage && <p className="text-sm text-red-600 mt-1">{errors.teacherImage}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.mobile ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="salaryType" className="block text-sm font-medium text-gray-700 mb-2">
                Salary Type <span className="text-red-500">*</span>
              </label>
              <select
                id="salaryType"
                name="salaryType"
                value={formData.salaryType}
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
                Salary Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="salaryRate"
                name="salaryRate"
                value={formData.salaryRate}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.salaryRate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.salaryRate && <p className="mt-1 text-sm text-red-600">{errors.salaryRate}</p>}
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Create Teacher</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
