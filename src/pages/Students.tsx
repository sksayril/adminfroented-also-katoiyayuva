import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Eye, CheckCircle, XCircle, Filter, Search, Edit, Trash2, Calendar } from 'lucide-react';
import { getStudents, Student, StudentsQueryParams, ApiError, getCourses, Course, getBatches, Batch, deleteStudent } from '../services/api';
import { toast } from 'react-toastify';
import RegisterStudentModal from '../components/RegisterStudentModal';
import StudentDetailsModal from '../components/StudentDetailsModal';
import UpdateStudentModal from '../components/UpdateStudentModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { SkeletonTable } from '../components/Skeleton';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<StudentsQueryParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchBatches();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getStudents(filters);
      setStudents(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load students');
      toast.error(apiError.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await getBatches();
      setBatches(response.data);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <Calendar className="w-3 h-3" />
            Pending
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'DROPPED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Dropped
          </span>
        );
      default:
        return null;
    }
  };

  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.studentId.toLowerCase().includes(term) ||
      student.mobile?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term)
    );
  });

  const handleViewDetails = (student: Student) => {
    setSelectedStudentId(student._id);
    setShowDetailsModal(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudentId(student._id);
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudentId(student._id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteStudent(selectedStudentId);
      toast.success('Student deleted successfully');
      setShowDeleteDialog(false);
      fetchStudents();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = students.filter((s) => s.status === 'ACTIVE').length;
  const pendingCount = students.filter((s) => s.status === 'PENDING').length;
  const droppedCount = students.filter((s) => s.status === 'DROPPED').length;

  const applyStatusFilter = (status?: StudentsQueryParams['status']) => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              Students
            </h1>
            <p className="text-gray-600 mt-1">Manage all student records</p>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Register Student
          </button>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            type="button"
            onClick={() => applyStatusFilter(undefined)}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
              !filters.status ? 'ring-2 ring-blue-200' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => applyStatusFilter('ACTIVE')}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500 text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filters.status === 'ACTIVE' ? 'ring-2 ring-green-200' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {activeCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => applyStatusFilter('PENDING')}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500 text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filters.status === 'PENDING' ? 'ring-2 ring-yellow-200' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => applyStatusFilter('DROPPED')}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500 text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filters.status === 'DROPPED' ? 'ring-2 ring-red-200' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Dropped</p>
                <p className="text-3xl font-bold text-red-600">
                  {droppedCount}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, ID, mobile, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value ? (e.target.value as StudentsQueryParams['status']) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DROPPED">Dropped</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={filters.courseId || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      courseId: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={filters.batchId || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      batchId: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonTable rows={8} columns={6} />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Course & Batch</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Fees</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {student.studentPhoto ? (
                            <img
                              src={student.studentPhoto}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover mr-3 border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{student.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.mobile}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {typeof student.courseId === 'object' ? student.courseId?.name : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeof student.batchId === 'object' ? student.batchId?.name : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const batchName =
                            typeof student.batchId === 'object' && student.batchId
                              ? student.batchId.name || ''
                              : '';
                          const isKidsBatch = batchName.trim().toLowerCase().startsWith('kids');

                          return (
                            <>
                              <div className="text-sm font-semibold text-gray-900">₹{student.totalFees?.toLocaleString()}</div>
                              {!isKidsBatch && student.dueAmount! > 0 && (
                                <div className="text-xs font-medium text-red-600">Due: ₹{student.dueAmount?.toLocaleString()}</div>
                              )}
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <RegisterStudentModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSubmit={() => {
            setShowRegisterModal(false);
            fetchStudents();
          }}
        />

        <StudentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudentId('');
          }}
          studentId={selectedStudentId}
        />

        <UpdateStudentModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedStudentId('');
          }}
          onSubmit={() => {
            setShowUpdateModal(false);
            fetchStudents();
          }}
          studentId={selectedStudentId}
        />

        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedStudentId('');
          }}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
          title="Delete Student"
          message="Are you sure you want to delete this student? All their records will be permanently removed."
        />
      </div>
    </div>
  );
}
