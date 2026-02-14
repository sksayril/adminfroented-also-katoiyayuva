import { useState, useEffect } from 'react';
import { CreditCard, Plus, Loader2, Eye, Edit, Trash2, Filter, Search, DollarSign, Calendar, User } from 'lucide-react';
import { getPayments, Payment, PaymentsQueryParams, ApiError, getStudents, Student } from '../services/api';
import { toast } from 'react-toastify';
import CreatePaymentModal from '../components/CreatePaymentModal';
import UpdatePaymentModal from '../components/UpdatePaymentModal';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { SkeletonTable, Skeleton } from '../components/Skeleton';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<PaymentsQueryParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPayments(filters);
      setPayments(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load payments');
      toast.error(apiError.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchPayments();
  };

  const handleUpdateClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedPayment(null);
    fetchPayments();
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPaymentId(payment._id);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment) return;

    try {
      const { deletePayment } = await import('../services/api');
      await deletePayment(selectedPayment._id);
      toast.success('Payment deleted successfully');
      setShowDeleteDialog(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete payment');
    }
  };

  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case 'CASH':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            CASH
          </span>
        );
      case 'UPI':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            UPI
          </span>
        );
      case 'ONLINE':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
            ONLINE
          </span>
        );
      default:
        return null;
    }
  };

  const getStudentName = (studentId: Payment['studentId']): string => {
    if (typeof studentId === 'object' && studentId !== null) {
      return studentId.name;
    }
    return 'Unknown Student';
  };

  const getStudentId = (studentId: Payment['studentId']): string => {
    if (typeof studentId === 'object' && studentId !== null) {
      return studentId.studentId;
    }
    return '';
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const studentName = getStudentName(payment.studentId).toLowerCase();
    const studentId = getStudentId(payment.studentId).toLowerCase();
    const receiptNumber = payment.receiptNumber?.toLowerCase() || '';
    return (
      studentName.includes(term) ||
      studentId.includes(term) ||
      receiptNumber.includes(term) ||
      payment.amount.toString().includes(term)
    );
  });

  if (loading && payments.length === 0) {
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
            <Skeleton variant="rectangular" width="100%" height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
          </div>
        </div>

        {/* Table Skeleton */}
        <SkeletonTable rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-600" />
            Payments
          </h1>
          <p className="text-gray-600 mt-1">Manage all payment records</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Payment
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name, ID, receipt number, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <select
                value={filters.paymentMode || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    paymentMode: e.target.value ? (e.target.value as PaymentsQueryParams['paymentMode']) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Modes</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      'No payments found'
                    )}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {payment.receiptNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {getStudentName(payment.studentId).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {getStudentName(payment.studentId)}
                          </div>
                          <div className="text-xs text-gray-500">{getStudentId(payment.studentId)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {payment.discount ? `₹${payment.discount.toLocaleString('en-IN')}` : '₹0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentModeBadge(payment.paymentMode)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateClick(payment)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110"
                          title="Edit Payment"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(payment)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payment Modal */}
      <CreatePaymentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSuccess}
      />

      {/* Update Payment Modal */}
      {selectedPayment && (
        <UpdatePaymentModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onSubmit={handleUpdateSuccess}
        />
      )}

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPaymentId('');
        }}
        paymentId={selectedPaymentId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedPayment(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment"
        message={`Are you sure you want to delete payment ${selectedPayment?.receiptNumber || ''}? This action will reverse the payment and update the student's balance.`}
      />
    </div>
  );
}
