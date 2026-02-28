import { useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';

interface TimeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (time: string | null) => void;
  title: string;
  personName: string;
  selectedDate?: string; // Date from attendance page (YYYY-MM-DD format)
}

export default function TimeSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  personName,
  selectedDate,
}: TimeSelectionModalProps) {
  const [timeMode, setTimeMode] = useState<'auto' | 'manual'>('auto');
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    // Format: HH:mm
    return now.toTimeString().slice(0, 5);
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (timeMode === 'auto') {
      onConfirm(null); // null means use current time
    } else {
      // Combine selected date with selected time
      const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
      const dateTime = new Date(`${dateToUse}T${selectedTime}`).toISOString();
      onConfirm(dateTime);
    }
    onClose();
  };

  const handleCancel = () => {
    setTimeMode('auto');
    const now = new Date();
    setSelectedTime(now.toTimeString().slice(0, 5));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Marking attendance for <span className="font-semibold text-gray-800">{personName}</span>
            </p>
          </div>

          <div className="space-y-4">
            {/* Time Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Selection Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timeMode"
                    value="auto"
                    checked={timeMode === 'auto'}
                    onChange={(e) => setTimeMode(e.target.value as 'auto' | 'manual')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Automated (Current Time)</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timeMode"
                    value="manual"
                    checked={timeMode === 'manual'}
                    onChange={(e) => setTimeMode(e.target.value as 'auto' | 'manual')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Manual Selection</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Manual Time Selection */}
            {timeMode === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="space-y-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong> {selectedDate 
                        ? new Date(selectedDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : new Date().toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                      } (Auto-selected)
                    </p>
                  </div>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedDate 
                      ? new Date(selectedDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : new Date().toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                    }, {selectedTime ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Auto Time Display */}
            {timeMode === 'auto' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Current Time:</strong> {new Date().toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
