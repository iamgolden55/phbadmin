import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Form,
  Modal,
} from 'react-bootstrap';
import Footer from '../../layouts/Footer';
import HeaderMobile from '../../layouts/HeaderMobile';
import registryService from '../../services/registryService';
import { useAuth } from '../../hooks/useAuth';

export default function ApplicationDetail() {
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
  const [requestDocsOpen, setRequestDocsOpen] = useState(false);

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
  const [requestMessage, setRequestMessage] = useState('');
  const [documentsNeeded, setDocumentsNeeded] = useState('');

  // Fetch application detail
  const fetchApplicationDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await registryService.applications.getApplicationDetail(applicationId);
      setApplication(data);

      // Pre-fill approval data from application
      setApprovalData({
        practice_type: data.practice_type || '',
        public_email: data.email || '',
        public_phone: data.phone_number || '',
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

  // Status badge variant
  const getStatusVariant = (status) => {
    const variants = {
      draft: 'secondary',
      submitted: 'info',
      under_review: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return variants[status] || 'secondary';
  };

  // Document verification status color
  const getDocStatusVariant = (status) => {
    const variants = {
      pending: 'secondary',
      verified: 'success',
      rejected: 'danger',
      clarification_needed: 'warning',
    };
    return variants[status] || 'secondary';
  };

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

  // Request additional documents
  const handleRequestDocuments = async () => {
    try {
      await registryService.applications.requestAdditionalDocuments(applicationId, {
        notes: requestMessage,
        documents_needed: documentsNeeded,
      });
      setSuccess('Document request sent to applicant');
      setRequestDocsOpen(false);
      setRequestMessage('');
      setDocumentsNeeded('');
      fetchApplicationDetail();
    } catch (err) {
      setError(err.message || 'Failed to request documents');
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
  const handleRejectDocument = async (documentId, reason) => {
    if (!reason) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      await registryService.documents.rejectDocument(applicationId, documentId, { reason });
      setSuccess('Document rejected');
      fetchApplicationDetail();
    } catch (err) {
      setError(err.message || 'Failed to reject document');
    }
  };

  // Check permission
  if (!hasPermission('view_applications')) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <div className="alert alert-danger">
            <h5 className="alert-heading">Access Denied</h5>
            <p>You do not have permission to view applications.</p>
            <p className="mb-0">Required permission: <code>view_applications</code></p>
          </div>
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
            <div className="spinner-border me-2"></div>
            <p className="mt-2">Loading application...</p>
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
          <div className="alert alert-danger">
            Application not found
          </div>
          <Footer />
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <HeaderMobile />
      <div className="main p-4 p-lg-5">
        {/* Breadcrumb */}
        <ol className="breadcrumb fs-sm mb-2">
          <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/registry/applications">Applications</Link></li>
          <li className="breadcrumb-item active" aria-current="page">
            {application.application_reference}
          </li>
        </ol>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/registry/applications')}
            >
              <i className="ri-arrow-left-line"></i> Back
            </Button>
            <h2 className="main-title mb-0">Application Detail</h2>
            <Badge bg={getStatusVariant(application.status)}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            {application.status === 'submitted' && hasPermission('review_applications') && (
              <Button
                variant="primary"
                onClick={() => setStartReviewOpen(true)}
              >
                <i className="ri-play-line me-1"></i> Start Review
              </Button>
            )}

            {application.status === 'under_review' && hasPermission('review_applications') && (
              <>
                <Button
                  variant="outline-secondary"
                  onClick={() => setRequestDocsOpen(true)}
                >
                  <i className="ri-file-list-line me-1"></i> Request Documents
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => setRejectOpen(true)}
                >
                  <i className="ri-close-circle-line me-1"></i> Reject
                </Button>
                <Button
                  variant="success"
                  onClick={() => setApproveOpen(true)}
                >
                  <i className="ri-checkbox-circle-line me-1"></i> Approve
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {/* Key Metrics Cards */}
        <Row className="g-2 mb-3">
          <Col sm={6} lg={3}>
            <Card className="card-one">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-icon bg-primary text-white rounded-circle me-3">
                    <i className="ri-file-text-line fs-4"></i>
                  </div>
                  <div>
                    <label className="card-label fs-sm fw-medium mb-1">Application #</label>
                    <h6 className="card-value mb-0">{application.application_reference}</h6>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="card-one">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-icon bg-info text-white rounded-circle me-3">
                    <i className="ri-user-star-line fs-4"></i>
                  </div>
                  <div>
                    <label className="card-label fs-sm fw-medium mb-1">Professional Type</label>
                    <h6 className="card-value mb-0 text-capitalize">{application.professional_type}</h6>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="card-one">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-icon bg-success text-white rounded-circle me-3">
                    <i className="ri-calendar-check-line fs-4"></i>
                  </div>
                  <div>
                    <label className="card-label fs-sm fw-medium mb-1">Submitted</label>
                    <h6 className="card-value mb-0">
                      {application.submitted_at
                        ? new Date(application.submitted_at).toLocaleDateString()
                        : 'Draft'
                      }
                    </h6>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} lg={3}>
            <Card className="card-one">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className={`avatar avatar-icon bg-${getStatusVariant(application.status)} text-white rounded-circle me-3`}>
                    <i className={`ri-${
                      application.status === 'approved' ? 'checkbox-circle' :
                      application.status === 'rejected' ? 'close-circle' :
                      application.status === 'under_review' ? 'time' : 'file-list'
                    }-line fs-4`}></i>
                  </div>
                  <div>
                    <label className="card-label fs-sm fw-medium mb-1">Status</label>
                    <h6 className="card-value mb-0">
                      {application.status.replace('_', ' ').charAt(0).toUpperCase() +
                       application.status.replace('_', ' ').slice(1)}
                    </h6>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-2">
          {/* Left Column */}
          <Col xl={6}>
            {/* Applicant Information */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0">Applicant Information</Card.Title>
              </Card.Header>
              <Card.Body className="p-3">
                <Row className="g-2">
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">Application #</label>
                    <p className="fw-medium mb-0">{application.application_reference}</p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">Professional Type</label>
                    <p className="fw-medium mb-0 text-capitalize">{application.professional_type}</p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">First Name</label>
                    <p className="fw-medium mb-0">{application.first_name}</p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">Last Name</label>
                    <p className="fw-medium mb-0">{application.last_name}</p>
                  </Col>
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Email</label>
                    <p className="fw-medium mb-0">{application.email}</p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">Phone</label>
                    <p className="fw-medium mb-0">{application.phone_number}</p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">Gender</label>
                    <p className="fw-medium mb-0 text-capitalize">{application.gender}</p>
                  </Col>
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Date of Birth</label>
                    <p className="fw-medium mb-0">
                      {application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'N/A'}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Practice Information */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0">Practice Information</Card.Title>
              </Card.Header>
              <Card.Body className="p-3">
                <Row className="g-2">
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Practice Type</label>
                    <p className="fw-medium mb-0">{application.practice_type || 'Not specified'}</p>
                  </Col>
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Years of Experience</label>
                    <p className="fw-medium mb-0">{application.years_of_experience || 'N/A'}</p>
                  </Col>
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Specialization</label>
                    <p className="fw-medium mb-0">{application.specialization || 'N/A'}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Regulatory Information */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0">Regulatory Information</Card.Title>
              </Card.Header>
              <Card.Body className="p-3">
                <Row className="g-2">
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Regulatory Body</label>
                    <p className="fw-medium mb-0">{application.regulatory_body}</p>
                  </Col>
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Registration Number</label>
                    <p className="fw-medium mb-0">{application.regulatory_body_registration_number}</p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">Registration Date</label>
                    <p className="fw-medium mb-0">
                      {application.regulatory_body_registration_date
                        ? new Date(application.regulatory_body_registration_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">License Expiry</label>
                    <p className="fw-medium mb-0">
                      {application.regulatory_body_license_expiry_date
                        ? new Date(application.regulatory_body_license_expiry_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xl={6}>
            {/* Documents */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0">Submitted Documents</Card.Title>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="table-agent mb-0" hover>
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.documents && application.documents.length > 0 ? (
                        application.documents.map((doc) => (
                          <tr key={doc.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <i className="ri-file-text-line"></i>
                                <span className="text-capitalize">{doc.document_type}</span>
                              </div>
                            </td>
                            <td>
                              <Badge bg={getDocStatusVariant(doc.verification_status)}>
                                {doc.verification_status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="text-end">
                              {doc.document_file && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  href={doc.document_file}
                                  target="_blank"
                                  download
                                  className="p-0 me-2"
                                >
                                  <i className="ri-download-line"></i>
                                </Button>
                              )}
                              {hasPermission('verify_documents') && doc.verification_status === 'pending' && (
                                <>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 me-2 text-success"
                                    onClick={() => handleVerifyDocument(doc.id)}
                                  >
                                    <i className="ri-checkbox-circle-line"></i>
                                  </Button>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 text-danger"
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason:');
                                      if (reason) handleRejectDocument(doc.id, reason);
                                    }}
                                  >
                                    <i className="ri-close-circle-line"></i>
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4">
                            No documents submitted
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Education */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0">Education</Card.Title>
              </Card.Header>
              <Card.Body className="p-3">
                <Row className="g-2">
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Highest Degree</label>
                    <p className="fw-medium mb-0">{application.highest_degree || 'N/A'}</p>
                  </Col>
                  <Col xs={12}>
                    <label className="fs-sm text-secondary mb-1">Institution</label>
                    <p className="fw-medium mb-0">{application.institution_name || 'N/A'}</p>
                  </Col>
                  <Col xs={6}>
                    <label className="fs-sm text-secondary mb-1">Graduation Year</label>
                    <p className="fw-medium mb-0">{application.graduation_year || 'N/A'}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Review Notes */}
            {application.reviewer_notes && (
              <Card className="card-one mb-2">
                <Card.Header className="py-2">
                  <Card.Title as="h6" className="mb-0">Review Notes</Card.Title>
                </Card.Header>
                <Card.Body className="p-3">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {application.reviewer_notes}
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {/* Start Review Modal */}
        <Modal show={startReviewOpen} onHide={() => setStartReviewOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Start Application Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              This will change the application status to "Under Review" and assign it to you.
            </p>
            <Form.Group>
              <Form.Label>Initial Review Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
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
            <div className="alert alert-success mb-3">
              This will issue a PHB license number and notify the applicant.
            </div>

            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Practice Type</Form.Label>
                  <Form.Select
                    value={approvalData.practice_type}
                    onChange={(e) => setApprovalData({ ...approvalData, practice_type: e.target.value })}
                  >
                    <option value="">Select practice type</option>
                    <option value="private">Private Practice</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="pharmacy">Pharmacy</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label>Public Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={approvalData.public_email}
                    onChange={(e) => setApprovalData({ ...approvalData, public_email: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label>Public Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={approvalData.public_phone}
                    onChange={(e) => setApprovalData({ ...approvalData, public_phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Biography (Public Profile)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={approvalData.biography}
                    onChange={(e) => setApprovalData({ ...approvalData, biography: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Review Notes (Internal)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={approvalData.review_notes}
                    onChange={(e) => setApprovalData({ ...approvalData, review_notes: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove}>
              Approve & Issue License
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reject Modal */}
        <Modal show={rejectOpen} onHide={() => setRejectOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reject Application</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="alert alert-danger mb-3">
              This action is permanent. The applicant will be notified.
            </div>
            <Form.Group>
              <Form.Label>Rejection Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
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

        {/* Request Documents Modal */}
        <Modal show={requestDocsOpen} onHide={() => setRequestDocsOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Request Additional Documents</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Documents Needed</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Updated PCN Certificate, Clearer ID Photo"
                value={documentsNeeded}
                onChange={(e) => setDocumentsNeeded(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Message to Applicant</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setRequestDocsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRequestDocuments}>
              Send Request
            </Button>
          </Modal.Footer>
        </Modal>

        <Footer />
      </div>
    </React.Fragment>
  );
}
