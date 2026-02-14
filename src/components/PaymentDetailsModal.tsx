import { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, CreditCard, Calendar, User, FileText, Tag, Receipt } from 'lucide-react';
import { getPaymentById, Payment, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
}

export default function PaymentDetailsModal({ isOpen, onClose, paymentId }: PaymentDetailsModalProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await getPaymentById(paymentId);
      setPayment(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to load payment details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case 'CASH':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
            CASH
          </span>
        );
      case 'UPI':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            UPI
          </span>
        );
      case 'ONLINE':
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
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

  const getStudentEmail = (studentId: Payment['studentId']): string => {
    if (typeof studentId === 'object' && studentId !== null) {
      return studentId.email || 'N/A';
    }
    return 'N/A';
  };

  const getStudentMobile = (studentId: Payment['studentId']): string => {
    if (typeof studentId === 'object' && studentId !== null) {
      return studentId.mobile || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : payment ? (
            <div className="space-y-6">
              {/* Receipt Number and Payment Mode */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-blue-600" />
                    {payment.receiptNumber || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-600">Payment ID: {payment._id}</p>
                </div>
                <div>
                  {getPaymentModeBadge(payment.paymentMode)}
                </div>
              </div>

              {/* Student Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Student Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Student Name</p>
                    <p className="text-sm font-semibold text-gray-800">{getStudentName(payment.studentId)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Student ID</p>
                    <p className="text-sm font-semibold text-gray-800">{getStudentId(payment.studentId)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Mobile</p>
                    <p className="text-sm font-semibold text-gray-800">{getStudentMobile(payment.studentId)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-800">{getStudentEmail(payment.studentId)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Discount</p>
                    <p className="text-lg font-bold text-yellow-600">
                      ₹{(payment.discount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Net Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{(payment.amount - (payment.discount || 0)).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {payment.month && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Month</p>
                      <p className="text-sm font-semibold text-gray-800">{payment.month}</p>
                    </div>
                  )}
                  {payment.year && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Year</p>
                      <p className="text-sm font-semibold text-gray-800">{payment.year}</p>
                    </div>
                  )}
                  {payment.description && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Description</p>
                      <p className="text-sm font-semibold text-gray-800">{payment.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Collection Information */}
              {payment.collectedBy && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Collected By
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Name</p>
                      <p className="text-sm font-semibold text-gray-800">{payment.collectedBy.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <p className="text-sm font-semibold text-gray-800">{payment.collectedBy.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              {(payment.createdAt || payment.updatedAt) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {payment.createdAt && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Created At</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {payment.updatedAt && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(payment.updatedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Receipt PDF */}
              {payment.receiptPdfUrl && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Receipt PDF</h4>
                  <a
                    href={payment.receiptPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View Receipt PDF
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No payment details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
