import React, { useState } from 'react';
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

const DocumentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Mock data - replace with API calls
  const documents = [
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

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Templates', label: 'Templates' },
    { value: 'Samples', label: 'Samples' },
    { value: 'Requirements', label: 'Requirements' },
    { value: 'Customer Documents', label: 'Customer Documents' },
    { value: 'Internal', label: 'Internal' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      // Handle file upload
      console.log('Files dropped:', e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file selection
      console.log('Files selected:', e.target.files);
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
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {documents.filter(doc => doc.status === 'Active').length}
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
                doc.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

            <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

            <div className="flex space-x-2">
              <button className="flex-1 btn-outline text-sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              <button className="flex-1 btn-secondary text-sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="card text-center py-12">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first document.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Document
            </button>
          )}
        </div>
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
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Upload Options */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="label">Category</label>
                    <select className="input-field">
                      <option value="">Select category</option>
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      rows={3}
                      className="input-field"
                      placeholder="Optional description..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button className="btn-primary w-full sm:w-auto sm:ml-3">
                  Upload Files
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;

