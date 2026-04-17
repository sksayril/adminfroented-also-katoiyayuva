// const BASE_URL = 'http://localhost:3000/api';
// const BASE_URL = 'https://api.memarijatiyayuva.live/api';
const BASE_URL = 'https://7cvccltb-3113.inc1.devtunnels.ms/api';

export interface LoginRequest {
  email?: string;
  adminId?: string;
  password: string;
}

export interface BranchAddress {
  areaname: string;
  city: string;
  pincode: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Branch {
  _id: string;
  name: string;
  code: string;
  addresses: BranchAddress[];
  contactNumber: string;
  status: 'ACTIVE' | 'LOCKED';
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  jwt_token: string;
  role: string;
  branchId: string;
  branch: Branch;
  user: User;
}

export interface ApiError {
  message: string;
  status: number;
}

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('jwt_token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('jwt_token');
};

// Store user data in localStorage
export const setUserData = (data: Omit<LoginResponse, 'jwt_token'>): void => {
  localStorage.setItem('user_data', JSON.stringify(data));
};

// Get user data from localStorage
export const getUserData = (): Omit<LoginResponse, 'jwt_token'> | null => {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

// Remove user data from localStorage
export const removeUserData = (): void => {
  localStorage.removeItem('user_data');
};

// Admin Login API
export const adminLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Login failed',
        status: response.status,
      };
      throw error;
    }

    // Store token and user data
    if (data.jwt_token) {
      setToken(data.jwt_token);
      setUserData({
        success: data.success,
        role: data.role,
        branchId: data.branchId,
        branch: data.branch,
        user: data.user,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Admin Logout API
export const adminLogout = async (): Promise<LogoutResponse> => {
  try {
    const token = getToken();

    if (!token) {
      throw {
        message: 'No token found',
        status: 401,
      } as ApiError;
    }

    const response = await fetch(`${BASE_URL}/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Logout failed',
        status: response.status,
      };
      throw error;
    }

    // Clear token and user data
    removeToken();
    removeUserData();

    return data;
  } catch (error) {
    // Even if API call fails, clear local storage
    removeToken();
    removeUserData();

    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Logout function (local only, for fallback)
export const logout = (): void => {
  removeToken();
  removeUserData();
};

// Create authenticated fetch function
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();

  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set Content-Type if not FormData and not already set
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });
};

// Dashboard Summary Interfaces
export interface DashboardAlert {
  type: string;
  message: string;
  count: number;
}

export interface DashboardSummaryData {
  totalStudents: number;
  totalStaff: number;
  todayStudentAttendancePercentage: number;
  todayStaffAttendancePercentage: number;
  currentMonthFeeCollection: number;
  totalDueFees: number;
  alerts: DashboardAlert[];
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummaryData;
}

// Get Dashboard Summary API
export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  try {
    const response = await authenticatedFetch('/admin/dashboard/summary', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch dashboard summary',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// ==================== COMPREHENSIVE DASHBOARD ====================

export interface DashboardOverview {
  totalStudents: number;
  activeStudents: number;
  pendingStudents: number;
  droppedStudents: number;
  totalStaff: number;
  activeStaff: number;
  totalTeachers: number;
  activeTeachers: number;
  totalBatches: number;
  activeBatches: number;
  totalCourses: number;
  totalExams: number;
  totalResults: number;
  totalInquiries: number;
  newInquiries: number;
  totalCertificates: number;
  totalRecordedClasses: number;
}

export interface AttendanceData {
  percentage: number;
  present: number;
  total: number;
}

export interface DashboardToday {
  studentAttendance: AttendanceData;
  staffAttendance: AttendanceData;
  feeCollection: number;
  newStudents: number;
  newInquiries: number;
}

export interface DashboardCurrentMonth {
  feeCollection: number;
  paymentCount: number;
  totalDueFees: number;
}

export interface AttendanceChartData {
  date: string;
  studentAttendance: number;
  staffAttendance: number;
  studentPresent: number;
  studentTotal: number;
  staffPresent: number;
  staffTotal: number;
}

export interface FeeCollectionChartData {
  month: string;
  amount: number;
  count: number;
}

export interface StudentStatusChartData {
  status: string;
  count: number;
}

export interface CourseEnrollmentChartData {
  courseName: string;
  count: number;
}

export interface BatchUtilizationChartData {
  batchName: string;
  current: number;
  max: number;
  utilization: number;
}

export interface PaymentModeChartData {
  mode: string;
  count: number;
  total: number;
}

export interface DashboardCharts {
  attendance: AttendanceChartData[];
  feeCollection: FeeCollectionChartData[];
  studentStatus: StudentStatusChartData[];
  courseEnrollment: CourseEnrollmentChartData[];
  batchUtilization: BatchUtilizationChartData[];
  paymentMode: PaymentModeChartData[];
}

export interface RecentStudent {
  _id: string;
  studentId: string;
  studentName: string;
  status: string;
  createdAt: string;
}

export interface RecentPayment {
  _id: string;
  studentId: {
    _id: string;
    studentId: string;
    studentName: string;
  };
  amount: number;
  paymentMode: string;
  createdAt: string;
}

export interface DashboardRecentActivities {
  students: RecentStudent[];
  payments: RecentPayment[];
}

export interface DashboardPerformance {
  avgBatchUtilization: number;
  overallBatchUtilization: number;
  totalBatchCapacity: number;
  totalBatchCurrent: number;
}

export interface ComprehensiveDashboardData {
  overview: DashboardOverview;
  today: DashboardToday;
  currentMonth: DashboardCurrentMonth;
  charts: DashboardCharts;
  recentActivities: DashboardRecentActivities;
  alerts: DashboardAlert[];
  performance: DashboardPerformance;
}

export interface ComprehensiveDashboardResponse {
  success: boolean;
  data: ComprehensiveDashboardData;
}

// Get Comprehensive Dashboard Data API
export const getComprehensiveDashboard = async (): Promise<ComprehensiveDashboardResponse> => {
  try {
    const response = await authenticatedFetch('/admin/dashboard', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch dashboard data',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Courses Interfaces
export interface Course {
  _id: string;
  name: string;
  description: string;
  duration: string;
  courseCategory: 'Basic' | 'Advanced' | 'Diploma';
  courseFees: number;
  admissionFees: number;
  monthlyFees: number;
  imageUrl: string;
  pdfUrl: string;
  isActive: boolean;
  createdBy: 'SUPER_ADMIN' | 'ADMIN';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
}

export interface CoursesQueryParams {
  courseCategory?: 'Basic' | 'Advanced' | 'Diploma';
  isActive?: boolean;
}

// Get Courses API
export const getCourses = async (params?: CoursesQueryParams): Promise<CoursesResponse> => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.courseCategory) {
      queryParams.append('courseCategory', params.courseCategory);
    }
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = `/admin/courses${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch courses',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

export interface CreateCourseRequest {
  name: string;
  description: string;
  duration: string;
  courseCategory: 'Basic' | 'Advanced' | 'Diploma';
  courseFees: number;
  admissionFees: number;
  monthlyFees: number;
  image?: File;
  pdf?: File;
}

export interface CreateCourseResponse {
  success: boolean;
  message: string;
  data: Course;
}

// Create Course API
export const createCourse = async (courseData: CreateCourseRequest): Promise<CreateCourseResponse> => {
  try {
    const token = getToken();

    if (!token) {
      throw {
        message: 'No token found',
        status: 401,
      } as ApiError;
    }

    // Create FormData for file uploads
    const formData = new FormData();
    formData.append('name', courseData.name);
    formData.append('description', courseData.description);
    formData.append('duration', courseData.duration);
    formData.append('courseCategory', courseData.courseCategory);
    formData.append('courseFees', courseData.courseFees.toString());
    formData.append('admissionFees', courseData.admissionFees.toString());
    formData.append('monthlyFees', courseData.monthlyFees.toString());

    if (courseData.image) {
      formData.append('image', courseData.image);
    }

    if (courseData.pdf) {
      formData.append('pdf', courseData.pdf);
    }

    const response = await fetch(`${BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to create course',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Teachers Interfaces
export interface TeacherBatch {
  _id: string;
  name: string;
  timeSlot: string;
  courseId: string;
}

export interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  mobile: string;
  assignedBatches: TeacherBatch[] | string[];
  salaryType: 'PER_CLASS' | 'MONTHLY_FIXED' | 'HOURLY';
  salaryRate: number;
  currentMonthClasses?: number;
  currentMonthSalary?: number;
  imageUrl: string;
  password: string;
  isActive: boolean;
  branchId?: {
    _id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface TeachersResponse {
  success: boolean;
  count: number;
  data: Teacher[];
}

export interface TeacherResponse {
  success: boolean;
  data: Teacher;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  salaryType: 'PER_CLASS' | 'MONTHLY_FIXED' | 'HOURLY';
  salaryRate: number;
  assignedBatches?: string[];
  teacherImage?: File;
}

export interface UpdateTeacherRequest {
  name?: string;
  email?: string;
  mobile?: string;
  assignedBatches?: string[];
  salaryType?: 'PER_CLASS' | 'MONTHLY_FIXED' | 'HOURLY';
  salaryRate?: number;
  isActive?: boolean;
}

export interface CreateTeacherResponse {
  success: boolean;
  message: string;
  data: Teacher;
}

export interface UpdateTeacherResponse {
  success: boolean;
  message: string;
  data: Teacher;
}

export interface DeleteTeacherResponse {
  success: boolean;
  message: string;
}

// Get All Teachers API
export const getTeachers = async (isActive?: boolean): Promise<TeachersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) {
      queryParams.append('isActive', isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = `/admin/teachers${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch teachers',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Teacher by ID API
export const getTeacherById = async (id: string): Promise<TeacherResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/teachers/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch teacher',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Create Teacher API
export const createTeacher = async (teacherData: CreateTeacherRequest): Promise<CreateTeacherResponse> => {
  try {
    const token = getToken();

    if (!token) {
      throw {
        message: 'No token found',
        status: 401,
      } as ApiError;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', teacherData.name);
    formData.append('email', teacherData.email);
    formData.append('mobile', teacherData.mobile);
    formData.append('password', teacherData.password);
    formData.append('salaryType', teacherData.salaryType);
    formData.append('salaryRate', teacherData.salaryRate.toString());

    if (teacherData.assignedBatches && teacherData.assignedBatches.length > 0) {
      formData.append('assignedBatches', JSON.stringify(teacherData.assignedBatches));
    }

    if (teacherData.teacherImage) {
      formData.append('teacherImage', teacherData.teacherImage);
    }

    const response = await fetch(`${BASE_URL}/admin/teachers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to create teacher',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Teacher API
export const updateTeacher = async (id: string, teacherData: UpdateTeacherRequest): Promise<UpdateTeacherResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/teachers/${id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teacherData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to update teacher',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Delete Teacher API
export const deleteTeacher = async (id: string): Promise<DeleteTeacherResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/teachers/${id}/delete`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to delete teacher',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Batches Interfaces
export interface CourseInfo {
  _id: string;
  name: string;
  courseCategory: string;
}

export interface TeacherInfo {
  _id: string;
  name: string;
  email: string;
}

export interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Batch {
  _id: string;
  name: string;
  timeSlot: string;
  weekdays: string[];
  daySchedules?: DaySchedule[];
  monthlyFee: number;
  isKidsBatch: boolean;
  discountPercentage: number;
  batchType: 'OFFLINE' | 'ONLINE' | 'HYBRID';
  courseId: CourseInfo | string;
  teacherId: TeacherInfo | string | null;
  maxStudents: number;
  currentStudents: number;
  isActive: boolean;
  branchId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BatchesResponse {
  success: boolean;
  data: Batch[];
}

export interface BatchResponse {
  success: boolean;
  data: Batch;
}

export interface CreateBatchRequest {
  name: string;
  timeSlot?: string;
  weekdays?: string[];
  daySchedules?: DaySchedule[];
  monthlyFee?: number;
  isKidsBatch?: boolean;
  discountPercentage?: number;
  batchType: 'OFFLINE' | 'ONLINE' | 'HYBRID';
  teacherId?: string;
  courseId: string;
  maxStudents: number;
}

export interface UpdateBatchRequest {
  name?: string;
  timeSlot?: string;
  weekdays?: string[];
  daySchedules?: DaySchedule[];
  monthlyFee?: number;
  teacherId?: string;
  maxStudents?: number;
  isActive?: boolean;
}

export interface CreateBatchResponse {
  success: boolean;
  message: string;
  data: Batch;
}

export interface UpdateBatchResponse {
  success: boolean;
  message: string;
  data: Batch;
}

export interface DeleteBatchResponse {
  success: boolean;
  message: string;
}

export interface AssignTeacherRequest {
  teacherId: string;
}

export interface BatchesQueryParams {
  courseId?: string;
  isActive?: boolean;
  isKidsBatch?: boolean;
}

// Get All Batches API
export const getBatches = async (params?: BatchesQueryParams): Promise<BatchesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.courseId) {
      queryParams.append('courseId', params.courseId);
    }
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }
    if (params?.isKidsBatch !== undefined) {
      queryParams.append('isKidsBatch', params.isKidsBatch.toString());
    }

    const queryString = queryParams.toString();
    const url = `/admin/batches${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch batches',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Batch by ID API
export const getBatchById = async (id: string): Promise<BatchResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/batches/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch batch',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Create Batch API
export const createBatch = async (batchData: CreateBatchRequest): Promise<CreateBatchResponse> => {
  try {
    const response = await authenticatedFetch('/admin/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to create batch',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Batch API
export const updateBatch = async (id: string, batchData: UpdateBatchRequest): Promise<UpdateBatchResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/batches/${id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to update batch',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Delete Batch API
export const deleteBatch = async (id: string): Promise<DeleteBatchResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/batches/${id}/delete`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to delete batch',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Assign Teacher to Batch API
export const assignTeacherToBatch = async (batchId: string, teacherId: string): Promise<BatchResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/batches/${batchId}/assign-teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teacherId }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to assign teacher to batch',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Staff Interfaces
export interface Staff {
  _id: string;
  staffId: string;
  name: string;
  email: string;
  mobile: string;
  role: 'STAFF';
  salaryType: 'MONTHLY_FIXED';
  salaryRate: number;
  currentMonthClasses: number;
  currentMonthSalary: number;
  imageUrl?: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffResponse {
  success: boolean;
  data: Staff;
}

export interface StaffsResponse {
  success: boolean;
  data: Staff[];
}

export interface StaffsQueryParams {
  role?: 'STAFF' | 'TEACHER';
  isActive?: boolean;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  salaryType: 'MONTHLY_FIXED';
  salaryRate: number;
}

export interface CreateStaffResponse {
  success: boolean;
  message: string;
  data: Staff;
}

export interface UpdateStaffRequest {
  name?: string;
  email?: string;
  mobile?: string;
  salaryType?: 'MONTHLY_FIXED';
  salaryRate?: number;
  isActive?: boolean;
}

export interface UpdateStaffResponse {
  success: boolean;
  message: string;
  data: Staff;
}

export interface DeleteStaffResponse {
  success: boolean;
  message: string;
}

// Get All Staff API
export const getStaff = async (params?: StaffsQueryParams): Promise<StaffsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.role) {
      queryParams.append('role', params.role);
    }
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = `/admin/staff${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch staff',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Staff by ID API
export const getStaffById = async (id: string): Promise<StaffResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/staff/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch staff',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Create Staff API
export const createStaff = async (staffData: CreateStaffRequest, imageFile?: File): Promise<CreateStaffResponse> => {
  try {
    let response: Response;

    if (imageFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', staffData.name);
      formData.append('email', staffData.email);
      formData.append('mobile', staffData.mobile);
      formData.append('password', staffData.password);
      formData.append('salaryType', staffData.salaryType);
      formData.append('salaryRate', staffData.salaryRate.toString());
      formData.append('staffImage', imageFile);

      response = await authenticatedFetch('/admin/staff', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Use JSON for data without image
      response = await authenticatedFetch('/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to create staff',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Staff API
export const updateStaff = async (id: string, staffData: UpdateStaffRequest): Promise<UpdateStaffResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/staff/${id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to update staff',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Delete Staff API
export const deleteStaff = async (id: string): Promise<DeleteStaffResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/staff/${id}/delete`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to delete staff',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// ==================== STUDENT MANAGEMENT ====================

// Student Interfaces
export interface Student {
  _id: string;
  studentId: string;
  name: string;
  guardianName?: string;
  mobile: string;
  email?: string;
  courseId?: {
    _id: string;
    name: string;
    courseCategory: string;
  } | null;
  batchId?: {
    _id: string;
    name: string;
    timeSlot: string;
  } | null;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'DROPPED';
  totalFees?: number;
  paidAmount?: number;
  dueAmount?: number;
  qrCode?: string;
  registrationDate?: string;
  studentPhoto?: string;
  studentSignature?: string;
  officeSignature?: string;
  formScanImage?: string;
  admission?: {
    admission_date?: string;
    course?: {
      code?: string;
      type?: string;
    };
  };
  student?: {
    name?: string;
    date_of_birth?: string;
    gender?: string;
    religion?: string;
    caste?: string;
  };
  family_details?: {
    guardian_name?: string;
    mother_name?: string;
  };
  contact_details?: {
    mobile?: string;
    whatsapp?: string;
    guardian_contact?: string;
    email?: string;
  };
  address?: {
    village?: string;
    post_office?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  education?: {
    last_qualification?: string;
  };
  office_use?: {
    form_number?: string;
    receipt_number?: string;
    batch_time?: string;
    date?: string;
  };
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
}

export interface StudentResponse {
  success: boolean;
  data: Student;
}

export interface CreateStudentResponse {
  success: boolean;
  message: string;
  data: {
    studentId: string;
    studentName: string;
    loginCredentials: {
      email: string;
      password: string;
    };
  };
}

export interface UpdateStudentResponse {
  success: boolean;
  message: string;
  data: Student;
}

export interface DeleteStudentResponse {
  success: boolean;
  message: string;
}

export interface StudentsQueryParams {
  status?: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'DROPPED';
  batchId?: string;
  courseId?: string;
}

export interface ManualStudentRegistrationData {
  admission?: {
    admission_date?: string;
    course?: {
      code?: string;
      type?: string;
    };
  };
  student?: {
    name?: string;
    date_of_birth?: string;
    gender?: string;
    religion?: string;
    caste?: string;
  };
  family_details?: {
    guardian_name?: string;
    mother_name?: string;
  };
  contact_details?: {
    mobile?: string;
    whatsapp?: string;
    guardian_contact?: string;
    email?: string;
  };
  address?: {
    village?: string;
    post_office?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  education?: {
    last_qualification?: string;
  };
  office_use?: {
    form_number?: string;
    receipt_number?: string;
    batch_time?: string;
    date?: string;
  };
  studentId?: string;
  branchId?: string;
  status?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DROPPED';
  batchId?: string;
  courseId?: string;
}

// Get All Students
export const getStudents = async (params?: StudentsQueryParams): Promise<StudentsResponse> => {
  try {
    let url = '/admin/students';
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.batchId) {
      queryParams.append('batchId', params.batchId);
    }
    if (params?.courseId) {
      queryParams.append('courseId', params.courseId);
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch students',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Student by ID
export const getStudentById = async (id: string): Promise<StudentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/students/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to fetch student',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Manual Student Registration
export const registerStudent = async (
  studentData: ManualStudentRegistrationData,
  files?: {
    studentPhoto?: File;
    studentSignature?: File;
    officeSignature?: File;
    formScanImage?: File;
    aadharCardImage?: File;
    schoolCertificateImage?: File;
  }
): Promise<CreateStudentResponse> => {
  try {
    const formData = new FormData();

    // Add nested objects as JSON strings
    // student and contact_details are REQUIRED - always include them
    if (studentData.student) {
      formData.append('student', JSON.stringify(studentData.student));
    }
    if (studentData.contact_details) {
      formData.append('contact_details', JSON.stringify(studentData.contact_details));
    }

    // Optional nested objects - only include if they have data
    if (studentData.admission && (studentData.admission.admission_date || studentData.admission.course?.code)) {
      formData.append('admission', JSON.stringify(studentData.admission));
    }
    if (studentData.family_details && (studentData.family_details.guardian_name || studentData.family_details.mother_name)) {
      formData.append('family_details', JSON.stringify(studentData.family_details));
    }
    if (studentData.address && (studentData.address.village || studentData.address.district || studentData.address.state)) {
      formData.append('address', JSON.stringify(studentData.address));
    }
    if (studentData.education && studentData.education.last_qualification) {
      formData.append('education', JSON.stringify(studentData.education));
    }
    if (studentData.office_use && (studentData.office_use.form_number || studentData.office_use.receipt_number || studentData.office_use.batch_time)) {
      formData.append('office_use', JSON.stringify(studentData.office_use));
    }

    // Add simple fields
    if (studentData.studentId) {
      formData.append('studentId', studentData.studentId);
    }
    if (studentData.branchId) {
      formData.append('branchId', studentData.branchId);
    }
    if (studentData.status) {
      formData.append('status', studentData.status);
    }
    if (studentData.batchId) {
      formData.append('batchId', studentData.batchId);
    }
    if (studentData.courseId) {
      formData.append('courseId', studentData.courseId);
    }

    // Add files
    if (files?.studentPhoto) {
      formData.append('studentPhoto', files.studentPhoto);
    }
    if (files?.studentSignature) {
      formData.append('studentSignature', files.studentSignature);
    }
    if (files?.officeSignature) {
      formData.append('officeSignature', files.officeSignature);
    }
    if (files?.formScanImage) {
      formData.append('formScanImage', files.formScanImage);
    }
    if (files?.aadharCardImage) {
      formData.append('aadharCardImage', files.aadharCardImage);
    }
    if (files?.schoolCertificateImage) {
      formData.append('schoolCertificateImage', files.schoolCertificateImage);
    }

    const response = await authenticatedFetch('/admin/students/manual', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to register student',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Student API
export const updateStudent = async (
  id: string,
  studentData: Partial<ManualStudentRegistrationData>,
  files?: {
    studentPhoto?: File;
    studentSignature?: File;
    officeSignature?: File;
    formScanImage?: File;
    aadharCardImage?: File;
    schoolCertificateImage?: File;
  }
): Promise<UpdateStudentResponse> => {
  try {
    const formData = new FormData();

    // Add nested objects as JSON strings
    if (studentData.student) {
      formData.append('student', JSON.stringify(studentData.student));
    }
    if (studentData.contact_details) {
      formData.append('contact_details', JSON.stringify(studentData.contact_details));
    }
    if (studentData.admission) {
      formData.append('admission', JSON.stringify(studentData.admission));
    }
    if (studentData.family_details) {
      formData.append('family_details', JSON.stringify(studentData.family_details));
    }
    if (studentData.address) {
      formData.append('address', JSON.stringify(studentData.address));
    }
    if (studentData.education) {
      formData.append('education', JSON.stringify(studentData.education));
    }
    if (studentData.office_use) {
      formData.append('office_use', JSON.stringify(studentData.office_use));
    }

    // Add simple fields
    if (studentData.status) {
      formData.append('status', studentData.status);
    }
    if (studentData.batchId) {
      formData.append('batchId', studentData.batchId);
    }
    if (studentData.courseId) {
      formData.append('courseId', studentData.courseId);
    }

    // Add files
    if (files) {
      if (files.studentPhoto) formData.append('studentPhoto', files.studentPhoto);
      if (files.studentSignature) formData.append('studentSignature', files.studentSignature);
      if (files.officeSignature) formData.append('officeSignature', files.officeSignature);
      if (files.formScanImage) formData.append('formScanImage', files.formScanImage);
      if (files.aadharCardImage) formData.append('aadharCardImage', files.aadharCardImage);
      if (files.schoolCertificateImage) formData.append('schoolCertificateImage', files.schoolCertificateImage);
    }

    const response = await authenticatedFetch(`/admin/students/${id}`, {
      method: 'PATCH',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to update student',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Delete Student API
export const deleteStudent = async (id: string): Promise<DeleteStudentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/students/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to delete student',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Approve Pending Student
export const approveStudent = async (id: string): Promise<StudentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/students/${id}/approve`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to approve student',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Drop Student
export const dropStudent = async (id: string): Promise<StudentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/students/${id}/drop`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to drop student',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Reactivate Dropped Student
export const reactivateStudent = async (id: string, batchId?: string): Promise<StudentResponse> => {
  try {
    const body: { batchId?: string } = {};
    if (batchId) {
      body.batchId = batchId;
    }

    const response = await authenticatedFetch(`/admin/students/${id}/reactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to reactivate student',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Change Student Batch
export const changeStudentBatch = async (id: string, newBatchId: string): Promise<StudentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/students/${id}/change-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newBatchId }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to change student batch',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Join Student to Batch
export const joinStudentToBatch = async (studentId: string, batchId: string): Promise<StudentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/students/${studentId}/join-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ batchId }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Failed to join student to batch',
        status: response.status,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// ==================== PAYMENTS ====================

export interface Payment {
  _id: string;
  studentId: string | {
    _id: string;
    studentId: string;
    name: string;
    mobile: string;
    email?: string;
  };
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'ONLINE';
  discount?: number;
  receiptNumber?: string;
  month?: string;
  year?: number;
  description?: string;
  receiptPdfUrl?: string;
  collectedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentRequest {
  studentId: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'ONLINE';
  discount?: number;
  description?: string;
  month?: string;
  year?: number;
}

export interface UpdatePaymentRequest {
  amount?: number;
  paymentMode?: 'CASH' | 'UPI' | 'ONLINE';
  discount?: number;
  description?: string;
}

export interface PaymentsQueryParams {
  studentId?: string;
  startDate?: string;
  endDate?: string;
  paymentMode?: 'CASH' | 'UPI' | 'ONLINE';
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface UpdatePaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface DeletePaymentResponse {
  success: boolean;
  message: string;
}

// Create Payment
export const createPayment = async (paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to create payment',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Payments
export const getPayments = async (params?: PaymentsQueryParams): Promise<PaymentsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.paymentMode) queryParams.append('paymentMode', params.paymentMode);

    const url = `/admin/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch payments',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Payment by ID
export const getPaymentById = async (paymentId: string): Promise<PaymentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/payments/${paymentId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch payment',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Payment
export const updatePayment = async (paymentId: string, paymentData: UpdatePaymentRequest): Promise<UpdatePaymentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/payments/${paymentId}/update`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to update payment',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Delete Payment
export const deletePayment = async (paymentId: string): Promise<DeletePaymentResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/payments/${paymentId}/delete`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to delete payment',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// ==================== ATTENDANCE MANAGEMENT ====================

// Attendance Interfaces
export interface StudentAttendance {
  _id: string;
  studentId: string | {
    _id: string;
    studentId: string;
    name: string;
  };
  batchId?: string | {
    _id: string;
    name: string;
    timeSlot: string;
  };
  date: string;
  timeSlot?: string;
  inTime?: string | null;
  outTime?: string | null;
  status: string;
  method?: 'QR' | 'FACE' | 'MANUAL';
  markedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffAttendance {
  _id: string;
  staffId: string | {
    _id: string;
    staffId: string;
    name: string;
  };
  date: string;
  timeSlot?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  method?: 'QR' | 'MANUAL';
  markedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAttendanceResponse {
  success: boolean;
  data: StudentAttendance[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StaffAttendanceResponse {
  success: boolean;
  data: StaffAttendance[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: StudentAttendance | StaffAttendance;
}

export interface MarkStudentInTimeRequest {
  studentId: string;
  date: string;
  timeSlot?: string;
  method?: 'QR' | 'FACE' | 'MANUAL';
  qrData?: string;
  inTime?: string;
}

export interface MarkStudentOutTimeRequest {
  studentId: string;
  date: string;
  outTime?: string;
  method?: 'QR' | 'FACE' | 'MANUAL';
  qrData?: string;
}

export interface UpdateStudentAttendanceRequest {
  status?: 'Present' | 'Absent' | 'Late';
  method?: 'QR' | 'FACE' | 'MANUAL';
  inTime?: string;
  outTime?: string;
  date?: string;
}

export interface MarkStaffCheckInRequest {
  staffId: string;
  date: string;
  timeSlot?: string;
  method?: 'QR' | 'MANUAL';
  qrData?: string;
  checkIn?: string;
}

export interface MarkStaffCheckOutRequest {
  staffId: string;
  date: string;
  checkOut?: string;
  method?: 'QR' | 'MANUAL';
  qrData?: string;
}

export interface UpdateStaffAttendanceRequest {
  status?: 'Present' | 'Absent' | 'Late';
  method?: 'QR' | 'MANUAL';
  checkIn?: string;
  checkOut?: string;
  date?: string;
}

export interface StudentAttendanceQueryParams {
  studentId?: string;
  batchId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StudentAttendanceExportQueryParams {
  batchId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: 'Present' | 'Absent' | 'Late';
}

export interface AttendanceExportFileResponse {
  blob: Blob;
  filename: string;
}

export interface StaffAttendanceQueryParams {
  staffId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TeacherAttendance {
  _id: string;
  staffId?: string | {
    _id: string;
    staffId: string;
    name: string;
    role: string;
    email: string;
    mobile: string;
  };
  teacher?: {
    _id: string;
    teacherId: string;
    name: string;
    email: string;
    mobile: string;
  };
  date: string;
  timeSlot?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  method?: 'QR' | 'MANUAL';
  markedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherAttendanceResponse {
  success: boolean;
  data: {
    attendance: TeacherAttendance[];
    statistics?: {
      totalRecords: number;
      totalTeachers: number;
      present: number;
      absent: number;
      late: number;
      attendancePercentage: number;
    };
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface MarkTeacherCheckInRequest {
  teacherId: string;
  date: string;
  timeSlot?: string;
  method?: 'QR' | 'MANUAL';
  qrData?: string;
  checkIn?: string;
}

export interface MarkTeacherCheckOutRequest {
  teacherId: string;
  date: string;
  checkOut?: string;
  method?: 'QR' | 'MANUAL';
  qrData?: string;
}

export interface UpdateTeacherAttendanceRequest {
  status?: 'Present' | 'Absent' | 'Late';
  method?: 'QR' | 'MANUAL';
  checkIn?: string;
  checkOut?: string;
  date?: string;
}

export interface TeacherAttendanceQueryParams {
  teacherId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Get Student Attendance
export const getStudentAttendance = async (params?: StudentAttendanceQueryParams): Promise<StudentAttendanceResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.batchId) queryParams.append('batchId', params.batchId);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/attendance/student${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch student attendance',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Export all student attendance (Excel)
export const exportAllStudentAttendanceExcel = async (
  params?: StudentAttendanceExportQueryParams
): Promise<AttendanceExportFileResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.batchId) queryParams.append('batchId', params.batchId);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);

    const url = `/admin/attendance/student/all/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to export student attendance';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // ignore json parse failure for non-json responses
      }
      throw {
        message: errorMessage,
        status: response.status,
      } as ApiError;
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || '';
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    const filename = filenameMatch?.[1] || `student-attendance-${new Date().toISOString().split('T')[0]}.xlsx`;

    return { blob, filename };
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Staff Attendance
export const getStaffAttendance = async (params?: StaffAttendanceQueryParams): Promise<StaffAttendanceResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.staffId) queryParams.append('staffId', params.staffId);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/attendance/staff${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch staff attendance',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Mark Student In-Time
export const markStudentInTime = async (request: MarkStudentInTimeRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch('/admin/attendance/student/in-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to mark student in-time',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Mark Student Out-Time
export const markStudentOutTime = async (request: MarkStudentOutTimeRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch('/admin/attendance/student/out-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to mark student out-time',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Student Attendance
export const updateStudentAttendance = async (id: string, request: UpdateStudentAttendanceRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/attendance/student/${id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to update student attendance',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Mark Staff Check-In
export const markStaffCheckIn = async (request: MarkStaffCheckInRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch('/admin/attendance/staff/check-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to mark staff check-in',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Mark Staff Check-Out
export const markStaffCheckOut = async (request: MarkStaffCheckOutRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch('/admin/attendance/staff/check-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to mark staff check-out',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Staff Attendance
export const updateStaffAttendance = async (id: string, request: UpdateStaffAttendanceRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/attendance/staff/${id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to update staff attendance',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// ==================== TEACHER ATTENDANCE MANAGEMENT ====================

// Get Teacher Attendance
export const getTeacherAttendance = async (params?: TeacherAttendanceQueryParams): Promise<TeacherAttendanceResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/attendance/teacher${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch teacher attendance',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Mark Teacher Check-In
export const markTeacherCheckIn = async (request: MarkTeacherCheckInRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch('/admin/attendance/teacher/check-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to mark teacher check-in',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Mark Teacher Check-Out
export const markTeacherCheckOut = async (request: MarkTeacherCheckOutRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch('/admin/attendance/teacher/check-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to mark teacher check-out',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Teacher Attendance
export const updateTeacherAttendance = async (id: string, request: UpdateTeacherAttendanceRequest): Promise<AttendanceResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/attendance/teacher/${id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to update teacher attendance',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// ==================== EXPENSES ====================

export interface Expense {
  _id: string;
  branchId: string;
  createdBy: string;
  title: string;
  description?: string;
  billNumber?: string;
  purpose: string;
  amount: number;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStatistics {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
}

export interface ExpensePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ExpenseResponse {
  success: boolean;
  message?: string;
  data: Expense;
}

export interface ExpensesListResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    statistics: ExpenseStatistics;
    pagination: ExpensePagination;
  };
}

export interface CreateExpenseRequest {
  title: string;
  purpose: string;
  amount: number;
  description?: string;
  billNumber?: string;
  expenseDate?: string;
}

export interface UpdateExpenseRequest {
  title?: string;
  purpose?: string;
  amount?: number;
  description?: string;
  billNumber?: string;
  expenseDate?: string;
}

export interface ExpenseQueryParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Create Expense
export const createExpense = async (request: CreateExpenseRequest): Promise<ExpenseResponse> => {
  try {
    const response = await authenticatedFetch('/admin/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to create expense',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get All Expenses
export const getExpenses = async (params?: ExpenseQueryParams): Promise<ExpensesListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch expenses',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get Expense by ID
export const getExpenseById = async (id: string): Promise<ExpenseResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/expenses/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch expense',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Update Expense
export const updateExpense = async (id: string, request: UpdateExpenseRequest): Promise<ExpenseResponse> => {
  try {
    const response = await authenticatedFetch(`/admin/expenses/${id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to update expense',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Delete Expense
export const deleteExpense = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authenticatedFetch(`/admin/expenses/${id}/delete`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to delete expense',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// ==================== DYNAMIC DATA UPLOAD ====================

export interface DynamicDataRecord {
  _id: string;
  branchId: string;
  createdBy: string;
  dataType: string;
  title?: string;
  description?: string;
  data: any; // Can be object or array
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataTypeCount {
  dataType: string;
  count: number;
}

export interface DynamicDataStatistics {
  totalRecords: number;
  byDataType: DataTypeCount[];
}

export interface DynamicDataPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UploadDynamicDataRequest {
  dataType: string;
  data: any; // Can be object or array
  title?: string;
  description?: string;
  tags?: string[];
}

export interface UploadDynamicDataResponse {
  success: boolean;
  message: string;
  data: DynamicDataRecord;
}

export interface GetDynamicDataResponse {
  success: boolean;
  data: {
    records: DynamicDataRecord[];
    statistics: DynamicDataStatistics;
    pagination: DynamicDataPagination;
  };
}

export interface DynamicDataQueryParams {
  dataType?: string;
  tag?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Upload Dynamic Data
export const uploadDynamicData = async (request: UploadDynamicDataRequest): Promise<UploadDynamicDataResponse> => {
  try {
    const response = await authenticatedFetch('/admin/data/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to upload data',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Get All Dynamic Data
export const getDynamicData = async (params?: DynamicDataQueryParams): Promise<GetDynamicDataResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.dataType) queryParams.append('dataType', params.dataType);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/admin/data${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to fetch dynamic data',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};

// Delete Dynamic Data
export const deleteDynamicData = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authenticatedFetch(`/admin/data/${id}/delete`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Failed to delete data record',
        status: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      } as ApiError;
    }
    throw error;
  }
};
