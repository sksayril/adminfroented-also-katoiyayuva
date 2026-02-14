import { useState, useEffect } from 'react';
import { X, Calendar, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { 
  getStudentAttendance, StudentAttendance,
  getStaffAttendance, StaffAttendance,
  Student, Staff,
  ApiError 
} from '../services/api';
import { toast } from 'react-toastify';

interface AttendanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'student' | 'staff';
  person: Student | Staff;
}

export default function AttendanceDetailsModal({ 
  isOpen, 
  onClose, 
  type, 
  person 
}: AttendanceDetailsModalProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<(StudentAttendance | StaffAttendance)[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Set default date range to current month
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
      setSelectedDate('');
      fetchAttendance();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (startDate || endDate || selectedDate)) {
      fetchAttendance();
    }
  }, [startDate, endDate, selectedDate, isOpen]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      
      if (type === 'student') {
        const student = person as Student;
        const params: any = { studentId: student.studentId };
        
        if (selectedDate) {
          params.date = selectedDate;
        } else if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        
        const response = await getStudentAttendance(params);
        setAttendanceRecords(response.data);
      } else if (type === 'staff') {
        const staffMember = person as Staff;
        const params: any = { staffId: staffMember.staffId };
        
        if (selectedDate) {
          params.date = selectedDate;
        } else if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        
        const response = await getStaffAttendance(params);
        setAttendanceRecords(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to load attendance details');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Present') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Present
        </span>
      );
    } else if (status === 'Absent') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Absent
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  const personName = type === 'student' ? (person as Student).name : (person as Staff).name;
  const personId = type === 'student' ? (person as Student).studentId : (person as Staff).staffId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Attendance Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {personName} ({personId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedDate('');
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedDate('');
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or Select Specific Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600">No attendance records found</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold">{attendanceRecords.length}</span> attendance record(s)
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      {type === 'student' ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Slot
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            In-Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Out-Time
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Slot
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check-In
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check-Out
                          </th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => {
                      if (type === 'student') {
                        const studentRecord = record as StudentAttendance;
                        return (
                          <tr key={studentRecord._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatDate(studentRecord.date)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {studentRecord.timeSlot || 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {studentRecord.inTime ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <span>{formatTime(studentRecord.inTime)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not marked</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {studentRecord.outTime ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span>{formatTime(studentRecord.outTime)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not marked</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(studentRecord.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {studentRecord.method || 'MANUAL'}
                            </td>
                          </tr>
                        );
                      } else {
                        const staffRecord = record as StaffAttendance;
                        return (
                          <tr key={staffRecord._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatDate(staffRecord.date)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {staffRecord.timeSlot || 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {staffRecord.checkIn ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <span>{formatTime(staffRecord.checkIn)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not marked</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {staffRecord.checkOut ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span>{formatTime(staffRecord.checkOut)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not marked</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(staffRecord.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {staffRecord.method || 'MANUAL'}
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
