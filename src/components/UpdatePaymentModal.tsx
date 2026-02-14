import { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, CreditCard, Tag, FileText } from 'lucide-react';
import { updatePayment, UpdatePaymentRequest, Payment, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSubmit: () => void;
}

export default function UpdatePaymentModal({ isOpen, onClose, payment, onSubmit }: UpdatePaymentModalProps) {
  const [formData, setFormData] = useState<UpdatePaymentRequest>({
    amount: 0,
    paymentMode: 'CASH',
    discount: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && payment) {
      setFormData({
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        discount: payment.discount || 0,
        description: payment.description || '',
      });
    }
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount !== undefined && formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const updateData: UpdatePaymentRequest = {};
      
      if (formData.amount !== undefined && formData.amount !== payment.amount) {
        updateData.amount = formData.amount;
      }
      if (formData.paymentMode !== payment.paymentMode) {
        updateData.paymentMode = formData.paymentMode;
      }
      if (formData.discount !== undefined && formData.discount !== (payment.discount || 0)) {
        updateData.discount = formData.discount;
      }
      if (formData.description !== (payment.description || '')) {
        updateData.description = formData.description;
      }

      await updatePayment(payment._id, updateData);
      toast.success('Payment updated successfully');
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Update Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Receipt Number (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Number</label>
            <input
              type="text"
              value={payment.receiptNumber || 'N/A'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
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
              Discount
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
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
                  Updating...
                </>
              ) : (
                'Update Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
