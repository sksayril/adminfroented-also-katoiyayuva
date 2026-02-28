import { useState, useEffect } from 'react';
import { X, Loader2, Upload, User, Phone, GraduationCap, Building2, FileText } from 'lucide-react';
import {
    updateStudent,
    getStudentById,
    ManualStudentRegistrationData,
    ApiError,
    getCourses,
    Course,
    getBatches,
    Batch,
    Student
} from '../services/api';
import { toast } from 'react-toastify';

interface UpdateStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    studentId: string;
}

export default function UpdateStudentModal({
    isOpen,
    onClose,
    onSubmit,
    studentId,
}: UpdateStudentModalProps) {
    const [activeTab, setActiveTab] = useState(1);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(false);
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
        status: 'ACTIVE',
    });

    const [files, setFiles] = useState<{
        studentPhoto?: File;
        studentSignature?: File;
        officeSignature?: File;
        formScanImage?: File;
        aadharCardImage?: File;
        schoolCertificateImage?: File;
    }>({});

    const [previews, setPreviews] = useState<{
        studentPhoto?: string;
        studentSignature?: string;
        officeSignature?: string;
        formScanImage?: string;
        aadharCardImage?: string;
        schoolCertificateImage?: string;
    }>({});

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchStudentData();
            fetchCourses();
            fetchBatches();
        }
    }, [isOpen, studentId]);

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

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const response = await getStudentById(studentId);
            const student = response.data;

            // Map backend student data to ManualStudentRegistrationData structure
            setFormData({
                student: {
                    name: student.student?.name || student.name || '',
                    date_of_birth: student.student?.date_of_birth ? new Date(student.student.date_of_birth).toISOString().split('T')[0] : '',
                    gender: student.student?.gender || '',
                    religion: student.student?.religion || '',
                    caste: student.student?.caste || '',
                },
                contact_details: {
                    mobile: student.contact_details?.mobile || student.mobile || '',
                    whatsapp: student.contact_details?.whatsapp || '',
                    guardian_contact: student.contact_details?.guardian_contact || '',
                    email: student.contact_details?.email || student.email || '',
                },
                admission: {
                    admission_date: student.admission?.admission_date ? new Date(student.admission.admission_date).toISOString().split('T')[0] : '',
                    course: {
                        code: student.admission?.course?.code || (typeof student.courseId === 'object' && student.courseId ? student.courseId.name : ''),
                        type: student.admission?.course?.type || '',
                    },
                },
                family_details: {
                    guardian_name: student.family_details?.guardian_name || student.guardianName || '',
                    mother_name: student.family_details?.mother_name || '',
                },
                address: {
                    village: student.address?.village || '',
                    post_office: student.address?.post_office || '',
                    district: student.address?.district || '',
                    state: student.address?.state || '',
                    pincode: student.address?.pincode || '',
                    country: student.address?.country || 'India',
                },
                education: {
                    last_qualification: student.education?.last_qualification || '',
                },
                office_use: {
                    form_number: student.office_use?.form_number || '',
                    receipt_number: student.office_use?.receipt_number || '',
                    batch_time: student.office_use?.batch_time || '',
                    date: student.office_use?.date ? new Date(student.office_use.date).toISOString().split('T')[0] : '',
                },
                status: student.status,
                batchId: typeof student.batchId === 'object' && student.batchId ? student.batchId._id : student.batchId || undefined,
                courseId: typeof student.courseId === 'object' && student.courseId ? student.courseId._id : student.courseId || undefined,
            });

            // Set previews for existing images
            setPreviews({
                studentPhoto: student.studentPhoto,
                studentSignature: student.studentSignature,
                officeSignature: student.officeSignature,
                formScanImage: student.formScanImage,
            });

        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError.message || 'Failed to fetch student data');
            onClose();
        } finally {
            setLoading(false);
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

    const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles((prev) => ({ ...prev, [field]: file }));
            setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.student?.name?.trim()) newErrors['student.name'] = 'Name is required';
        if (!formData.contact_details?.mobile?.trim()) newErrors['contact_details.mobile'] = 'Mobile is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            setSubmitting(true);

            // Update courseId if course name changed
            const selectedCourse = courses.find(c => c.name === formData.admission?.course?.code);
            const dataToUpdate = { ...formData };
            if (selectedCourse) {
                dataToUpdate.courseId = selectedCourse._id;
            }

            await updateStudent(studentId, dataToUpdate, files);
            toast.success('Student updated successfully');
            onSubmit();
            onClose();
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError.message || 'Failed to update student');
        } finally {
            setSubmitting(false);
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
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-800">Edit Student Details</h2>
                    <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Loading student data...</p>
                    </div>
                ) : (
                    <>
                        <div className="border-b border-gray-200 px-6">
                            <div className="flex space-x-1 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
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

                        <form onSubmit={handleSubmit} className="p-6">
                            {activeTab === 1 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                                            <input
                                                type="text"
                                                value={formData.student?.name || ''}
                                                onChange={(e) => handleNestedChange('student', 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors['student.name'] && <p className="mt-1 text-sm text-red-600">{errors['student.name']}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={formData.student?.date_of_birth || ''}
                                                onChange={(e) => handleNestedChange('student', 'date_of_birth', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select
                                                value={formData.student?.gender || ''}
                                                onChange={(e) => handleNestedChange('student', 'gender', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 2 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                                            <input
                                                type="tel"
                                                value={formData.contact_details?.mobile || ''}
                                                onChange={(e) => handleNestedChange('contact_details', 'mobile', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors['contact_details.mobile'] && <p className="mt-1 text-sm text-red-600">{errors['contact_details.mobile']}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                            <input
                                                type="tel"
                                                value={formData.contact_details?.whatsapp || ''}
                                                onChange={(e) => handleNestedChange('contact_details', 'whatsapp', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formData.contact_details?.email || ''}
                                                onChange={(e) => handleNestedChange('contact_details', 'email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 border-t pt-4">
                                        <h4 className="font-semibold mb-3">Address</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Village/Street</label>
                                                <input
                                                    type="text"
                                                    value={formData.address?.village || ''}
                                                    onChange={(e) => handleNestedChange('address', 'village', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                                <input
                                                    type="text"
                                                    value={formData.address?.district || ''}
                                                    onChange={(e) => handleNestedChange('address', 'district', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 3 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                            <select
                                                value={formData.admission?.course?.code || ''}
                                                onChange={(e) => handleNestedNestedChange('admission', 'course', 'code', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Course</option>
                                                {courses.map((course) => (
                                                    <option key={course._id} value={course.name}>{course.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                                            <select
                                                value={formData.batchId || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            >
                                                <option value="">Select Batch</option>
                                                {batches.map((batch) => (
                                                    <option key={batch._id} value={batch._id}>
                                                        {batch.name} ({typeof batch.timeSlot === 'string' ? batch.timeSlot : 'N/A'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={formData.status || 'ACTIVE'}
                                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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

                            {activeTab === 4 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Form Number</label>
                                            <input
                                                type="text"
                                                value={formData.office_use?.form_number || ''}
                                                onChange={(e) => handleNestedChange('office_use', 'form_number', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                                            <input
                                                type="text"
                                                value={formData.office_use?.receipt_number || ''}
                                                onChange={(e) => handleNestedChange('office_use', 'receipt_number', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 5 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
                                            <div className="flex items-center gap-4">
                                                {previews.studentPhoto ? (
                                                    <div className="relative">
                                                        <img src={previews.studentPhoto} className="w-24 h-24 object-cover rounded-lg border" />
                                                        <label className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700">
                                                            <Upload className="w-3 h-3" />
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('studentPhoto', e)} />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                                                        <Upload className="w-6 h-6 text-gray-400" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('studentPhoto', e)} />
                                                    </label>
                                                )}
                                                <p className="text-xs text-gray-500">Update photo if needed</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Image</label>
                                            <div className="flex items-center gap-4">
                                                {previews.aadharCardImage ? (
                                                    <div className="relative">
                                                        <img src={previews.aadharCardImage} className="w-24 h-24 object-cover rounded-lg border" />
                                                        <label className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700">
                                                            <Upload className="w-3 h-3" />
                                                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange('aadharCardImage', e)} />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                                                        <Upload className="w-6 h-6 text-gray-400" />
                                                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange('aadharCardImage', e)} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex items-center justify-end gap-3 border-t pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={submitting}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
