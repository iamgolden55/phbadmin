/**
 * Application Detail Page - REDESIGNED (Admin View)
 *
 * Modern dashboard-style application review page for administrators
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import Footer from '../../layouts/Footer';
import HeaderMobile from '../../layouts/HeaderMobile';
import registryService from '../../services/registryService';
import { useAuth } from '../../hooks/useAuth';

// Import new components
import MetricsCard from '../../components/registry/MetricsCard';
import InfoCard from '../../components/registry/InfoCard';
import DocumentCard from '../../components/registry/DocumentCard';
import Timeline from '../../components/registry/Timeline';

export default function ApplicationDetailRedesigned() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [startReviewOpen, setStartReviewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectDocOpen, setRejectDocOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Form data
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [approvalData, setApprovalData] = useState({
    practice_type: '',
    public_email: '',
    public_phone: '',
    biography: '',
    review_notes: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [docRejectionReason, setDocRejectionReason] = useState('');

  // Fetch application detail
  const fetchApplicationDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await registryService.applications.getApplicationDetail(applicationId);
      setApplication(data);

      // Pre-fill approval data with existing application information
      setApprovalData({
        practice_type: data.professional_type_display || data.specialization_display || '',
        public_email: data.email || '',
        public_phone: data.phone || '',
        biography: '',
        review_notes: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('view_applications')) {
      fetchApplicationDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  // Start review
  const handleStartReview = async () => {
    try {
      await registryService.applications.startReview(applicationId, { reviewer_notes: reviewerNotes });
      setSuccess('Review started successfully');
      setStartReviewOpen(false);
      setReviewerNotes('');
      fetchApplicationDetail();
    } catch (err) {
      setError(err.message || 'Failed to start review');
    }
  };

  // Approve application
  const handleApprove = async () => {
    try {
      await registryService.applications.approveApplication(applicationId, approvalData);
      setSuccess('Application approved successfully! License number has been issued.');
      setApproveOpen(false);
      fetchApplicationDetail();
    } catch (err) {
      setError(err.message || 'Failed to approve application');
    }
  };

  // Reject application
  const handleReject = async () => {
    try {
      await registryService.applications.rejectApplication(applicationId, { rejection_reason: rejectionReason });
      setSuccess('Application rejected');
      setRejectOpen(false);
      setRejectionReason('');
      fetchApplicationDetail();
    } catch (err) {
      setError(err.message || 'Failed to reject application');
    }
  };

  // Verify document
  const handleVerifyDocument = async (documentId) => {
    try {
      await registryService.documents.verifyDocument(applicationId, documentId, {});
      setSuccess('Document verified successfully');
      fetchApplicationDetail();
    } catch (err) {
      setError(err.message || 'Failed to verify document');
    }
  };

  // Reject document
  const handleRejectDocument = async () => {
    if (!docRejectionReason) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      await registryService.documents.rejectDocument(applicationId, selectedDocId, { reason: docRejectionReason });
      setSuccess('Document rejected');
      setRejectDocOpen(false);
      setDocRejectionReason('');
      setSelectedDocId(null);
      fetchApplicationDetail();
    } catch (err) {
      setError(err.message || 'Failed to reject document');
    }
  };

  const openRejectDocModal = (documentId) => {
    setSelectedDocId(documentId);
    setRejectDocOpen(true);
  };

  // Get metrics data
  const getMetricsData = () => {
    if (!application) return null;

    const totalDocs = application.documents?.length || 0;
    const verifiedDocs = application.documents?.filter(d => d.verification_status === 'verified').length || 0;
    const pendingDocs = application.documents?.filter(d => d.verification_status === 'pending').length || 0;
    const rejectedDocs = application.documents?.filter(d => d.verification_status === 'rejected').length || 0;

    const daysSinceSubmission = application.submitted_date
      ? Math.floor((Date.now() - new Date(application.submitted_date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Check if any rejected docs have approaching deadlines
    const hasUrgentRejections = application.documents?.some(d =>
      d.verification_status === 'rejected' && d.is_deadline_approaching
    ) || false;

    return {
      totalDocs,
      verifiedDocs,
      pendingDocs,
      rejectedDocs,
      daysSinceSubmission,
      hasUrgentRejections,
    };
  };

  // Get timeline items
  const getTimelineItems = () => {
    if (!application) return [];

    const items = [
      {
        id: 'created',
        title: 'Application Created',
        date: new Date(application.created_at).toLocaleDateString(),
        status: 'completed',
      },
    ];

    if (application.submitted_date) {
      items.push({
        id: 'submitted',
        title: 'Application Submitted',
        date: new Date(application.submitted_date).toLocaleDateString(),
        status: 'completed',
      });
    }

    if (application.under_review_date) {
      items.push({
        id: 'under_review',
        title: 'Under Review',
        date: new Date(application.under_review_date).toLocaleDateString(),
        status: application.status === 'under_review' ? 'current' : 'completed',
      });
    } else if (application.status === 'submitted') {
      items.push({
        id: 'awaiting_review',
        title: 'Awaiting Review',
        status: 'current',
      });
    }

    if (application.decision_date) {
      items.push({
        id: 'decision',
        title: application.status === 'approved' ? 'Application Approved' : 'Application Rejected',
        description: application.phb_license_number ? `License: ${application.phb_license_number}` : undefined,
        date: new Date(application.decision_date).toLocaleDateString(),
        status: application.status === 'approved' ? 'completed' : 'completed',
      });
    } else if (application.status === 'under_review') {
      items.push({
        id: 'decision',
        title: 'Final Decision',
        status: 'pending',
      });
    }

    return items;
  };

  // Get applicant info
  const getApplicantInfo = () => {
    if (!application) return [];

    return [
      { label: 'Application #', value: application.application_reference },
      { label: 'First Name', value: application.first_name },
      { label: 'Last Name', value: application.last_name },
      { label: 'Email', value: application.email },
      { label: 'Phone', value: application.phone_number },
      { label: 'Gender', value: application.gender },
      { label: 'Date of Birth', value: application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : '—' },
    ];
  };

  // Get professional info
  const getProfessionalInfo = () => {
    if (!application) return [];

    return [
      { label: 'Professional Type', value: application.professional_type?.replace('_', ' ') },
      { label: 'Specialization', value: application.specialization },
      { label: 'Regulatory Body', value: application.regulatory_body },
      { label: 'Registration Number', value: application.registration_number },
      { label: 'Registration Date', value: application.registration_date ? new Date(application.registration_date).toLocaleDateString() : '—' },
      { label: 'Years of Experience', value: application.years_of_experience },
    ];
  };

  const getStatusBadgeClass = (status) => {
    const colors = {
      draft: 'secondary',
      submitted: 'info',
      under_review: 'warning',
      approved: 'success',
      rejected: 'danger',
      clarification_requested: 'warning',
    };
    return colors[status] || 'secondary';
  };

  // Permission check
  if (!hasPermission('view_applications')) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <Alert variant="danger">
            <Alert.Heading>Access Denied</Alert.Heading>
            <p>You do not have permission to view applications.</p>
            <p className="mb-0">Required permission: <code>view_applications</code></p>
          </Alert>
          <Footer />
        </div>
      </React.Fragment>
    );
  }

  if (loading) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary me-2"></div>
            <p className="mt-2 text-muted">Loading application...</p>
          </div>
          <Footer />
        </div>
      </React.Fragment>
    );
  }

  if (!application) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <Alert variant="danger">Application not found</Alert>
          <Footer />
        </div>
      </React.Fragment>
    );
  }

  const metrics = getMetricsData();

  return (
    <React.Fragment>
      <HeaderMobile />
      <div className="main p-4 p-lg-5">
        {/* Breadcrumb */}
        <ol className="breadcrumb fs-sm mb-3">
          <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/registry/applications">Applications</Link></li>
          <li className="breadcrumb-item active">{application.application_reference}</li>
        </ol>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/registry/applications')}
            >
              <i className="ri-arrow-left-line me-1"></i> Back
            </Button>
            <div>
              <h2 className="mb-0">Application Detail <span className="badge bg-success">REDESIGNED ✓</span></h2>
              <p className="text-muted small mb-0">{application.application_reference}</p>
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <span className={`badge bg-${getStatusBadgeClass(application.status)} px-3 py-2`}>
              {application.status?.replace('_', ' ').toUpperCase()}
            </span>

            {/* Action Buttons */}
            {application.status === 'submitted' && hasPermission('review_applications') && (
              <Button variant="primary" onClick={() => setStartReviewOpen(true)}>
                <i className="ri-play-line me-1"></i> Start Review
              </Button>
            )}

            {application.status === 'under_review' && hasPermission('review_applications') && (
              <>
                <Button variant="outline-danger" onClick={() => setRejectOpen(true)}>
                  <i className="ri-close-circle-line me-1"></i> Reject
                </Button>
                <Button variant="success" onClick={() => setApproveOpen(true)}>
                  <i className="ri-checkbox-circle-line me-1"></i> Approve
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <MetricsCard
                icon={<i className="ri-file-list-line"></i>}
                title="Total Documents"
                value={metrics.totalDocs}
                status="info"
                statusText={`${metrics.totalDocs} uploaded`}
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <MetricsCard
                icon={<i className="ri-checkbox-circle-line"></i>}
                title="Verified"
                value={metrics.verifiedDocs}
                status={metrics.verifiedDocs === metrics.totalDocs ? 'good' : 'warning'}
                statusText={`${metrics.verifiedDocs}/${metrics.totalDocs} docs`}
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              {metrics.rejectedDocs > 0 ? (
                <MetricsCard
                  icon={<i className="ri-close-circle-line"></i>}
                  title="Rejected Documents"
                  value={metrics.rejectedDocs}
                  status={metrics.hasUrgentRejections ? 'alert' : 'warning'}
                  statusText={metrics.hasUrgentRejections ? 'Urgent - deadline approaching!' : 'Requires re-upload'}
                />
              ) : (
                <MetricsCard
                  icon={<i className="ri-time-line"></i>}
                  title="Pending Review"
                  value={metrics.pendingDocs}
                  status={metrics.pendingDocs > 0 ? 'warning' : 'good'}
                  statusText={metrics.pendingDocs > 0 ? 'Action needed' : 'All reviewed'}
                />
              )}
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <MetricsCard
                icon={<i className="ri-calendar-line"></i>}
                title="Processing Time"
                value={metrics.daysSinceSubmission !== null ? metrics.daysSinceSubmission : '—'}
                unit={metrics.daysSinceSubmission !== null ? 'days' : ''}
                status="info"
                statusText={application.status === 'draft' ? 'Not submitted' : 'Since submission'}
              />
            </Col>
          </Row>
        )}

        <Row className="g-3">
          {/* Main Content */}
          <Col lg={8}>
            <div className="d-flex flex-column gap-3">
              {/* Applicant Information */}
              <InfoCard
                title="Applicant Information"
                items={getApplicantInfo()}
                icon={<i className="ri-user-line"></i>}
              />

              {/* Professional Information */}
              <InfoCard
                title="Professional Information"
                items={getProfessionalInfo()}
                icon={<i className="ri-shield-star-line"></i>}
              />

              {/* Submitted Documents */}
              <div className="bg-white rounded-3 border shadow-sm p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-2">
                      <i className="ri-folder-line text-primary fs-5"></i>
                    </div>
                    <h5 className="fw-semibold mb-0">Submitted Documents</h5>
                  </div>
                  <span className="text-muted small">{metrics.totalDocs} documents</span>
                </div>

                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      documentType={doc.document_type}
                      fileName={doc.original_filename || doc.file_name}
                      fileSize={doc.file_size}
                      uploadDate={doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : undefined}
                      status={doc.verification_status || 'pending'}
                      rejectionReason={doc.rejection_reason}
                      fileUrl={doc.file_url}
                      canReview={hasPermission('review_applications') && application.status === 'under_review'}
                      onVerify={() => handleVerifyDocument(doc.id)}
                      onReject={() => openRejectDocModal(doc.id)}
                    />
                  ))
                ) : (
                  <p className="text-muted text-center py-4">No documents uploaded yet</p>
                )}
              </div>
            </div>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <div className="d-flex flex-column gap-3">
              {/* Timeline */}
              <div className="bg-white rounded-3 border shadow-sm p-4">
                <h5 className="fw-semibold mb-4">Application Timeline</h5>
                <Timeline items={getTimelineItems()} />
              </div>

              {/* Help Card */}
              <div className="bg-info bg-opacity-10 border border-info rounded-3 p-4">
                <h6 className="fw-semibold text-info mb-2">Need Help?</h6>
                <p className="small text-muted mb-3">
                  Contact technical support for assistance with application review
                </p>
                <a href="mailto:admin@phb.ng" className="small text-info text-decoration-none">
                  <i className="ri-mail-line me-1"></i> admin@phb.ng
                </a>
              </div>
            </div>
          </Col>
        </Row>

        {/* Modals */}
        {/* Start Review Modal */}
        <Modal show={startReviewOpen} onHide={() => setStartReviewOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Start Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Reviewer Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setStartReviewOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStartReview}>
              Start Review
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Approve Modal */}
        <Modal show={approveOpen} onHide={() => setApproveOpen(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Approve Application</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Practice Type</Form.Label>
                    <Form.Control
                      value={approvalData.practice_type}
                      onChange={(e) => setApprovalData({...approvalData, practice_type: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Public Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={approvalData.public_email}
                      onChange={(e) => setApprovalData({...approvalData, public_email: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Public Phone</Form.Label>
                <Form.Control
                  value={approvalData.public_phone}
                  onChange={(e) => setApprovalData({...approvalData, public_phone: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Biography</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={approvalData.biography}
                  onChange={(e) => setApprovalData({...approvalData, biography: e.target.value})}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Review Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={approvalData.review_notes}
                  onChange={(e) => setApprovalData({...approvalData, review_notes: e.target.value})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove}>
              Approve Application
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reject Application Modal */}
        <Modal show={rejectOpen} onHide={() => setRejectOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reject Application</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Rejection Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejection..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Reject Application
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reject Document Modal */}
        <Modal show={rejectDocOpen} onHide={() => setRejectDocOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reject Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Rejection Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={docRejectionReason}
                onChange={(e) => setDocRejectionReason(e.target.value)}
                placeholder="Why is this document being rejected?"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setRejectDocOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectDocument}>
              Reject Document
            </Button>
          </Modal.Footer>
        </Modal>

        <Footer />
      </div>
    </React.Fragment>
  );
}
