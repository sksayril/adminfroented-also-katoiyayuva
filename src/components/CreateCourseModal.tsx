import { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { CreateCourseRequest } from '../services/api';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCourseRequest) => Promise<void>;
  loading?: boolean;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreateCourseModalProps) {
  const [formData, setFormData] = useState<CreateCourseRequest>({
    name: '',
    description: '',
    duration: '',
    courseCategory: 'Basic',
    courseFees: 0,
    admissionFees: 0,
    monthlyFees: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Fees') ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field
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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: 'Please select a valid image file (jpg, png, webp)',
        }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image size should be less than 5MB',
        }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setErrors((prev) => ({
          ...prev,
          pdf: 'Please select a valid PDF file',
        }));
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          pdf: 'PDF size should be less than 10MB',
        }));
        return;
      }
      setPdfFile(file);
      if (errors.pdf) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.pdf;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    if (formData.courseFees <= 0) {
      newErrors.courseFees = 'Course fees must be greater than 0';
    }
    if (formData.admissionFees < 0) {
      newErrors.admissionFees = 'Admission fees cannot be negative';
    }
    if (formData.monthlyFees < 0) {
      newErrors.monthlyFees = 'Monthly fees cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateCourseRequest = {
      ...formData,
      image: imageFile || undefined,
      pdf: pdfFile || undefined,
    };

    await onSubmit(submitData);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        duration: '',
        courseCategory: 'Basic',
        courseFees: 0,
        admissionFees: 0,
        monthlyFees: 0,
      });
      setImageFile(null);
      setPdfFile(null);
      setImagePreview(null);
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 my-8 transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Course Name <span className="text-red-500">*</span>
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
                placeholder="e.g., DCA, Web Development"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter course description"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 6 months, 8 months"
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="courseCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="courseCategory"
                name="courseCategory"
                value={formData.courseCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="Basic">Basic</option>
                <option value="Advanced">Advanced</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>

            {/* Course Fees */}
            <div>
              <label htmlFor="courseFees" className="block text-sm font-medium text-gray-700 mb-2">
                Total Course Fees (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="courseFees"
                name="courseFees"
                value={formData.courseFees}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.courseFees ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.courseFees && <p className="mt-1 text-sm text-red-600">{errors.courseFees}</p>}
            </div>

            {/* Admission Fees */}
            <div>
              <label htmlFor="admissionFees" className="block text-sm font-medium text-gray-700 mb-2">
                Admission Fees (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="admissionFees"
                name="admissionFees"
                value={formData.admissionFees}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.admissionFees ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.admissionFees && <p className="mt-1 text-sm text-red-600">{errors.admissionFees}</p>}
            </div>

            {/* Monthly Fees */}
            <div>
              <label htmlFor="monthlyFees" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Fees (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="monthlyFees"
                name="monthlyFees"
                value={formData.monthlyFees}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.monthlyFees ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.monthlyFees && <p className="mt-1 text-sm text-red-600">{errors.monthlyFees}</p>}
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Image (Optional)
              </label>
              <div className="space-y-2">
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
                    disabled={loading}
                  />
                </label>
                {imageFile && (
                  <p className="text-xs text-gray-500">{imageFile.name}</p>
                )}
                {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
              </div>
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course PDF (Optional)
              </label>
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    disabled={loading}
                  />
                </label>
                {pdfFile && (
                  <p className="text-xs text-gray-500">{pdfFile.name}</p>
                )}
                {errors.pdf && <p className="text-sm text-red-600">{errors.pdf}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Create Course</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
