import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Loader2, X, Eye, Trash2, Filter, Search, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  uploadDynamicData, 
  getDynamicData,
  deleteDynamicData,
  UploadDynamicDataRequest,
  DynamicDataRecord,
  DynamicDataQueryParams,
  ApiError 
} from '../services/api';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { SkeletonTable } from '../components/Skeleton';

export default function DataUpload() {
  const [records, setRecords] = useState<DynamicDataRecord[]>([]);
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    byDataType: [] as Array<{ dataType: string; count: number }>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<DynamicDataQueryParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DynamicDataRecord | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    dataType: '',
    title: '',
    description: '',
    tags: '',
  });
  const [parsedData, setParsedData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [dataTypeFilter, setDataTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDynamicData(filters);
      setRecords(response.data.records);
      setStatistics(response.data.statistics);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load data records');
      toast.error(apiError.message || 'Failed to load data records');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      toast.error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    try {
      if (isCSV) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              toast.error('Error parsing CSV: ' + results.errors[0].message);
              return;
            }
            setParsedData(results.data);
            setShowUploadModal(true);
          },
          error: (error) => {
            toast.error('Error reading CSV file: ' + error.message);
          },
        });
      } else if (isExcel) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Convert to array of objects (first row as headers)
            if (jsonData.length > 0) {
              const headers = jsonData[0] as string[];
              const rows = jsonData.slice(1) as any[][];
              const objects = rows.map((row) => {
                const obj: any = {};
                headers.forEach((header, index) => {
                  obj[header] = row[index] || '';
                });
                return obj;
              });
              setParsedData(objects);
              setShowUploadModal(true);
            } else {
              toast.error('Excel file is empty');
            }
          } catch (error) {
            toast.error('Error parsing Excel file: ' + (error instanceof Error ? error.message : 'Unknown error'));
          }
        };
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      toast.error('Error reading file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpload = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    if (!uploadForm.dataType) {
      toast.error('Please enter a data type');
      return;
    }

    try {
      setUploading(true);
      const tags = uploadForm.tags
        ? uploadForm.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
        : [];

      const request: UploadDynamicDataRequest = {
        dataType: uploadForm.dataType,
        data: parsedData,
        title: uploadForm.title || undefined,
        description: uploadForm.description || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      await uploadDynamicData(request);
      toast.success('Data uploaded successfully');
      setShowUploadModal(false);
      setParsedData(null);
      setUploadForm({
        dataType: '',
        title: '',
        description: '',
        tags: '',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchData();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to upload data');
    } finally {
      setUploading(false);
    }
  };

  const handleViewPreview = (record: DynamicDataRecord) => {
    setSelectedRecord(record);
    setPreviewData(record.data);
    setShowPreviewModal(true);
  };

  const handleDeleteClick = (record: DynamicDataRecord) => {
    setSelectedRecord(record);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;

    try {
      setDeleting(true);
      await deleteDynamicData(selectedRecord._id);
      toast.success('Data record deleted successfully');
      setShowDeleteDialog(false);
      setSelectedRecord(null);
      fetchData();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to delete data record');
    } finally {
      setDeleting(false);
    }
  };

  const handleApplyFilters = () => {
    const newFilters: DynamicDataQueryParams = {};
    if (dataTypeFilter) newFilters.dataType = dataTypeFilter;
    if (tagFilter) newFilters.tag = tagFilter;
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setDataTypeFilter('');
    setTagFilter('');
    setFilters({});
    setShowFilters(false);
  };

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      record.dataType.toLowerCase().includes(term) ||
      (record.title && record.title.toLowerCase().includes(term)) ||
      (record.description && record.description.toLowerCase().includes(term)) ||
      (record.tags && record.tags.some((tag) => tag.toLowerCase().includes(term)))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDataTypeBadge = (dataType: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-yellow-100 text-yellow-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ];
    const index = dataType.length % colors.length;
    return colors[index];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Data Upload</h1>
              <p className="text-sm text-gray-500">Upload and manage dynamic data from CSV/Excel files</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Upload File
            </label>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Data Types</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.byDataType.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Records</p>
              <p className="text-2xl font-bold text-gray-800">
                {records.filter((r) => r.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by data type, title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <select
                  value={dataTypeFilter}
                  onChange={(e) => setDataTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {statistics.byDataType.map((item) => (
                    <option key={item.dataType} value={item.dataType}>
                      {item.dataType} ({item.count})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                <input
                  type="text"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  placeholder="Filter by tag..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Records Table */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No data records found</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first CSV or Excel file to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDataTypeBadge(record.dataType)}`}>
                        {record.dataType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {record.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {record.tags && record.tags.length > 0 ? (
                          record.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                        {record.tags && record.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">+{record.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Array.isArray(record.data) ? record.data.length : 'Object'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewPreview(record)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                          title="View Data"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && parsedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Upload Data</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setParsedData(null);
                  setUploadForm({
                    dataType: '',
                    title: '',
                    description: '',
                    tags: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Preview:</strong> {Array.isArray(parsedData) ? parsedData.length : 1} record(s) ready to upload
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.dataType}
                  onChange={(e) => setUploadForm({ ...uploadForm, dataType: e.target.value })}
                  placeholder="e.g., inventory, settings, custom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g., Office Inventory List"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Brief description of the data"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="e.g., inventory, office, equipment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">Data Preview (first 5 rows):</p>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(Array.isArray(parsedData) ? parsedData.slice(0, 5) : parsedData, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setParsedData(null);
                    setUploadForm({
                      dataType: '',
                      title: '',
                      description: '',
                      tags: '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadForm.dataType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">Data Preview</h2>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedRecord(null);
                  setPreviewData(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 space-y-2">
                <p><strong>Data Type:</strong> {selectedRecord.dataType}</p>
                {selectedRecord.title && <p><strong>Title:</strong> {selectedRecord.title}</p>}
                {selectedRecord.description && <p><strong>Description:</strong> {selectedRecord.description}</p>}
                {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                  <p><strong>Tags:</strong> {selectedRecord.tags.join(', ')}</p>
                )}
                <p><strong>Created:</strong> {formatDate(selectedRecord.createdAt)}</p>
              </div>
              
              {/* Render as table if data is an array */}
              {Array.isArray(previewData) && previewData.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto max-h-[60vh]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.map((row: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {Object.keys(previewData[0]).map((key) => {
                              let cellValue = row[key];
                              
                              // Handle Excel serial date numbers (if numeric and > 10000, likely a date)
                              if (typeof cellValue === 'number' && cellValue > 10000 && (key.includes('DATE') || key.includes('date'))) {
                                // Excel serial date: days since January 1, 1900
                                const excelEpoch = new Date(1900, 0, 1);
                                const date = new Date(excelEpoch.getTime() + (cellValue - 2) * 24 * 60 * 60 * 1000);
                                cellValue = date.toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                });
                              }
                              
                              // Format empty values
                              if (cellValue === null || cellValue === undefined || cellValue === '') {
                                cellValue = '-';
                              }
                              
                              return (
                                <td
                                  key={key}
                                  className="px-4 py-3 whitespace-nowrap text-gray-900 border-b border-gray-100"
                                >
                                  {String(cellValue)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Showing {previewData.length} record{previewData.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ) : (
                // Render as JSON if not an array or empty
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Data Record"
        message={`Are you sure you want to delete the data record "${selectedRecord?.title || selectedRecord?.dataType}"? This action cannot be undone.`}
      />
    </div>
  );
}
