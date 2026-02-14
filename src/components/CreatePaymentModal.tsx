import { useState, useEffect, useRef } from 'react';
import { X, Loader2, DollarSign, User, CreditCard, Tag, FileText, Calendar, Search, ChevronDown } from 'lucide-react';
import { createPayment, CreatePaymentRequest, ApiError, getStudents, Student } from '../services/api';
import { toast } from 'react-toastify';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CreatePaymentModal({ isOpen, onClose, onSubmit }: CreatePaymentModalProps) {
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    studentId: '',
    amount: 0,
    paymentMode: 'CASH',
    discount: 0,
    description: '',
    month: '',
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      // Set current month and year as defaults
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        month: now.toLocaleString('en-US', { month: 'long' }),
        year: now.getFullYear(),
      }));
    } else {
      // Reset form when modal closes
      setFormData({
        studentId: '',
        amount: 0,
        paymentMode: 'CASH',
        discount: 0,
        description: '',
        month: '',
        year: new Date().getFullYear(),
      });
      setSearchTerm('');
      setShowDropdown(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await getStudents({ status: 'ACTIVE' });
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const paymentData: CreatePaymentRequest = {
        studentId: formData.studentId,
        amount: formData.amount,
        paymentMode: formData.paymentMode,
        ...(formData.discount && formData.discount > 0 && { discount: formData.discount }),
        ...(formData.description && { description: formData.description }),
        ...(formData.month && { month: formData.month }),
        ...(formData.year && { year: formData.year }),
      };

      await createPayment(paymentData);
      toast.success('Payment created successfully');
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.studentId.toLowerCase().includes(term)
    );
  });

  const selectedStudent = students.find((s) => s.studentId === formData.studentId);

  const handleStudentSelect = (student: Student) => {
    setFormData({ ...formData, studentId: student.studentId });
    setSearchTerm(`${student.studentId} - ${student.name}`);
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Create Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Student <span className="text-red-500">*</span>
            </label>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) {
                        setFormData({ ...formData, studentId: '' });
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search by student name or ID..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ChevronDown
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-transform ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Dropdown List */}
                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No students found
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student._id}
                          onClick={() => handleStudentSelect(student)}
                          className={`px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors ${
                            formData.studentId === student.studentId ? 'bg-blue-100' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {student.studentId}
                              </div>
                            </div>
                            {formData.studentId === student.studentId && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {formData.studentId && selectedStudent && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Selected Student:</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedStudent.name} ({selectedStudent.studentId})
                </p>
              </div>
            )}
            {!formData.studentId && (
              <p className="mt-1 text-xs text-red-500">
                Please select a student
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Mode <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as 'CASH' | 'UPI' | 'ONLINE' })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Discount (Optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.discount || ''}
              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter discount amount"
            />
          </div>

          {/* Month and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Month (Optional)
              </label>
              <select
                value={formData.month || ''}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year (Optional)</label>
              <select
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description (Optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter payment description"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
