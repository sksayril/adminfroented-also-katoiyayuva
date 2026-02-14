import { useState, useEffect } from 'react';
import { BookOpen, Clock, DollarSign, Filter, Loader2, CheckCircle, XCircle, AlertCircle, Download, Image as ImageIcon, Plus } from 'lucide-react';
import { getCourses, createCourse, Course, CoursesQueryParams, CreateCourseRequest, ApiError } from '../services/api';
import { toast } from 'react-toastify';
import CreateCourseModal from '../components/CreateCourseModal';
import { SkeletonCard, Skeleton } from '../components/Skeleton';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<CoursesQueryParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCourses(filters);
      setCourses(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load courses');
      toast.error(apiError.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CoursesQueryParams, value: string | boolean | undefined) => {
    setFilters((prev) => {
      if (value === undefined || value === '') {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleCreateCourse = async (courseData: CreateCourseRequest) => {
    try {
      setCreating(true);
      const response = await createCourse(courseData);
      toast.success(response.message || 'Course created successfully');
      setShowCreateModal(false);
      // Refresh courses list
      await fetchCourses();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create course');
      throw err; // Re-throw to let modal handle it
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (course: Course) => {
    if (course.approvalStatus === 'APPROVED') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    } else if (course.approvalStatus === 'PENDING') {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Basic':
        return 'bg-blue-100 text-blue-700';
      case 'Advanced':
        return 'bg-purple-100 text-purple-700';
      case 'Diploma':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && courses.length === 0) {
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

        {/* Filters Skeleton */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangular" width={200} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
          </div>
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
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Courses</h1>
              <p className="text-sm text-slate-300">
                Manage and view all available courses
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
              <span>Create Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter Courses</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.courseCategory || ''}
                onChange={(e) => handleFilterChange('courseCategory', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Basic">Basic</option>
                <option value="Advanced">Advanced</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
      {error && courses.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Courses Grid */}
      {courses.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(course)}
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 ${getCategoryColor(course.courseCategory)} text-xs font-semibold rounded-full`}>
                    {course.courseCategory}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                {/* Course Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-500" />
                    <span>₹{course.courseFees.toLocaleString('en-IN')} total</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Admission: ₹{course.admissionFees.toLocaleString('en-IN')} | 
                    Monthly: ₹{course.monthlyFees.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  {course.pdfUrl && (
                    <a
                      href={course.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </a>
                  )}
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    course.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Created by: {course.createdBy}</div>
                    {course.approvedBy && (
                      <div>Approved at: {new Date(course.approvedAt!).toLocaleDateString()}</div>
                    )}
                    {course.rejectionReason && (
                      <div className="text-red-600">Reason: {course.rejectionReason}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay for filter changes */}
      {loading && courses.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
            <span className="text-slate-700">Loading courses...</span>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
        loading={creating}
      />
    </div>
  );
}
