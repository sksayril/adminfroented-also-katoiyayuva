import { useState, useEffect } from 'react';
import { X, Loader2, Upload, Image as ImageIcon, FileText, User, Phone, MapPin, GraduationCap, Building2, Calendar } from 'lucide-react';
import { registerStudent, ManualStudentRegistrationData, ApiError, getCourses, Course, getBatches, Batch } from '../services/api';
import { toast } from 'react-toastify';

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RegisterStudentModal({
  isOpen,
  onClose,
  onSubmit,
}: RegisterStudentModalProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState<ManualStudentRegistrationData>({
    student: {
      name: '',
      date_of_birth: '',
      gender: '',
      religion: '',
      caste: '',
    },
    contact_details: {
      mobile: '',
      whatsapp: '',
      guardian_contact: '',
      email: '',
    },
    admission: {
      admission_date: '',
      course: {
        code: '',
        type: '',
      },
    },
    family_details: {
      guardian_name: '',
      mother_name: '',
    },
    address: {
      village: '',
      post_office: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    education: {
      last_qualification: '',
    },
    office_use: {
      form_number: '',
      receipt_number: '',
      batch_time: '',
      date: '',
    },
    studentId: 'AUTO',
    branchId: 'AUTO',
    status: 'ACTIVE',
  });

  const [files, setFiles] = useState<{
    studentPhoto?: File;
    studentSignature?: File;
    officeSignature?: File;
    formScanImage?: File;
  }>({});

  const [previews, setPreviews] = useState<{
    studentPhoto?: string;
    studentSignature?: string;
    officeSignature?: string;
    formScanImage?: string;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      fetchBatches();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleNestedChange = (
    section: keyof ManualStudentRegistrationData,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
    // Clear error
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleNestedNestedChange = (
    section: keyof ManualStudentRegistrationData,
    nestedSection: string,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [nestedSection]: {
          ...((prev[section] as any)?.[nestedSection] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleFileChange = (field: 'studentPhoto' | 'studentSignature' | 'officeSignature' | 'formScanImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'Please select a valid file (jpg, png, webp, pdf)',
        }));
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'File size should be less than 50MB',
        }));
        return;
      }
      setFiles((prev) => ({ ...prev, [field]: file }));
      if (file.type.startsWith('image/')) {
        setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
      }
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.student?.name?.trim()) {
      newErrors['student.name'] = 'Student name is required';
    }
    if (!formData.contact_details?.mobile?.trim()) {
      newErrors['contact_details.mobile'] = 'Mobile number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare the data to send - ensure required fields are present
      const dataToSend: ManualStudentRegistrationData = {
        ...formData,
      };

      // Set courseId if course is selected
      const selectedCourse = courses.find(c => c.name === formData.admission?.course?.code);
      if (selectedCourse) {
        dataToSend.courseId = selectedCourse._id;
      }

      // Ensure student object has name (required)
      if (!dataToSend.student?.name?.trim()) {
        toast.error('Student name is required');
        setSubmitting(false);
        return;
      }

      // Ensure contact_details has mobile (required)
      if (!dataToSend.contact_details?.mobile?.trim()) {
        toast.error('Mobile number is required');
        setSubmitting(false);
        return;
      }

      // Ensure required objects exist (they should already exist from validation)
      // Make sure they have the required fields with actual values
      if (!dataToSend.student || !dataToSend.student.name?.trim()) {
        toast.error('Student name is required');
        setSubmitting(false);
        return;
      }
      if (!dataToSend.contact_details || !dataToSend.contact_details.mobile?.trim()) {
        toast.error('Mobile number is required');
        setSubmitting(false);
        return;
      }

      // Debug: Log the data being sent (remove in production)
      console.log('Sending student data:', {
        student: dataToSend.student,
        contact_details: dataToSend.contact_details,
      });

      const response = await registerStudent(dataToSend, files);
      toast.success(`Student registered successfully! ID: ${response.data.studentId}`);
      handleClose();
      onSubmit();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to register student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        student: {
          name: '',
          date_of_birth: '',
          gender: '',
          religion: '',
          caste: '',
        },
        contact_details: {
          mobile: '',
          whatsapp: '',
          guardian_contact: '',
          email: '',
        },
        admission: {
          admission_date: '',
          course: {
            code: '',
            type: '',
          },
        },
        family_details: {
          guardian_name: '',
          mother_name: '',
        },
        address: {
          village: '',
          post_office: '',
          district: '',
          state: '',
          pincode: '',
          country: 'India',
        },
        education: {
          last_qualification: '',
        },
        office_use: {
          form_number: '',
          receipt_number: '',
          batch_time: '',
          date: '',
        },
        studentId: 'AUTO',
        branchId: 'AUTO',
        status: 'ACTIVE',
      });
      setFiles({});
      setPreviews({});
      setErrors({});
      setActiveTab(1);
      onClose();
    }
  };

  const tabs = [
    { id: 1, name: 'Student Info', icon: User },
    { id: 2, name: 'Contact & Address', icon: Phone },
    { id: 3, name: 'Admission & Course', icon: GraduationCap },
    { id: 4, name: 'Office Use', icon: Building2 },
    { id: 5, name: 'Documents', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Register New Student</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab 1: Student Info */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.student?.name || ''}
                    onChange={(e) => handleNestedChange('student', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors['student.name'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['student.name']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.student?.date_of_birth || ''}
                    onChange={(e) => handleNestedChange('student', 'date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.student?.gender || ''}
                    onChange={(e) => handleNestedChange('student', 'gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                  <input
                    type="text"
                    value={formData.student?.religion || ''}
                    onChange={(e) => handleNestedChange('student', 'religion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                  <input
                    type="text"
                    value={formData.student?.caste || ''}
                    onChange={(e) => handleNestedChange('student', 'caste', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Qualification</label>
                  <input
                    type="text"
                    value={formData.education?.last_qualification || ''}
                    onChange={(e) => handleNestedChange('education', 'last_qualification', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={formData.family_details?.guardian_name || ''}
                    onChange={(e) => handleNestedChange('family_details', 'guardian_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={formData.family_details?.mother_name || ''}
                    onChange={(e) => handleNestedChange('family_details', 'mother_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Contact & Address */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact & Address Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_details?.mobile || ''}
                    onChange={(e) => handleNestedChange('contact_details', 'mobile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors['contact_details.mobile'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['contact_details.mobile']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.contact_details?.whatsapp || ''}
                    onChange={(e) => handleNestedChange('contact_details', 'whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact</label>
                  <input
                    type="tel"
                    value={formData.contact_details?.guardian_contact || ''}
                    onChange={(e) => handleNestedChange('contact_details', 'guardian_contact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contact_details?.email || ''}
                    onChange={(e) => handleNestedChange('contact_details', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                    <input
                      type="text"
                      value={formData.address?.village || ''}
                      onChange={(e) => handleNestedChange('address', 'village', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Office</label>
                    <input
                      type="text"
                      value={formData.address?.post_office || ''}
                      onChange={(e) => handleNestedChange('address', 'post_office', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={formData.address?.district || ''}
                      onChange={(e) => handleNestedChange('address', 'district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.address?.state || ''}
                      onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={formData.address?.pincode || ''}
                      onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.address?.country || 'India'}
                      onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Admission & Course */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Admission & Course Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admission?.admission_date || ''}
                    onChange={(e) => handleNestedChange('admission', 'admission_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={formData.admission?.course?.code || ''}
                    onChange={(e) => handleNestedNestedChange('admission', 'course', 'code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course.name}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                  <select
                    value={formData.admission?.course?.type || ''}
                    onChange={(e) => handleNestedNestedChange('admission', 'course', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Degree">Degree</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select
                    value={formData.batchId || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, batchId: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Batch (Optional)</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name} - {typeof batch.timeSlot === 'string' ? batch.timeSlot : 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Office Use */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Office Use Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Number</label>
                  <input
                    type="text"
                    value={formData.office_use?.form_number || ''}
                    onChange={(e) => handleNestedChange('office_use', 'form_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={formData.office_use?.receipt_number || ''}
                    onChange={(e) => handleNestedChange('office_use', 'receipt_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Time</label>
                  <select
                    value={formData.office_use?.batch_time || ''}
                    onChange={(e) => handleNestedChange('office_use', 'batch_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Batch Time</option>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                    <option value="EVENING">EVENING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.office_use?.date || ''}
                    onChange={(e) => handleNestedChange('office_use', 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Documents */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Uploads (Optional)</h3>
              
              {/* Student Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
                <div className="flex items-center gap-4">
                  {previews.studentPhoto ? (
                    <div className="relative">
                      <img
                        src={previews.studentPhoto}
                        alt="Student Photo Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFiles((prev) => {
                            const newFiles = { ...prev };
                            delete newFiles.studentPhoto;
                            return newFiles;
                          });
                          setPreviews((prev) => {
                            const newPreviews = { ...prev };
                            delete newPreviews.studentPhoto;
                            return newPreviews;
                          });
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 text-center px-2">Upload Photo</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleFileChange('studentPhoto', e)}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">JPG, PNG, WEBP (MAX. 50MB)</p>
                    {errors.studentPhoto && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentPhoto}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Signature</label>
                <div className="flex items-center gap-4">
                  {previews.studentSignature ? (
                    <div className="relative">
                      <img
                        src={previews.studentSignature}
                        alt="Student Signature Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFiles((prev) => {
                            const newFiles = { ...prev };
                            delete newFiles.studentSignature;
                            return newFiles;
                          });
                          setPreviews((prev) => {
                            const newPreviews = { ...prev };
                            delete newPreviews.studentSignature;
                            return newPreviews;
                          });
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <FileText className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 text-center px-2">Upload Signature</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={(e) => handleFileChange('studentSignature', e)}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">JPG, PNG, WEBP, PDF (MAX. 50MB)</p>
                    {errors.studentSignature && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentSignature}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Office Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Signature</label>
                <div className="flex items-center gap-4">
                  {previews.officeSignature ? (
                    <div className="relative">
                      <img
                        src={previews.officeSignature}
                        alt="Office Signature Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFiles((prev) => {
                            const newFiles = { ...prev };
                            delete newFiles.officeSignature;
                            return newFiles;
                          });
                          setPreviews((prev) => {
                            const newPreviews = { ...prev };
                            delete newPreviews.officeSignature;
                            return newPreviews;
                          });
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <FileText className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 text-center px-2">Upload Signature</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={(e) => handleFileChange('officeSignature', e)}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">JPG, PNG, WEBP, PDF (MAX. 50MB)</p>
                    {errors.officeSignature && (
                      <p className="mt-1 text-sm text-red-600">{errors.officeSignature}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Scan Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Scan Image</label>
                <div className="flex items-center gap-4">
                  {previews.formScanImage ? (
                    <div className="relative">
                      <img
                        src={previews.formScanImage}
                        alt="Form Scan Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFiles((prev) => {
                            const newFiles = { ...prev };
                            delete newFiles.formScanImage;
                            return newFiles;
                          });
                          setPreviews((prev) => {
                            const newPreviews = { ...prev };
                            delete newPreviews.formScanImage;
                            return newPreviews;
                          });
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <FileText className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 text-center px-2">Upload Form</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={(e) => handleFileChange('formScanImage', e)}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">JPG, PNG, WEBP, PDF (MAX. 50MB)</p>
                    {errors.formScanImage && (
                      <p className="mt-1 text-sm text-red-600">{errors.formScanImage}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              {activeTab > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              {activeTab < tabs.length && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Student'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
