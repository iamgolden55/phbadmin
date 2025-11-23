/**
 * DocumentCard Component
 *
 * Modern document display card for admin review
 * JavaScript version for admin_dashboard
 */

import React from 'react';
import { Badge } from 'react-bootstrap';

const DocumentCard = ({
  documentType,
  fileName,
  fileSize,
  uploadDate,
  status,
  rejectionReason,
  fileUrl,
  onVerify,
  onReject,
  canReview = false,
}) => {
  const formatBytes = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDocumentType = (type) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: (
            <svg className="bi" width="20" height="20" fill="currentColor">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          ),
          bgColor: 'bg-success-subtle',
          borderColor: 'border-success',
          iconColor: 'text-success',
          textColor: 'text-success',
          badge: 'success',
          label: 'Verified',
        };
      case 'pending':
        return {
          icon: (
            <svg className="bi spinner-border spinner-border-sm" width="20" height="20" role="status">
              <span className="visually-hidden">Loading...</span>
            </svg>
          ),
          bgColor: 'bg-warning-subtle',
          borderColor: 'border-warning',
          iconColor: 'text-warning',
          textColor: 'text-warning',
          badge: 'warning',
          label: 'Pending Review',
        };
      case 'rejected':
        return {
          icon: (
            <svg className="bi" width="20" height="20" fill="currentColor">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>
          ),
          bgColor: 'bg-danger-subtle',
          borderColor: 'border-danger',
          iconColor: 'text-danger',
          textColor: 'text-danger',
          badge: 'danger',
          label: 'Rejected',
        };
      case 'clarification_needed':
        return {
          icon: (
            <svg className="bi" width="20" height="20" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
            </svg>
          ),
          bgColor: 'bg-info-subtle',
          borderColor: 'border-info',
          iconColor: 'text-info',
          textColor: 'text-info',
          badge: 'info',
          label: 'Needs Clarification',
        };
      default:
        return {
          icon: (
            <svg className="bi" width="20" height="20" fill="currentColor">
              <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
            </svg>
          ),
          bgColor: 'bg-secondary-subtle',
          borderColor: 'border-secondary',
          iconColor: 'text-secondary',
          textColor: 'text-secondary',
          badge: 'secondary',
          label: 'Not Uploaded',
        };
    }
  };

  const statusConfig = getStatusConfig();
  // Check if document has a file URL (more reliable than fileName)
  const hasDocument = fileUrl && status !== 'missing';

  // Extract filename from URL if fileName is not provided
  const displayFileName = fileName || (fileUrl ? fileUrl.split('/').pop() : 'Document');

  return (
    <div className={`border ${statusConfig.borderColor} rounded-3 p-3 bg-white mb-2`}>
      <div className="d-flex align-items-start justify-content-between">
        <div className="d-flex align-items-start gap-3 flex-fill">
          <div className={`${statusConfig.bgColor} p-2 rounded-3 flex-shrink-0`}>
            <div className={statusConfig.iconColor}>{statusConfig.icon}</div>
          </div>

          <div className="flex-fill overflow-hidden">
            <h6 className="fw-medium text-dark mb-1">
              {formatDocumentType(documentType)}
            </h6>

            {hasDocument ? (
              <div className="small">
                <p className="text-truncate mb-1">{displayFileName}</p>
                <div className="d-flex align-items-center gap-2 text-muted">
                  {fileSize && <span>{formatBytes(fileSize)}</span>}
                  {uploadDate && (
                    <>
                      <span>•</span>
                      <span>{uploadDate}</span>
                    </>
                  )}
                </div>
                {/* View/Download Document Button */}
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary mt-2"
                  >
                    <svg className="bi me-1" width="14" height="14" fill="currentColor">
                      <path d="M8.5 6a.5.5 0 0 0-1 0v3.793L6.354 8.646a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.793V6z"/>
                      <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                    </svg>
                    View Document
                  </a>
                )}
              </div>
            ) : (
              <Badge bg={statusConfig.badge} className="mt-1">
                {statusConfig.label}
              </Badge>
            )}
          </div>
        </div>

        {canReview && hasDocument && status === 'pending' && (
          <div className="d-flex gap-2 ms-3">
            {onReject && (
              <button
                onClick={onReject}
                className="btn btn-sm btn-outline-danger"
                title="Reject document"
              >
                <svg className="bi" width="16" height="16" fill="currentColor">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                </svg>
              </button>
            )}

            {onVerify && (
              <button
                onClick={onVerify}
                className="btn btn-sm btn-success"
                title="Verify document"
              >
                <svg className="bi" width="16" height="16" fill="currentColor">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rejection Reason */}
      {rejectionReason && (
        <div className="mt-3 p-2 bg-danger-subtle border border-danger rounded-2">
          <p className="small fw-medium text-danger mb-1">Rejection Reason:</p>
          <p className="small text-danger mb-0">{rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
