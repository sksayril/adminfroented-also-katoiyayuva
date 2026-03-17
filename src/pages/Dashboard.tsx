import { useState, useEffect } from 'react';
import {
  Home, Users, UserCheck, TrendingUp, DollarSign, AlertCircle,
  GraduationCap, BookOpen, Calendar, FileText, CreditCard, BarChart3,
  Activity, Clock, CheckCircle
} from 'lucide-react';
import {
  getComprehensiveDashboard,
  ComprehensiveDashboardData,
  ApiError
} from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { SkeletonStatsGrid, SkeletonChart, SkeletonList, SkeletonCard } from '../components/Skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { branch } = useAuth();
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState<ComprehensiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const getPageBg = () => {
    switch (theme) {
      case 'light': return 'bg-gray-50';
      case 'dark': return 'bg-slate-900';
      case 'blue': return 'bg-blue-50';
      case 'green': return 'bg-green-50';
      case 'purple': return 'bg-purple-50';
      default: return 'bg-gray-100';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getComprehensiveDashboard();
      setDashboardData(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load dashboard data');
      toast.error(apiError.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
                <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <SkeletonStatsGrid />

        {/* Today's Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height={300} />
          <SkeletonChart height={300} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height={300} />
          <SkeletonChart height={300} />
        </div>

        {/* Recent Activities Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <SkeletonList items={5} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <SkeletonList items={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { overview, today, currentMonth, charts, recentActivities, alerts, performance } = dashboardData;

  return (
    <div className={`p-6 space-y-6 min-h-screen ${getPageBg()}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-slate-300">
                {branch?.name || 'Branch'} - {branch?.code || 'Branch Code'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students */}
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">Total Students</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{overview.totalStudents}</div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-green-600">Active: {overview.activeStudents}</span>
            <span className="text-yellow-600">Pending: {overview.pendingStudents}</span>
            <span className="text-red-600">Dropped: {overview.droppedStudents}</span>
          </div>
        </div>

        {/* Staff */}
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">Total Staff</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{overview.totalStaff}</div>
          <p className="text-xs text-gray-500 mt-1">Active: {overview.activeStaff}</p>
        </div>

        {/* Teachers */}
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">Total Teachers</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{overview.totalTeachers}</div>
          <p className="text-xs text-gray-500 mt-1">Active: {overview.activeTeachers}</p>
        </div>

        {/* Batches */}
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">Total Batches</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{overview.totalBatches}</div>
          <p className="text-xs text-gray-500 mt-1">Active: {overview.activeBatches}</p>
        </div>
      </div>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Student Attendance</h3>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">{today.studentAttendance.percentage}%</div>
          <p className="text-xs opacity-80 mt-1">
            {today.studentAttendance.present} / {today.studentAttendance.total}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Staff Attendance</h3>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">{today.staffAttendance.percentage}%</div>
          <p className="text-xs opacity-80 mt-1">
            {today.staffAttendance.present} / {today.staffAttendance.total}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Today's Collection</h3>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">₹{today.feeCollection.toLocaleString('en-IN')}</div>
          <p className="text-xs opacity-80 mt-1">New Students: {today.newStudents}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">New Inquiries</h3>
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">{today.newInquiries}</div>
          <p className="text-xs opacity-80 mt-1">Total: {overview.totalInquiries}</p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Current Month Collection</h3>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">₹{currentMonth.feeCollection.toLocaleString('en-IN')}</div>
          <p className="text-xs opacity-80 mt-1">Payments: {currentMonth.paymentCount}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Total Due Fees</h3>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">₹{currentMonth.totalDueFees.toLocaleString('en-IN')}</div>
          <p className="text-xs opacity-80 mt-1">Across all students</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Batch Utilization</h3>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{performance.overallBatchUtilization}%</div>
          <p className="text-xs opacity-80 mt-1">
            {performance.totalBatchCurrent} / {performance.totalBatchCapacity} students
          </p>
        </div>
      </div>

      {/* Charts Row 1: Attendance & Fee Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Attendance Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts.attendance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="studentAttendance"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorStudent)"
                name="Student Attendance %"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="staffAttendance"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorStaff)"
                name="Staff Attendance %"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Collection Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Fee Collection (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.feeCollection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => value ? `₹${Number(value).toLocaleString('en-IN')}` : '₹0'} />
              <Legend />
              <Bar dataKey="amount" fill="#10b981" name="Amount (₹)" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Student Status & Payment Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Status Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Student Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.studentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                animationDuration={1000}
              >
                {charts.studentStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Mode Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Mode Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.paymentMode}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                animationDuration={1000}
              >
                {charts.paymentMode.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: Course Enrollment & Batch Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Enrollment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Course Enrollment
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.courseEnrollment} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="courseName" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#6366f1" name="Students" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Batch Utilization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            Batch Utilization
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.batchUtilization} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batchName" />
              <YAxis />
              <Tooltip formatter={(value) => value ? `${value}%` : '0%'} />
              <Legend />
              <Bar dataKey="utilization" fill="#f59e0b" name="Utilization %" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {/* Recent Students */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Students</h4>
              <div className="space-y-2">
                {recentActivities.students.map((student) => (
                  student && (
                    <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {student.studentName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{student.studentName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 font-mono">{student.studentId || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        student.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.status || 'N/A'}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Payments</h4>
              <div className="space-y-2">
                {recentActivities.payments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {payment.studentId && typeof payment.studentId === 'object' && payment.studentId !== null
                          ? payment.studentId.studentName || 'Unknown'
                          : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.studentId && typeof payment.studentId === 'object' && payment.studentId !== null
                          ? payment.studentId.studentId || ''
                          : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        ₹{payment.amount?.toLocaleString('en-IN') || '0'}
                      </p>
                      <p className="text-xs text-gray-500">{payment.paymentMode || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No alerts at this time</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'HIGH_DUE'
                      ? 'bg-red-50 border-red-500'
                      : alert.type === 'PENDING_APPROVAL'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">{alert.message}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        alert.type === 'HIGH_DUE'
                          ? 'bg-red-100 text-red-700'
                          : alert.type === 'PENDING_APPROVAL'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
