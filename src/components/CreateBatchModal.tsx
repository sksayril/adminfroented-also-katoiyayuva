import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createBatch, CreateBatchRequest, ApiError, getTeachers, getCourses, Teacher, Course, DaySchedule } from '../services/api';
import { toast } from 'react-toastify';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CreateBatchModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateBatchModalProps) {
  const [formData, setFormData] = useState<CreateBatchRequest>({
    name: '',
    daySchedules: [{ day: '', startTime: '', endTime: '' }],
    isKidsBatch: false,
    discountPercentage: 0,
    batchType: 'OFFLINE',
    teacherId: '',
    courseId: '',
    maxStudents: 30,
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleDayScheduleChange = (index: number, field: keyof DaySchedule, value: string) => {
    setFormData((prev) => ({
      ...prev,
      daySchedules: (prev.daySchedules || []).map((schedule, idx) =>
        idx === index ? { ...schedule, [field]: value } : schedule
      ),
    }));

    if (errors.daySchedules) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.daySchedules;
        return newErrors;
      });
    }
  };

  const addDaySchedule = () => {
    setFormData((prev) => ({
      ...prev,
      daySchedules: [...(prev.daySchedules || []), { day: '', startTime: '', endTime: '' }],
    }));
  };

  const removeDaySchedule = (index: number) => {
    setFormData((prev) => {
      const current = prev.daySchedules || [];
      if (current.length <= 1) return prev;
      return {
        ...prev,
        daySchedules: current.filter((_, idx) => idx !== index),
      };
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      fetchCourses();
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

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await getCourses({ isActive: true }); // Only active courses
      setCourses(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        return {
          ...prev,
          [name]: checked,
          // Reset discountPercentage when isKidsBatch is unchecked
          ...(name === 'isKidsBatch' && !checked ? { discountPercentage: 0 } : {}),
        };
      }
      return {
        ...prev,
        [name]: name.includes('Fee') || name === 'maxStudents' || name === 'discountPercentage'
          ? parseFloat(value) || 0
          : value,
      };
    });
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

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }
    const validDaySchedules = (formData.daySchedules || []).filter(
      (schedule) => schedule.day.trim() && schedule.startTime.trim() && schedule.endTime.trim()
    );
    if (validDaySchedules.length === 0) {
      newErrors.daySchedules = 'Please add at least one complete day schedule';
    }
    const uniqueDays = new Set(validDaySchedules.map((schedule) => schedule.day));
    if (uniqueDays.size !== validDaySchedules.length) {
      newErrors.daySchedules = 'Duplicate day entries are not allowed';
    }
    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }
    if (formData.maxStudents <= 0) {
      newErrors.maxStudents = 'Max students must be greater than 0';
    }
    if (formData.isKidsBatch && (formData.discountPercentage ?? 0) < 0) {
      newErrors.discountPercentage = 'Discount percentage cannot be negative';
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
      const sanitizedDaySchedules = (formData.daySchedules || []).filter(
        (schedule) => schedule.day.trim() && schedule.startTime.trim() && schedule.endTime.trim()
      );

      const submitData: CreateBatchRequest = {
        ...formData,
        daySchedules: sanitizedDaySchedules,
        timeSlot: undefined,
        weekdays: undefined,
        isKidsBatch: formData.isKidsBatch || undefined,
        discountPercentage: formData.isKidsBatch ? formData.discountPercentage : undefined,
        teacherId: formData.teacherId && formData.teacherId.trim() !== '' ? formData.teacherId : undefined,
      };

      await createBatch(submitData);
      toast.success('Batch created successfully');
      handleClose();
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        name: '',
        daySchedules: [{ day: '', startTime: '', endTime: '' }],
        isKidsBatch: false,
        discountPercentage: 0,
        batchType: 'OFFLINE',
        teacherId: '',
        courseId: '',
        maxStudents: 30,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Batch</h2>
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
                Batch Name <span className="text-red-500">*</span>
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
                placeholder="e.g., Morning Batch"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Day-wise Schedules <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {(formData.daySchedules || []).map((schedule, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-3 border border-gray-200 rounded-lg bg-slate-50">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                      <select
                        value={schedule.day}
                        onChange={(e) => handleDayScheduleChange(index, 'day', e.target.value)}
                        disabled={submitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      >
                        <option value="">Select day</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                      <input
                        type="text"
                        value={schedule.startTime}
                        onChange={(e) => handleDayScheduleChange(index, 'startTime', e.target.value)}
                        placeholder="8:00 AM"
                        disabled={submitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                      <input
                        type="text"
                        value={schedule.endTime}
                        onChange={(e) => handleDayScheduleChange(index, 'endTime', e.target.value)}
                        placeholder="9:30 AM"
                        disabled={submitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDaySchedule(index)}
                      disabled={submitting || (formData.daySchedules || []).length <= 1}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDaySchedule}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  + Add Another Day
                </button>
              </div>
              {errors.daySchedules && <p className="mt-2 text-sm text-red-600">{errors.daySchedules}</p>}
            </div>

            <div>
              <label htmlFor="batchType" className="block text-sm font-medium text-gray-700 mb-2">
                Batch Type <span className="text-red-500">*</span>
              </label>
              <select
                id="batchType"
                name="batchType"
                value={formData.batchType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="OFFLINE">Offline</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              {loadingCourses ? (
                <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : (
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.courseId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.courseCategory})
                    </option>
                  ))}
                </select>
              )}
              {errors.courseId && <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>}
            </div>

            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
                Teacher (Optional)
              </label>
              {loadingTeachers ? (
                <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : (
                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Select a teacher (optional)</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
                Max Students <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                required
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.maxStudents ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.maxStudents && <p className="mt-1 text-sm text-red-600">{errors.maxStudents}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isKidsBatch"
                  checked={formData.isKidsBatch}
                  onChange={handleChange}
                  className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                />
                <span className="text-sm font-medium text-gray-700">Kids Batch</span>
              </label>
            </div>

            {formData.isKidsBatch && (
              <div>
                <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={formData.discountPercentage ?? 0}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.discountPercentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.discountPercentage && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Batch</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
