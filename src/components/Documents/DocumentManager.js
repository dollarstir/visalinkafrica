import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Folder,
  Plus,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import apiService from '../../services/api';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/toast';
import { useAuth } from '../Auth/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { Navigate } from 'react-router-dom';

const DocumentManager = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    category: '',
    description: '',
    application_id: '',
    customer_id: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentViewUrl, setDocumentViewUrl] = useState(null);
  const [documentBlobUrl, setDocumentBlobUrl] = useState(null);

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, [searchTerm, selectedCategory]);

  // Check if user has permission to view documents
  if (!hasPermission(user, 'documents.view') && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        limit: 100
      };
      
      const response = await apiService.getDocuments(params);
      setDocuments(response.documents || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
      showError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getDocumentCategories();
      const categoryOptions = [
        { value: 'all', label: 'All Categories' },
        ...(response.categories || []).map(cat => ({
          value: cat.name,
          label: cat.name,
          id: cat.id,
          description: cat.description
        }))
      ];
      setCategories(categoryOptions);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Mock data - replace with API calls
  const oldDocuments = [
    {
      id: 'DOC-001',
      name: 'passport_template.pdf',
      type: 'pdf',
      size: '2.4 MB',
      category: 'Templates',
      uploadedBy: 'Sarah Wilson',
      uploadedAt: '2024-01-15',
      applicationId: 'APP-001',
      customerId: 'CUST-001',
      status: 'Active',
      description: 'Passport application template'
    },
    {
      id: 'DOC-002',
      name: 'birth_certificate_sample.jpg',
      type: 'image',
      size: '1.8 MB',
      category: 'Samples',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-14',
      applicationId: 'APP-002',
      customerId: 'CUST-002',
      status: 'Active',
      description: 'Sample birth certificate format'
    },
    {
      id: 'DOC-003',
      name: 'visa_requirements.docx',
      type: 'document',
      size: '856 KB',
      category: 'Requirements',
      uploadedBy: 'Lisa Davis',
      uploadedAt: '2024-01-13',
      applicationId: null,
      customerId: null,
      status: 'Active',
      description: 'Visa application requirements checklist'
    },
    {
      id: 'DOC-004',
      name: 'customer_id_proof.pdf',
      type: 'pdf',
      size: '3.2 MB',
      category: 'Customer Documents',
      uploadedBy: 'David Brown',
      uploadedAt: '2024-01-12',
      applicationId: 'APP-003',
      customerId: 'CUST-003',
      status: 'Archived',
      description: 'Customer ID proof document'
    }
  ];

  const filteredDocuments = documents;

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-600" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-600" />;
      case 'document':
        return <FileText className="h-8 w-8 text-blue-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'document':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      if (!uploadFormData.name) {
        setUploadFormData(prev => ({
          ...prev,
          name: e.dataTransfer.files[0].name
        }));
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!uploadFormData.name) {
        setUploadFormData(prev => ({
          ...prev,
          name: e.target.files[0].name
        }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadFormData.name || selectedFile.name);
      if (uploadFormData.category) formData.append('category', uploadFormData.category);
      if (uploadFormData.description) formData.append('description', uploadFormData.description);
      if (uploadFormData.application_id) formData.append('application_id', uploadFormData.application_id);
      if (uploadFormData.customer_id) formData.append('customer_id', uploadFormData.customer_id);

      await apiService.uploadDocument(formData);
      showSuccess('Document uploaded successfully');
      setShowUploadModal(false);
      setSelectedFile(null);
      setNewCategory('');
      setShowNewCategoryInput(false);
      setUploadFormData({
        name: '',
        category: '',
        description: '',
        application_id: '',
        customer_id: ''
      });
      await loadDocuments();
      await loadCategories();
    } catch (err) {
      console.error('Error uploading document:', err);
      showError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await apiService.downloadDocument(doc.rawId || doc.id.replace('DOC-', ''));
      showSuccess('Document download started');
    } catch (err) {
      console.error('Error downloading document:', err);
      showError(err.message || 'Failed to download document');
    }
  };

  const handleView = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const documentId = doc.rawId || doc.id.replace('DOC-', '');
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const viewUrl = `${apiBaseUrl}/documents/${documentId}/view?token=${token}`;
      
      // For PDFs and other documents, fetch as blob and create object URL
      // This ensures better compatibility and allows viewing in iframe
      if (doc.type === 'pdf' || doc.type === 'document') {
        const response = await fetch(viewUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load document');
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        setDocumentBlobUrl(blobUrl);
        setDocumentViewUrl(blobUrl);
      } else {
        // For images, use direct URL
        setDocumentViewUrl(viewUrl);
        setDocumentBlobUrl(null);
      }
      
      // Set the document to open in modal
      setViewingDocument(doc);
    } catch (err) {
      console.error('Error viewing document:', err);
      showError(err.message || 'Failed to view document');
    }
  };

  const handleDelete = async (doc) => {
    const confirmed = await showDeleteConfirm(doc.name, 'document');
    if (!confirmed) return;

    try {
      await apiService.deleteDocument(doc.rawId || doc.id.replace('DOC-', ''));
      showSuccess('Document deleted successfully');
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      showError(err.message || 'Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
          <p className="text-gray-600">Upload, organize, and manage all your documents</p>
        </div>
        {hasPermission(user, 'documents.upload') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {documents.filter(doc => doc.status === 'active' || doc.status === 'Active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {documents.filter(doc => doc.type === 'pdf').length}
          </div>
          <div className="text-sm text-gray-600">PDF Files</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {documents.filter(doc => doc.type === 'image').length}
          </div>
          <div className="text-sm text-gray-600">Images</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && documents.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600">Loading documents...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card text-center py-12">
          <p className="text-red-600">Error: {error}</p>
          <button onClick={loadDocuments} className="mt-4 btn-primary">
            Retry
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {!loading && !error && (
        <>
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="card hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getFileIcon(doc.type)}
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate max-w-32">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-gray-500">{doc.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      (doc.status === 'active' || doc.status === 'Active') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-900">{doc.size}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(doc.type)}`}>
                        {doc.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploaded by:</span>
                      <span className="text-gray-900">{doc.uploadedBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{doc.uploadedAt}</span>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                  )}

                  <div className="flex space-x-2">
                    {hasPermission(user, 'documents.view') && (
                      <button 
                        onClick={() => handleView(doc)}
                        className="flex-1 btn-outline text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    )}
                    {hasPermission(user, 'documents.download') && (
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="flex-1 btn-secondary text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    )}
                    {hasPermission(user, 'documents.delete') && (
                      <button 
                        onClick={() => handleDelete(doc)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first document.'}
              </p>
              {!searchTerm && hasPermission(user, 'documents.upload') && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary"
                >
                  Upload Document
                </button>
              )}
            </div>
          )}
        </>
      )}


      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowUploadModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                    dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB
                  </p>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                </div>

                {/* Upload Options */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="label">Document Name</label>
                    <input
                      type="text"
                      value={uploadFormData.name}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="Enter document name"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <div className="space-y-2">
                      {!showNewCategoryInput ? (
                        <select 
                          value={uploadFormData.category}
                          onChange={(e) => {
                            if (e.target.value === '__new__') {
                              setShowNewCategoryInput(true);
                              setUploadFormData(prev => ({ ...prev, category: '' }));
                            } else {
                              setUploadFormData(prev => ({ ...prev, category: e.target.value }));
                            }
                          }}
                          className="input-field"
                        >
                          <option value="">Select category (optional)</option>
                          {categories.slice(1).map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                          <option value="__new__">+ Create New Category</option>
                        </select>
                      ) : (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyPress={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newCategory.trim()) {
                                  try {
                                    const categoryName = newCategory.trim();
                                    // Create category in database
                                    const response = await apiService.createDocumentCategory({ 
                                      name: categoryName 
                                    });
                                    // Add to categories list immediately
                                    setCategories(prev => {
                                      const exists = prev.some(cat => cat.value === categoryName);
                                      if (!exists) {
                                        return [...prev, { 
                                          value: categoryName, 
                                          label: categoryName,
                                          id: response.category.id
                                        }];
                                      }
                                      return prev;
                                    });
                                    setUploadFormData(prev => ({ ...prev, category: categoryName }));
                                    setShowNewCategoryInput(false);
                                    setNewCategory('');
                                    showSuccess('Category created successfully');
                                  } catch (err) {
                                    console.error('Error creating category:', err);
                                    showError(err.message || 'Failed to create category');
                                  }
                                }
                              }
                            }}
                            className="input-field flex-1"
                            placeholder="Enter new category name"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (newCategory.trim()) {
                                try {
                                  const categoryName = newCategory.trim();
                                  // Create category in database
                                  const response = await apiService.createDocumentCategory({ 
                                    name: categoryName 
                                  });
                                  // Add to categories list immediately
                                  setCategories(prev => {
                                    const exists = prev.some(cat => cat.value === categoryName);
                                    if (!exists) {
                                      return [...prev, { 
                                        value: categoryName, 
                                        label: categoryName,
                                        id: response.category.id
                                      }];
                                    }
                                    return prev;
                                  });
                                  setUploadFormData(prev => ({ ...prev, category: categoryName }));
                                  setShowNewCategoryInput(false);
                                  setNewCategory('');
                                  showSuccess('Category created successfully');
                                } catch (err) {
                                  console.error('Error creating category:', err);
                                  showError(err.message || 'Failed to create category');
                                }
                              }
                            }}
                            className="btn-primary"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategory('');
                              setUploadFormData(prev => ({ ...prev, category: '' }));
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {uploadFormData.category && !showNewCategoryInput && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Selected category:</span> {uploadFormData.category}
                          </p>
                          <button
                            type="button"
                            onClick={() => setUploadFormData(prev => ({ ...prev, category: '' }))}
                            className="text-xs text-green-600 hover:text-green-800 mt-1"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      rows={3}
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field"
                      placeholder="Optional description..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setNewCategory('');
                    setShowNewCategoryInput(false);
                    setUploadFormData({
                      name: '',
                      category: '',
                      description: '',
                      application_id: '',
                      customer_id: ''
                    });
                  }}
                  disabled={uploading}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {viewingDocument && documentViewUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative w-full max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{viewingDocument.name}</h3>
                <p className="text-sm text-gray-500">{viewingDocument.fileName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(viewingDocument)}
                  className="btn-secondary text-sm"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    // Clean up blob URL if it exists
                    if (documentBlobUrl) {
                      window.URL.revokeObjectURL(documentBlobUrl);
                    }
                    setViewingDocument(null);
                    setDocumentViewUrl(null);
                    setDocumentBlobUrl(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center min-h-[400px]">
              {viewingDocument.type === 'image' ? (
                <img
                  src={documentViewUrl}
                  alt={viewingDocument.name}
                  className="max-w-full max-h-[calc(90vh-120px)] object-contain"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : viewingDocument.type === 'pdf' ? (
                <iframe
                  src={documentViewUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={viewingDocument.name}
                  style={{ minHeight: '600px' }}
                />
              ) : viewingDocument.type === 'document' ? (
                // Try to display text files and other documents
                <iframe
                  src={documentViewUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={viewingDocument.name}
                  style={{ minHeight: '600px' }}
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Preview not available for this file type.</p>
                  <button
                    onClick={() => handleDownload(viewingDocument)}
                    className="btn-primary"
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;






