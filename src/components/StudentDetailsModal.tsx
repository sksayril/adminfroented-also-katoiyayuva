import { useState, useEffect } from 'react';
import { X, Loader2, Mail, Phone, MapPin, GraduationCap, Calendar, CheckCircle, XCircle, Eye, EyeOff, DollarSign, User, FileText } from 'lucide-react';
import { getStudentById, Student, ApiError } from '../services/api';
import { toast } from 'react-toastify';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

export default function StudentDetailsModal({ isOpen, onClose, studentId }: StudentDetailsModalProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await getStudentById(studentId);
      setStudent(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to load student details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <Calendar className="w-3 h-3" />
            Pending
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'DROPPED':
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Dropped
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-800">Student Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : student ? (
            <div className="space-y-4">
              {/* Student Name and Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {student.studentPhoto ? (
                    <img
                      src={student.studentPhoto}
                      alt={student.name}
                      className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{student.name}</h3>
                    <p className="text-xs text-gray-600 font-mono">{student.studentId}</p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(student.status)}
                </div>
              </div>

              {/* QR Code */}
              {student.qrCode && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 mb-1">Student QR Code</p>
                    <img
                      src={student.qrCode}
                      alt="Student QR Code"
                      className="w-24 h-24 mx-auto border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Mobile</p>
                    <p className="text-sm font-semibold text-gray-800">{student.mobile}</p>
                  </div>
                  {student.email && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <p className="text-sm font-semibold text-gray-800">{student.email}</p>
                    </div>
                  )}
                  {student.contact_details?.whatsapp && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">WhatsApp</p>
                      <p className="text-sm font-semibold text-gray-800">{student.contact_details.whatsapp}</p>
                    </div>
                  )}
                  {student.contact_details?.guardian_contact && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Guardian Contact</p>
                      <p className="text-sm font-semibold text-gray-800">{student.contact_details.guardian_contact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              {(student.address || student.contact_details?.email) && (
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Address Information
                  </h4>
                  {student.address && typeof student.address === 'object' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(student.address as any).village && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Village</p>
                          <p className="text-sm font-semibold text-gray-800">{(student.address as any).village}</p>
                        </div>
                      )}
                      {(student.address as any).post_office && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Post Office</p>
                          <p className="text-sm font-semibold text-gray-800">{(student.address as any).post_office}</p>
                        </div>
                      )}
                      {(student.address as any).district && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">District</p>
                          <p className="text-sm font-semibold text-gray-800">{(student.address as any).district}</p>
                        </div>
                      )}
                      {(student.address as any).state && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">State</p>
                          <p className="text-sm font-semibold text-gray-800">{(student.address as any).state}</p>
                        </div>
                      )}
                      {(student.address as any).pincode && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">PIN Code</p>
                          <p className="text-sm font-semibold text-gray-800">{(student.address as any).pincode}</p>
                        </div>
                      )}
                      {(student.address as any).country && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Country</p>
                          <p className="text-sm font-semibold text-gray-800">{(student.address as any).country}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800">{typeof student.address === 'string' ? student.address : 'N/A'}</p>
                  )}
                </div>
              )}

              {/* Course & Batch Information */}
              <div className="bg-purple-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Course & Batch Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Course</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {student.courseId ? (
                        typeof student.courseId === 'object' ? student.courseId.name : 'N/A'
                      ) : (
                        'No Course Assigned'
                      )}
                    </p>
                    {student.courseId && typeof student.courseId === 'object' && student.courseId.courseCategory && (
                      <p className="text-xs text-gray-500 mt-1">Category: {student.courseId.courseCategory}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Batch</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {student.batchId ? (
                        typeof student.batchId === 'object' ? student.batchId.name : 'N/A'
                      ) : (
                        'No Batch Assigned'
                      )}
                    </p>
                    {student.batchId && typeof student.batchId === 'object' && student.batchId.timeSlot && (
                      <p className="text-xs text-gray-500 mt-1">Time: {student.batchId.timeSlot}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fees Information */}
              {(student.totalFees !== undefined || student.paidAmount !== undefined || student.dueAmount !== undefined) && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Fees Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {student.totalFees !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Total Fees</p>
                        <p className="text-base font-bold text-gray-900">
                          ₹{student.totalFees.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                    {student.paidAmount !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Paid Amount</p>
                        <p className="text-base font-bold text-green-600">
                          ₹{student.paidAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                    {student.dueAmount !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Due Amount</p>
                        <p className="text-base font-bold text-red-600">
                          ₹{student.dueAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-indigo-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {student.student?.date_of_birth && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Date of Birth</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(student.student.date_of_birth).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {student.student?.gender && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Gender</p>
                      <p className="text-sm font-semibold text-gray-800">{student.student.gender}</p>
                    </div>
                  )}
                  {student.student?.religion && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Religion</p>
                      <p className="text-sm font-semibold text-gray-800">{student.student.religion}</p>
                    </div>
                  )}
                  {student.student?.caste && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Caste</p>
                      <p className="text-sm font-semibold text-gray-800">{student.student.caste}</p>
                    </div>
                  )}
                  {student.education?.last_qualification && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Last Qualification</p>
                      <p className="text-sm font-semibold text-gray-800">{student.education.last_qualification}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Family Information */}
              {(student.guardianName || student.family_details) && (
                <div className="bg-pink-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Family Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {student.guardianName && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Guardian Name</p>
                        <p className="text-sm font-semibold text-gray-800">{student.guardianName}</p>
                      </div>
                    )}
                    {student.family_details?.guardian_name && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Guardian Name</p>
                        <p className="text-sm font-semibold text-gray-800">{student.family_details.guardian_name}</p>
                      </div>
                    )}
                    {student.family_details?.mother_name && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Mother Name</p>
                        <p className="text-sm font-semibold text-gray-800">{student.family_details.mother_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Login Credentials */}
              {((student as any).password || (student as any).loginCredentials) && (
                <div className="bg-cyan-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Login Credentials
                  </h4>
                  <div className="space-y-2">
                    {(student as any).loginCredentials?.email && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Login Email</p>
                        <p className="text-sm font-semibold text-gray-800">{(student as any).loginCredentials.email}</p>
                      </div>
                    )}
                    {((student as any).password || (student as any).loginCredentials?.password) && (
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Password</p>
                            <p className="text-sm font-mono text-gray-800">
                              {showPassword ? ((student as any).password || (student as any).loginCredentials?.password) : '••••••••'}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admission Information */}
              {student.admission && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Admission Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {student.admission.admission_date && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Admission Date</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(student.admission.admission_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    {student.admission.course?.code && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Course Code</p>
                        <p className="text-sm font-semibold text-gray-800">{student.admission.course.code}</p>
                      </div>
                    )}
                    {student.admission.course?.type && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Course Type</p>
                        <p className="text-sm font-semibold text-gray-800">{student.admission.course.type}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Office Use Information */}
              {student.office_use && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Office Use Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {student.office_use.form_number && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Form Number</p>
                        <p className="text-sm font-semibold text-gray-800">{student.office_use.form_number}</p>
                      </div>
                    )}
                    {student.office_use.receipt_number && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Receipt Number</p>
                        <p className="text-sm font-semibold text-gray-800">{student.office_use.receipt_number}</p>
                      </div>
                    )}
                    {student.office_use.batch_time && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Batch Time</p>
                        <p className="text-sm font-semibold text-gray-800">{student.office_use.batch_time}</p>
                      </div>
                    )}
                    {student.office_use.date && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Date</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(student.office_use.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              {(student.studentPhoto || student.studentSignature || student.officeSignature || student.formScanImage) && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Documents
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {student.studentPhoto && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Student Photo</p>
                        <img
                          src={student.studentPhoto}
                          alt="Student Photo"
                          className="w-full h-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    {student.studentSignature && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Student Signature</p>
                        <img
                          src={student.studentSignature}
                          alt="Student Signature"
                          className="w-full h-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    {student.officeSignature && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Office Signature</p>
                        <img
                          src={student.officeSignature}
                          alt="Office Signature"
                          className="w-full h-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    {student.formScanImage && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Form Scan</p>
                        <img
                          src={student.formScanImage}
                          alt="Form Scan"
                          className="w-full h-16 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              {(student.registrationDate || student.createdAt || student.updatedAt) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {student.registrationDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">Registration Date</p>
                          <p className="text-xs font-semibold text-gray-800">
                            {new Date(student.registrationDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {student.createdAt && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">Created At</p>
                          <p className="text-xs font-semibold text-gray-800">
                            {new Date(student.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {student.updatedAt && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">Last Updated</p>
                          <p className="text-xs font-semibold text-gray-800">
                            {new Date(student.updatedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
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
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No student details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
