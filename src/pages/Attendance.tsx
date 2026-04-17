import { useState, useEffect } from 'react';
import { ClipboardCheck, GraduationCap, UserCheck, Calendar, Search, Loader2, Clock, CheckCircle, Eye, XCircle, Download } from 'lucide-react';
import { 
  getStudents, Student, 
  getStaff, Staff, 
  getTeachers, Teacher, 
  getStudentAttendance, StudentAttendance,
  getStaffAttendance, StaffAttendance,
  getTeacherAttendance, TeacherAttendance,
  markStudentInTime, markStudentOutTime,
  markStaffCheckIn, markStaffCheckOut,
  markTeacherCheckIn, markTeacherCheckOut,
  updateStaffAttendance,
  updateStudentAttendance,
  updateTeacherAttendance,
  exportAllStudentAttendanceExcel,
  ApiError 
} from '../services/api';
import { toast } from 'react-toastify';
import AttendanceDetailsModal from '../components/AttendanceDetailsModal';
import TimeSelectionModal from '../components/TimeSelectionModal';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState<'students' | 'staff' | 'teachers'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);
  const [exportBatchId, setExportBatchId] = useState('');
  const [exportStatus, setExportStatus] = useState<'' | 'Present' | 'Absent' | 'Late'>('');
  
  // Attendance tracking
  const [studentAttendance, setStudentAttendance] = useState<Record<string, StudentAttendance>>({});
  const [staffAttendance, setStaffAttendance] = useState<Record<string, StaffAttendance>>({});
  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, TeacherAttendance>>({});
  const [attendanceLoading, setAttendanceLoading] = useState<Record<string, boolean>>({});
  
  // Selected attendance type for each person
  const [selectedAttendanceType, setSelectedAttendanceType] = useState<Record<string, 'inTime' | 'outTime' | 'checkIn' | 'checkOut' | 'absent' | 'late' | undefined>>({});
  
  // Attendance details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Student | Staff | Teacher | null>(null);
  
  // Time selection modal
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingAttendance, setPendingAttendance] = useState<{
    id: string;
    type: 'inTime' | 'outTime' | 'checkIn' | 'checkOut' | 'absent' | 'late';
    personName: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceData();
    }
  }, [selectedDate, activeTab, students, staff, teachers]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'students') {
        const response = await getStudents();
        setStudents(response.data);
      } else if (activeTab === 'staff') {
        const response = await getStaff({ role: 'STAFF' });
        setStaff(response.data);
      } else if (activeTab === 'teachers') {
        const response = await getTeachers();
        setTeachers(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      if (activeTab === 'students' && students.length > 0) {
        const response = await getStudentAttendance({ date: selectedDate });
        const attendanceMap: Record<string, StudentAttendance> = {};
        response.data.forEach((attendance) => {
          const studentId = typeof attendance.studentId === 'string' 
            ? attendance.studentId 
            : attendance.studentId._id;
          attendanceMap[studentId] = attendance;
        });
        setStudentAttendance(attendanceMap);
      } else if (activeTab === 'staff' && staff.length > 0) {
        const response = await getStaffAttendance({ date: selectedDate });
        const attendanceMap: Record<string, StaffAttendance> = {};
        response.data.forEach((attendance) => {
          const staffId = typeof attendance.staffId === 'string' 
            ? attendance.staffId 
            : attendance.staffId._id;
          attendanceMap[staffId] = attendance;
        });
        setStaffAttendance(attendanceMap);
      } else if (activeTab === 'teachers' && teachers.length > 0) {
        const response = await getTeacherAttendance({ date: selectedDate });
        const attendanceMap: Record<string, TeacherAttendance> = {};
        response.data.attendance.forEach((attendance) => {
          // Teacher attendance API returns teacher object with teacherId
          let teacherIdToMatch: string | undefined;
          let teacherIdFromResponse: string | undefined;
          
          if (attendance.teacher) {
            // Use teacher.teacherId from the API response (e.g., "YUVA-0002-TCH-NAN")
            teacherIdToMatch = attendance.teacher.teacherId;
            teacherIdFromResponse = attendance.teacher._id;
          } else if (attendance.staffId) {
            // Fallback to staffId if teacher object is not present
            teacherIdToMatch = typeof attendance.staffId === 'string' 
              ? attendance.staffId 
              : (typeof attendance.staffId === 'object' ? attendance.staffId.staffId : undefined);
            teacherIdFromResponse = typeof attendance.staffId === 'object' ? attendance.staffId._id : undefined;
          }
          
          // Find the teacher by matching teacherId (the string ID like "YUVA-0002-TCH-NAN")
          const teacher = teachers.find(t => 
            t.teacherId === teacherIdToMatch || 
            t._id === teacherIdFromResponse
          );
          
          if (teacher) {
            // Store attendance using teacher._id as the key
            attendanceMap[teacher._id] = attendance;
          }
        });
        setTeacherAttendance(attendanceMap);
      }
    } catch (err) {
      // Silently fail - attendance might not exist yet
      console.log('No attendance data found for date:', selectedDate);
    }
  };

  const handleMarkAttendance = async (id: string, type: 'inTime' | 'outTime' | 'checkIn' | 'checkOut' | 'absent' | 'late') => {
    // Show time selection modal for inTime, outTime, checkIn, and checkOut
    if (type === 'inTime' || type === 'outTime' || type === 'checkIn' || type === 'checkOut') {
      let personName = '';
      if (activeTab === 'students') {
        const student = students.find(s => s._id === id);
        if (!student) return;
        personName = student.name;
      } else if (activeTab === 'staff') {
        const staffMember = staff.find(s => s._id === id);
        if (!staffMember) return;
        personName = staffMember.name;
      } else if (activeTab === 'teachers') {
        const teacher = teachers.find(t => t._id === id);
        if (!teacher) return;
        personName = teacher.name;
      }
      
      setPendingAttendance({ id, type, personName });
      setShowTimeModal(true);
      return;
    }

    // For absent/late types, proceed directly without time selection
    await processAttendance(id, type, null);
  };

  const processAttendance = async (id: string, type: 'inTime' | 'outTime' | 'checkIn' | 'checkOut' | 'absent' | 'late', customTime: string | null) => {
    try {
      setAttendanceLoading({ ...attendanceLoading, [id]: true });
      
      if (activeTab === 'students') {
        const student = students.find(s => s._id === id);
        if (!student) return;

        if (type === 'inTime') {
          const batchTimeSlot = typeof student.batchId === 'object' && student.batchId 
            ? student.batchId.timeSlot 
            : undefined;
          
          await markStudentInTime({
            studentId: student.studentId,
            date: selectedDate,
            timeSlot: batchTimeSlot,
            method: 'MANUAL',
            inTime: customTime || undefined,
          });
          toast.success(`In-time marked for ${student.name}`);
        } else if (type === 'outTime') {
          await markStudentOutTime({
            studentId: student.studentId,
            date: selectedDate,
            method: 'MANUAL',
            outTime: customTime || undefined,
          });
          toast.success(`Out-time marked for ${student.name}`);
        } else if (type === 'absent' || type === 'late') {
          // Get existing attendance record to update
          const existingAttendance = studentAttendance[id];
          if (existingAttendance && existingAttendance._id) {
            await updateStudentAttendance(existingAttendance._id, {
              status: type === 'absent' ? 'Absent' : 'Late',
              method: 'MANUAL',
              date: selectedDate,
            });
            toast.success(`${type === 'absent' ? 'Absent' : 'Late'} marked for ${student.name}`);
          } else {
            // If no attendance record exists, create one with absent/late status
            // First mark in-time, then update to absent/late
            const batchTimeSlot = typeof student.batchId === 'object' && student.batchId 
              ? student.batchId.timeSlot 
              : undefined;
            const inTimeResponse = await markStudentInTime({
              studentId: student.studentId,
              date: selectedDate,
              timeSlot: batchTimeSlot,
              method: 'MANUAL',
              inTime: customTime || undefined,
            });
            if (inTimeResponse.data && inTimeResponse.data._id) {
              await updateStudentAttendance(inTimeResponse.data._id, {
                status: type === 'absent' ? 'Absent' : 'Late',
                method: 'MANUAL',
              });
              toast.success(`${type === 'absent' ? 'Absent' : 'Late'} marked for ${student.name}`);
            }
          }
        }
      } else if (activeTab === 'staff') {
        const staffMember = staff.find(s => s._id === id);
        if (!staffMember) return;

        if (type === 'checkIn') {
          await markStaffCheckIn({
            staffId: staffMember.staffId,
            date: selectedDate,
            method: 'MANUAL',
            checkIn: customTime || undefined,
          });
          toast.success(`Check-in marked for ${staffMember.name}`);
        } else if (type === 'checkOut') {
          await markStaffCheckOut({
            staffId: staffMember.staffId,
            date: selectedDate,
            method: 'MANUAL',
            checkOut: customTime || undefined,
          });
          toast.success(`Check-out marked for ${staffMember.name}`);
        } else if (type === 'absent' || type === 'late') {
          // Get existing attendance record to update
          const existingAttendance = staffAttendance[id];
          if (existingAttendance && existingAttendance._id) {
            await updateStaffAttendance(existingAttendance._id, {
              status: type === 'absent' ? 'Absent' : 'Late',
              method: 'MANUAL',
              date: selectedDate,
            });
            toast.success(`${type === 'absent' ? 'Absent' : 'Late'} marked for ${staffMember.name}`);
          } else {
            // If no attendance record exists, create one with absent/late status
            // First mark check-in, then update to absent/late
            const checkInResponse = await markStaffCheckIn({
              staffId: staffMember.staffId,
              date: selectedDate,
              method: 'MANUAL',
              checkIn: customTime || undefined,
            });
            if (checkInResponse.data && checkInResponse.data._id) {
              await updateStaffAttendance(checkInResponse.data._id, {
                status: type === 'absent' ? 'Absent' : 'Late',
                method: 'MANUAL',
              });
              toast.success(`${type === 'absent' ? 'Absent' : 'Late'} marked for ${staffMember.name}`);
            }
          }
        }
      } else if (activeTab === 'teachers') {
        const teacher = teachers.find(t => t._id === id);
        if (!teacher) return;

        if (type === 'checkIn') {
          await markTeacherCheckIn({
            teacherId: teacher.teacherId,
            date: selectedDate,
            method: 'MANUAL',
            checkIn: customTime || undefined,
          });
          toast.success(`Check-in marked for ${teacher.name}`);
        } else if (type === 'checkOut') {
          await markTeacherCheckOut({
            teacherId: teacher.teacherId,
            date: selectedDate,
            method: 'MANUAL',
            checkOut: customTime || undefined,
          });
          toast.success(`Check-out marked for ${teacher.name}`);
        } else if (type === 'absent' || type === 'late') {
          // Get existing attendance record to update
          const existingAttendance = teacherAttendance[id];
          if (existingAttendance && existingAttendance._id) {
            await updateTeacherAttendance(existingAttendance._id, {
              status: type === 'absent' ? 'Absent' : 'Late',
              method: 'MANUAL',
              date: selectedDate,
            });
            toast.success(`${type === 'absent' ? 'Absent' : 'Late'} marked for ${teacher.name}`);
          } else {
            // If no attendance record exists, create one with absent/late status
            // First mark check-in, then update to absent/late
            const checkInResponse = await markTeacherCheckIn({
              teacherId: teacher.teacherId,
              date: selectedDate,
              method: 'MANUAL',
              checkIn: customTime || undefined,
            });
            if (checkInResponse.data && checkInResponse.data._id) {
              await updateTeacherAttendance(checkInResponse.data._id, {
                status: type === 'absent' ? 'Absent' : 'Late',
                method: 'MANUAL',
              });
              toast.success(`${type === 'absent' ? 'Absent' : 'Late'} marked for ${teacher.name}`);
            }
          }
        }
      }

      // Refresh attendance data
      await fetchAttendanceData();
      setSelectedAttendanceType({ ...selectedAttendanceType, [id]: undefined });
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to mark attendance');
    } finally {
      setAttendanceLoading({ ...attendanceLoading, [id]: false });
    }
  };

  const getStudentAttendanceStatus = (studentId: string): {
    hasInTime: boolean;
    hasOutTime: boolean;
    inTime: string | null | undefined;
    outTime: string | null | undefined;
    status: string | null;
  } => {
    const attendance = studentAttendance[studentId];
    if (!attendance) {
      return { 
        hasInTime: false, 
        hasOutTime: false, 
        inTime: null, 
        outTime: null, 
        status: null 
      };
    }
    return {
      hasInTime: !!attendance.inTime,
      hasOutTime: !!attendance.outTime,
      inTime: attendance.inTime,
      outTime: attendance.outTime,
      status: attendance.status || null,
    };
  };

  const getStaffAttendanceStatus = (staffId: string) => {
    const attendance = staffAttendance[staffId];
    if (!attendance) return { hasCheckIn: false, hasCheckOut: false, status: null };
    return {
      hasCheckIn: !!attendance.checkIn,
      hasCheckOut: !!attendance.checkOut,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
    };
  };

  const getTeacherAttendanceStatus = (teacherId: string): {
    hasCheckIn: boolean;
    hasCheckOut: boolean;
    checkIn: string | null | undefined;
    checkOut: string | null | undefined;
    status: string | null;
  } => {
    const attendance = teacherAttendance[teacherId];
    if (!attendance) {
      return { 
        hasCheckIn: false, 
        hasCheckOut: false, 
        checkIn: null, 
        checkOut: null, 
        status: null 
      };
    }
    return {
      hasCheckIn: !!attendance.checkIn,
      hasCheckOut: !!attendance.checkOut,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status || null,
    };
  };

  const handleViewDetails = (person: Student | Staff | Teacher) => {
    setSelectedPerson(person);
    setShowDetailsModal(true);
  };

  const filteredStudents = students.filter((student) => {
    const batchMatches =
      !exportBatchId ||
      (typeof student.batchId === 'object' && student.batchId !== null && student.batchId._id === exportBatchId);

    if (!batchMatches) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.studentId.toLowerCase().includes(term) ||
      student.mobile?.toLowerCase().includes(term)
    );
  });

  const filteredStaff = staff.filter((member) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(term) ||
      member.staffId.toLowerCase().includes(term) ||
      member.mobile?.toLowerCase().includes(term)
    );
  });

  const filteredTeachers = teachers.filter((teacher) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(term) ||
      teacher.teacherId?.toLowerCase().includes(term) ||
      teacher.mobile?.toLowerCase().includes(term)
    );
  });

  const batchOptions = Array.from(
    new Map(
      students
        .filter((student) => typeof student.batchId === 'object' && student.batchId !== null)
        .map((student) => {
          const batch = student.batchId as { _id: string; name: string };
          return [batch._id, batch];
        })
    ).values()
  );

  const handleExportStudentAttendance = async () => {
    try {
      setExporting(true);
      const response = await exportAllStudentAttendanceExcel({
        batchId: exportBatchId || undefined,
        date: selectedDate || undefined,
        status: exportStatus || undefined,
      });

      const url = window.URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Student attendance exported successfully');
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to export attendance');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Attendance</h1>
              <p className="text-sm text-slate-300">
                Manage attendance for students, staff, and teachers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-1">
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'students'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <span>Students</span>
              {students.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                  {students.length}
                </span>
              )}
            </div>
            {activeTab === 'students' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'staff'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              <span>Staff</span>
              {staff.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                  {staff.length}
                </span>
              )}
            </div>
            {activeTab === 'staff' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'teachers'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              <span>Teachers</span>
              {teachers.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                  {teachers.length}
                </span>
              )}
            </div>
            {activeTab === 'teachers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Search and Date Filter */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 flex-wrap">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {activeTab === 'students' && (
          <>
            <select
              value={exportBatchId}
              onChange={(e) => setExportBatchId(e.target.value)}
              title="Filter table by batch"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
            >
              <option value="">All Batches (Filter)</option>
              {batchOptions.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
            <select
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value as '' | 'Present' | 'Absent' | 'Late')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]"
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
            <button
              type="button"
              onClick={handleExportStudentAttendance}
              disabled={exporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Excel
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading {activeTab}...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === 'students' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const attendanceStatus = getStudentAttendanceStatus(student._id);
                      const hasInTime = attendanceStatus.hasInTime;
                      const hasOutTime = attendanceStatus.hasOutTime;
                      const selectedType = selectedAttendanceType[student._id];
                      const isLoading = attendanceLoading[student._id];

                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {typeof student.batchId === 'object' && student.batchId
                              ? student.batchId.name
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                student.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : student.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              {/* Show status if already marked as Absent or Late */}
                              {attendanceStatus.status === 'Absent' && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="font-semibold">Absent</span>
                                </div>
                              )}
                              {attendanceStatus.status === 'Late' && (
                                <div className="flex items-center gap-2 text-sm text-yellow-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-semibold">Late</span>
                                </div>
                              )}
                              
                              {/* In-Time Radio - Only show if not absent/late */}
                              {!hasInTime && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${student._id}`}
                                    checked={selectedType === 'inTime'}
                                    onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [student._id]: 'inTime' })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">In-Time</span>
                                </label>
                              )}
                              {hasInTime && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>In: {attendanceStatus.inTime ? new Date(attendanceStatus.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                              )}
                              
                              {/* Out-Time Radio - Only show if in-time is marked */}
                              {hasInTime && !hasOutTime && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${student._id}`}
                                    checked={selectedType === 'outTime'}
                                    onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [student._id]: 'outTime' })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Out-Time</span>
                                </label>
                              )}
                              {hasOutTime && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Out: {attendanceStatus.outTime ? new Date(attendanceStatus.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                              )}
                              
                              {/* Absent and Late Radio Buttons - Only show if no attendance marked */}
                              {!hasInTime && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${student._id}`}
                                      checked={selectedType === 'absent'}
                                      onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [student._id]: 'absent' })}
                                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-red-700">Absent</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${student._id}`}
                                      checked={selectedType === 'late'}
                                      onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [student._id]: 'late' })}
                                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span className="text-sm text-yellow-700">Late</span>
                                  </label>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {((!hasInTime && selectedType === 'inTime') || 
                              (hasInTime && !hasOutTime && selectedType === 'outTime') ||
                              selectedType === 'absent' || 
                              selectedType === 'late') && (
                              <button
                                onClick={() => handleMarkAttendance(student._id, selectedType as any)}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm ${
                                  selectedType === 'absent' 
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : selectedType === 'late'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Marking...
                                  </>
                                ) : (
                                  <>
                                    {selectedType === 'absent' ? (
                                      <XCircle className="w-4 h-4" />
                                    ) : selectedType === 'late' ? (
                                      <Clock className="w-4 h-4" />
                                    ) : (
                                      <Clock className="w-4 h-4" />
                                    )}
                                    Mark Attendance
                                  </>
                                )}
                              </button>
                            )}
                            {hasInTime && hasOutTime && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                              <span className="text-sm text-green-600 font-medium">Complete</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No staff found
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((member) => {
                      const attendanceStatus = getStaffAttendanceStatus(member._id);
                      const hasCheckIn = attendanceStatus.hasCheckIn;
                      const hasCheckOut = attendanceStatus.hasCheckOut;
                      const selectedType = selectedAttendanceType[member._id];
                      const isLoading = attendanceLoading[member._id];

                      return (
                        <tr key={member._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.staffId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                member.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              {/* Show status if already marked as Absent or Late */}
                              {attendanceStatus.status === 'Absent' && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="font-semibold">Absent</span>
                                </div>
                              )}
                              {attendanceStatus.status === 'Late' && (
                                <div className="flex items-center gap-2 text-sm text-yellow-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-semibold">Late</span>
                                </div>
                              )}
                              
                              {/* Check-In Radio - Only show if not absent/late */}
                              {!hasCheckIn && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${member._id}`}
                                    checked={selectedType === 'checkIn'}
                                    onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [member._id]: 'checkIn' })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Check-In</span>
                                </label>
                              )}
                              {hasCheckIn && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>In: {attendanceStatus.checkIn ? new Date(attendanceStatus.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                              )}
                              
                              {/* Check-Out Radio - Only show if check-in is marked */}
                              {hasCheckIn && !hasCheckOut && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${member._id}`}
                                    checked={selectedType === 'checkOut'}
                                    onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [member._id]: 'checkOut' })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Check-Out</span>
                                </label>
                              )}
                              {hasCheckOut && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Out: {attendanceStatus.checkOut ? new Date(attendanceStatus.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                              )}
                              
                              {/* Absent and Late Radio Buttons - Only show if no attendance marked */}
                              {!hasCheckIn && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${member._id}`}
                                      checked={selectedType === 'absent'}
                                      onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [member._id]: 'absent' })}
                                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-red-700">Absent</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${member._id}`}
                                      checked={selectedType === 'late'}
                                      onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [member._id]: 'late' })}
                                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span className="text-sm text-yellow-700">Late</span>
                                  </label>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {((!hasCheckIn && selectedType === 'checkIn') || 
                              (hasCheckIn && !hasCheckOut && selectedType === 'checkOut') ||
                              selectedType === 'absent' || 
                              selectedType === 'late') && (
                              <button
                                onClick={() => handleMarkAttendance(member._id, selectedType as any)}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm ${
                                  selectedType === 'absent' 
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : selectedType === 'late'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Marking...
                                  </>
                                ) : (
                                  <>
                                    {selectedType === 'absent' ? (
                                      <XCircle className="w-4 h-4" />
                                    ) : selectedType === 'late' ? (
                                      <Clock className="w-4 h-4" />
                                    ) : (
                                      <Clock className="w-4 h-4" />
                                    )}
                                    Mark Attendance
                                  </>
                                )}
                              </button>
                            )}
                            {hasCheckIn && hasCheckOut && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                              <span className="text-sm text-green-600 font-medium">Complete</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(member)}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No teachers found
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => {
                      const attendanceStatus = getTeacherAttendanceStatus(teacher._id);
                      const hasCheckIn = attendanceStatus.hasCheckIn;
                      const hasCheckOut = attendanceStatus.hasCheckOut;
                      const selectedType = selectedAttendanceType[teacher._id];
                      const isLoading = attendanceLoading[teacher._id];

                      return (
                        <tr key={teacher._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {teacher.teacherId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {teacher.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                teacher.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {teacher.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              {/* Check-In Radio */}
                              {!hasCheckIn && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${teacher._id}`}
                                    checked={selectedType === 'checkIn'}
                                    onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [teacher._id]: 'checkIn' })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Check-In</span>
                                </label>
                              )}
                              {hasCheckIn && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>In: {attendanceStatus.checkIn ? new Date(attendanceStatus.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                              )}
                              
                              {/* Check-Out Radio - Only show if check-in is marked */}
                              {hasCheckIn && !hasCheckOut && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${teacher._id}`}
                                    checked={selectedType === 'checkOut'}
                                    onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [teacher._id]: 'checkOut' })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Check-Out</span>
                                </label>
                              )}
                              {hasCheckOut && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Out: {attendanceStatus.checkOut ? new Date(attendanceStatus.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                              )}

                              {/* Absent and Late Radio Buttons - Only show if no attendance marked */}
                              {!hasCheckIn && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                                <>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${teacher._id}`}
                                      checked={selectedType === 'absent'}
                                      onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [teacher._id]: 'absent' })}
                                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-red-700">Absent</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`attendance-${teacher._id}`}
                                      checked={selectedType === 'late'}
                                      onChange={() => setSelectedAttendanceType({ ...selectedAttendanceType, [teacher._id]: 'late' })}
                                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span className="text-sm text-yellow-700">Late</span>
                                  </label>
                                </>
                              )}
                              {/* Display status if already marked as Absent or Late */}
                              {attendanceStatus.status === 'Absent' && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="font-semibold">Absent</span>
                                </div>
                              )}
                              {attendanceStatus.status === 'Late' && (
                                <div className="flex items-center gap-2 text-sm text-yellow-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-semibold">Late</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {((!hasCheckIn && selectedType === 'checkIn') || 
                              (hasCheckIn && !hasCheckOut && selectedType === 'checkOut') ||
                              selectedType === 'absent' || 
                              selectedType === 'late') && (
                              <button
                                onClick={() => handleMarkAttendance(teacher._id, selectedType as any)}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm ${
                                  selectedType === 'absent' 
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : selectedType === 'late'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Marking...
                                  </>
                                ) : (
                                  <>
                                    {selectedType === 'absent' ? (
                                      <XCircle className="w-4 h-4" />
                                    ) : selectedType === 'late' ? (
                                      <Clock className="w-4 h-4" />
                                    ) : (
                                      <Clock className="w-4 h-4" />
                                    )}
                                    Mark Attendance
                                  </>
                                )}
                              </button>
                            )}
                            {hasCheckIn && hasCheckOut && attendanceStatus.status !== 'Absent' && attendanceStatus.status !== 'Late' && (
                              <span className="text-sm text-green-600 font-medium">Complete</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetails(teacher)}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attendance Details Modal */}
      {selectedPerson && (
        <AttendanceDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPerson(null);
          }}
          type={activeTab === 'students' ? 'student' : activeTab === 'staff' ? 'staff' : 'teacher'}
          person={selectedPerson}
        />
      )}

      {/* Time Selection Modal */}
      {pendingAttendance && (
        <TimeSelectionModal
          isOpen={showTimeModal}
          onClose={() => {
            setShowTimeModal(false);
            setPendingAttendance(null);
          }}
          onConfirm={(time) => {
            if (pendingAttendance) {
              processAttendance(pendingAttendance.id, pendingAttendance.type, time);
            }
            setShowTimeModal(false);
            setPendingAttendance(null);
          }}
          title={
            pendingAttendance.type === 'inTime' 
              ? 'Select In-Time' 
              : pendingAttendance.type === 'outTime'
              ? 'Select Out-Time'
              : pendingAttendance.type === 'checkIn'
              ? 'Select Check-In Time'
              : pendingAttendance.type === 'checkOut'
              ? 'Select Check-Out Time'
              : 'Select Time'
          }
          personName={pendingAttendance.personName}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
