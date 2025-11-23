import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Alert, ProgressBar, Badge } from 'react-bootstrap';

/**
 * File Upload Component with drag-and-drop support
 * Supports images, documents, and other file types for healthcare messaging
 */
const FileUpload = ({ show, onHide, onFileSelect, maxFileSize = 10 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Allowed file types for healthcare messaging
  const allowedTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: [
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ],
    medical: [
      'application/dicom', // Medical imaging
      'text/hl7', // HL7 messages
      'application/fhir+json' // FHIR resources
    ]
  };

  const allAllowedTypes = [
    ...allowedTypes.images,
    ...allowedTypes.documents,
    ...allowedTypes.medical
  ];

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // Handle file input change
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  // Process and validate files
  const processFiles = (files) => {
    setError('');
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File too large (max ${formatFileSize(maxFileSize)})`);
        return;
      }

      // Check file type
      if (!allAllowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`);
        return;
      }

      // Check for duplicates
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        errors.push(`${file.name}: File already selected`);
        return;
      }

      validFiles.push({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        category: getFileCategory(file.type),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      });
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Get file category for styling
  const getFileCategory = (mimeType) => {
    if (allowedTypes.images.includes(mimeType)) return 'image';
    if (allowedTypes.documents.includes(mimeType)) return 'document';
    if (allowedTypes.medical.includes(mimeType)) return 'medical';
    return 'other';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (category, type) => {
    switch (category) {
      case 'image':
        return 'ri-image-line';
      case 'document':
        if (type.includes('pdf')) return 'ri-file-pdf-line';
        if (type.includes('word')) return 'ri-file-word-line';
        if (type.includes('excel') || type.includes('sheet')) return 'ri-file-excel-line';
        return 'ri-file-text-line';
      case 'medical':
        return 'ri-heart-pulse-line';
      default:
        return 'ri-file-line';
    }
  };

  // Remove selected file
  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Clean up preview URLs
      const removed = prev.find(f => f.id === fileId);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  // Handle send files
  const handleSendFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const fileData of selectedFiles) {
        await onFileSelect(fileData);
      }
      
      // Clean up and close
      selectedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setSelectedFiles([]);
      setError('');
      onHide();
    } catch (error) {
      setError('Failed to upload files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    // Clean up preview URLs
    selectedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
    setError('');
    setUploading(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="ri-attachment-line me-2"></i>
          Share Files
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
          </Alert>
        )}

        {/* Drag & Drop Area */}
        <div
          className={`file-drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
            backgroundColor: dragActive ? '#f8f9fa' : 'transparent',
            borderColor: dragActive ? '#0d6efd' : '#ccc'
          }}
        >
          <i className="ri-upload-cloud-line fs-1 text-muted mb-3"></i>
          <h5>Drop files here or click to browse</h5>
          <p className="text-muted mb-0">
            Supports images, documents, and medical files up to {formatFileSize(maxFileSize)}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allAllowedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h6 className="mb-3">Selected Files ({selectedFiles.length})</h6>
            <div className="row g-3">
              {selectedFiles.map((fileData) => (
                <div key={fileData.id} className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-start gap-3">
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {fileData.preview ? (
                            <img
                              src={fileData.preview}
                              alt={fileData.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px'
                              }}
                            >
                              <i className={`${getFileIcon(fileData.category, fileData.type)} fs-4 text-primary`}></i>
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <h6 className="mb-1 text-truncate" title={fileData.name}>
                            {fileData.name}
                          </h6>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <small className="text-muted">{formatFileSize(fileData.size)}</small>
                            <Badge bg={
                              fileData.category === 'medical' ? 'danger' :
                              fileData.category === 'image' ? 'success' : 'primary'
                            }>
                              {fileData.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFile(fileData.id)}
                          disabled={uploading}
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-3">
            <ProgressBar animated now={100} label="Uploading files..." />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSendFiles}
          disabled={selectedFiles.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <i className="ri-loader-line me-2"></i>
              Uploading...
            </>
          ) : (
            <>
              <i className="ri-send-plane-line me-2"></i>
              Send {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUpload;