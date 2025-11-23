import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Form, Modal, Alert } from 'react-bootstrap';
import Footer from '../../layouts/Footer';
import HeaderMobile from '../../layouts/HeaderMobile';
import practicePageService from '../../services/practicePageService';
import { useAuth } from '../../hooks/useAuth';

export default function PracticePageDetail() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  // Form data
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [reactivationNotes, setReactivationNotes] = useState('');

  // Penalty fields
  const [flagHasPenalty, setFlagHasPenalty] = useState(false);
  const [flagPenaltyAmount, setFlagPenaltyAmount] = useState('');
  const [suspendHasPenalty, setSuspendHasPenalty] = useState(false);
  const [suspendPenaltyAmount, setSuspendPenaltyAmount] = useState('');

  // Fetch practice page details
  const fetchPageDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await practicePageService.pages.getPageDetail(pageId);
      setPage(data);
    } catch (err) {
      console.error('Failed to fetch practice page details:', err);
      setError(err.message || 'Failed to load practice page details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('view_practice_pages')) {
      fetchPageDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  // Handle approve
  const handleApprove = async () => {
    if (!hasPermission('verify_practice_pages')) {
      alert('You do not have permission to verify practice pages');
      return;
    }

    setActionLoading(true);
    try {
      await practicePageService.pages.verifyPage(pageId, {
        verification_status: 'verified',
        verification_notes: verificationNotes,
      });
      alert('Practice page approved successfully!');
      setShowApproveModal(false);
      fetchPageDetail();
    } catch (err) {
      alert(`Failed to approve: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!hasPermission('verify_practice_pages')) {
      alert('You do not have permission to verify practice pages');
      return;
    }

    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await practicePageService.pages.verifyPage(pageId, {
        verification_status: 'rejected',
        verification_notes: rejectionReason,
      });
      alert('Practice page rejected successfully');
      setShowRejectModal(false);
      fetchPageDetail();
    } catch (err) {
      alert(`Failed to reject: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle flag
  const handleFlag = async () => {
    if (!hasPermission('flag_practice_pages')) {
      alert('You do not have permission to flag practice pages');
      return;
    }

    if (!flagReason.trim()) {
      alert('Please provide a flag reason');
      return;
    }

    if (flagHasPenalty && !flagPenaltyAmount) {
      alert('Please provide a penalty amount');
      return;
    }

    setActionLoading(true);
    try {
      await practicePageService.pages.flagPage(pageId, {
        flag_reason: flagReason,
        has_penalty: flagHasPenalty,
        penalty_amount: flagHasPenalty ? flagPenaltyAmount : null,
      });
      alert('Practice page flagged for review');
      setShowFlagModal(false);
      fetchPageDetail();
    } catch (err) {
      alert(`Failed to flag: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle suspend
  const handleSuspend = async () => {
    if (!hasPermission('suspend_practice_pages')) {
      alert('You do not have permission to suspend practice pages');
      return;
    }

    if (!suspensionReason.trim()) {
      alert('Please provide a suspension reason');
      return;
    }

    if (suspendHasPenalty && !suspendPenaltyAmount) {
      alert('Please provide a penalty amount');
      return;
    }

    setActionLoading(true);
    try {
      await practicePageService.pages.suspendPage(pageId, {
        suspension_reason: suspensionReason,
        has_penalty: suspendHasPenalty,
        penalty_amount: suspendHasPenalty ? suspendPenaltyAmount : null,
      });
      alert('Practice page suspended');
      setShowSuspendModal(false);
      fetchPageDetail();
    } catch (err) {
      alert(`Failed to suspend: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reactivate
  const handleReactivate = async () => {
    if (!hasPermission('verify_practice_pages')) {
      alert('You do not have permission to reactivate practice pages');
      return;
    }

    setActionLoading(true);
    try {
      await practicePageService.pages.verifyPage(pageId, {
        verification_status: 'verified',
        verification_notes: reactivationNotes || 'Page reactivated after review',
      });
      alert('Practice page reactivated successfully!');
      setShowReactivateModal(false);
      fetchPageDetail();
    } catch (err) {
      alert(`Failed to reactivate: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Status badge variant
  const getStatusVariant = (status) => {
    const variants = {
      draft: 'secondary',
      pending: 'warning',
      verified: 'success',
      rejected: 'danger',
      flagged: 'danger',
      suspended: 'dark',
    };
    return variants[status] || 'secondary';
  };

  // Check permission
  if (!hasPermission('view_practice_pages')) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <Alert variant="danger">
            <Alert.Heading>Access Denied</Alert.Heading>
            <p>You do not have permission to view practice pages.</p>
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
            <p className="text-muted">Loading practice page details...</p>
          </div>
          <Footer />
        </div>
      </React.Fragment>
    );
  }

  if (error || !page) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error || 'Practice page not found'}</p>
            <Button variant="outline-danger" onClick={() => navigate('/registry/practice-pages')}>
              <i className="ri-arrow-left-line"></i> Back to Practice Pages
            </Button>
          </Alert>
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
          <li className="breadcrumb-item"><Link to="/registry/practice-pages">Practice Pages</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{page.practice_name}</li>
        </ol>

        {/* Page Title */}
        <h2 className="main-title mb-2">{page.practice_name}</h2>
        <p className="text-secondary fs-sm mb-3">{page.tagline || 'Professional practice page'}</p>

        <Row className="g-2">
          {/* Main Content */}
          <Col xl>
            {/* Status Badge */}
            <div className="mb-2">
              <Badge bg={getStatusVariant(page.verification_status)} className="px-3 py-2">
                <i className="ri-shield-check-line me-1"></i>
                {page.verification_status.toUpperCase()}
              </Badge>
            </div>

            {/* Practice Information Card */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0"><i className="ri-information-line me-1"></i>Practice Information</Card.Title>
              </Card.Header>
              <Card.Body className="p-2">
                <Row className="g-2">
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm">Practice Name</label>
                    <p className="fw-medium mb-0">{page.practice_name}</p>
                  </Col>
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm">Owner Name</label>
                    <p className="fw-medium mb-0">{page.owner_name}</p>
                  </Col>
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm">PHB License Number</label>
                    <p className="fw-medium mb-0">{page.license_number || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm">Professional Type</label>
                    <p className="fw-medium mb-0">{page.professional_type || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm">Service Type</label>
                    <Badge bg="info">{page.service_type}</Badge>
                  </Col>
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm">Slug</label>
                    <p className="fw-medium mb-0 font-monospace text-primary">{page.slug}</p>
                  </Col>
                  {page.tagline && (
                    <Col md={12}>
                      <label className="form-label text-secondary mb-0 fs-sm">Tagline</label>
                      <p className="mb-0">{page.tagline}</p>
                    </Col>
                  )}
                  {page.about && (
                    <Col md={12}>
                      <label className="form-label text-secondary mb-0 fs-sm">About</label>
                      <p className="mb-0">{page.about}</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Location & Contact Card */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0"><i className="ri-map-pin-line me-1"></i>Location & Contact</Card.Title>
              </Card.Header>
              <Card.Body className="p-2">
                <Row className="g-2">
                  <Col md={12}>
                    <label className="form-label text-secondary mb-0 fs-sm">Address</label>
                    <p className="mb-0">{page.address_line_1}</p>
                    {page.address_line_2 && <p className="mb-0">{page.address_line_2}</p>}
                    <p className="text-secondary mb-0">{page.city}, {page.state} {page.postcode}</p>
                  </Col>
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm"><i className="ri-phone-line me-1"></i>Phone</label>
                    <p className="mb-0">{page.phone || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <label className="form-label text-secondary mb-0 fs-sm"><i className="ri-mail-line me-1"></i>Email</label>
                    <p className="mb-0">{page.email || 'N/A'}</p>
                  </Col>
                  {page.whatsapp_number && (
                    <Col md={6}>
                      <label className="form-label text-secondary mb-0 fs-sm"><i className="ri-whatsapp-line me-1"></i>WhatsApp</label>
                      <p className="mb-0">{page.whatsapp_number}</p>
                    </Col>
                  )}
                  {page.website && (
                    <Col md={6}>
                      <label className="form-label text-secondary mb-0 fs-sm"><i className="ri-global-line me-1"></i>Website</label>
                      <p className="mb-0">
                        <a href={page.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                          {page.website}
                        </a>
                      </p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Services & Additional Info Card */}
            <Card className="card-one mb-2">
              <Card.Header className="py-2">
                <Card.Title as="h6" className="mb-0"><i className="ri-service-line me-1"></i>Services & Details</Card.Title>
              </Card.Header>
              <Card.Body className="p-2">
                <Row className="g-2">
                  {page.services_offered && page.services_offered.length > 0 && (
                    <Col md={12}>
                      <label className="form-label text-secondary mb-1 fs-sm">Services Offered</label>
                      <div className="d-flex flex-wrap gap-1">
                        {page.services_offered.map((service, idx) => (
                          <Badge key={idx} bg="info">{service}</Badge>
                        ))}
                      </div>
                    </Col>
                  )}
                  {page.payment_methods && page.payment_methods.length > 0 && (
                    <Col md={12}>
                      <label className="form-label text-secondary mb-1 fs-sm">Payment Methods</label>
                      <div className="d-flex flex-wrap gap-1">
                        {page.payment_methods.map((method, idx) => (
                          <Badge key={idx} bg="secondary">{method}</Badge>
                        ))}
                      </div>
                    </Col>
                  )}
                  {page.languages_spoken && page.languages_spoken.length > 0 && (
                    <Col md={12}>
                      <label className="form-label text-secondary mb-1 fs-sm">Languages Spoken</label>
                      <div className="d-flex flex-wrap gap-1">
                        {page.languages_spoken.map((lang, idx) => (
                          <Badge key={idx} bg="success">{lang}</Badge>
                        ))}
                      </div>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Verification Notes (if any) */}
            {page.verification_notes && (
              <Card className="card-one mb-2">
                <Card.Header className="py-2">
                  <Card.Title as="h6" className="mb-0"><i className="ri-file-text-line me-1"></i>Verification Notes</Card.Title>
                </Card.Header>
                <Card.Body className="p-2">
                  <p className="mb-0">{page.verification_notes}</p>
                  {page.verified_by && (
                    <p className="text-secondary fs-sm mb-0 mt-2">
                      By: {page.verified_by} • {new Date(page.verified_date).toLocaleDateString()}
                    </p>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col xl="4" className="d-none d-xl-block">
            {/* Admin Actions Card */}
            <h5 className="section-title mb-1" style={{fontSize: '14px', fontWeight: '600'}}>Admin Actions</h5>
            <Card className="card-one mb-2">
              <Card.Body className="d-grid gap-1 p-2" style={{padding: '10px'}}>
                {page.verification_status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => setShowApproveModal(true)}
                      disabled={!hasPermission('verify_practice_pages')}
                    >
                      <i className="ri-check-line me-1"></i>Approve Page
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowRejectModal(true)}
                      disabled={!hasPermission('verify_practice_pages')}
                    >
                      <i className="ri-close-line me-1"></i>Reject Page
                    </Button>
                  </>
                )}

                {page.verification_status === 'verified' && (
                  <>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => setShowFlagModal(true)}
                      disabled={!hasPermission('flag_practice_pages')}
                    >
                      <i className="ri-flag-line me-1"></i>Flag for Review
                    </Button>
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => setShowSuspendModal(true)}
                      disabled={!hasPermission('suspend_practice_pages')}
                    >
                      <i className="ri-pause-circle-line me-1"></i>Suspend Page
                    </Button>
                  </>
                )}

                {(page.verification_status === 'flagged' || page.verification_status === 'suspended') && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => setShowReactivateModal(true)}
                    disabled={!hasPermission('verify_practice_pages')}
                  >
                    <i className="ri-restart-line me-1"></i>Reactivate Page
                  </Button>
                )}

                <hr className="my-1" style={{margin: '6px 0'}} />

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => window.open(`http://127.0.0.1:5173/practice-pages/${page.slug}`, '_blank')}
                >
                  <i className="ri-external-link-line me-1"></i>View Public Page
                </Button>
              </Card.Body>
            </Card>

            {/* Statistics Card */}
            <h5 className="section-title mb-1 mt-2" style={{fontSize: '14px', fontWeight: '600'}}>Statistics</h5>
            <Card className="card-one mb-2">
              <Card.Body style={{padding: '10px'}}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div>
                    <label className="form-label text-secondary mb-0" style={{fontSize: '11px'}}>Page Views</label>
                    <h5 className="mb-0">{page.view_count || 0}</h5>
                  </div>
                  <div className="avatar avatar-sm bg-primary-transparent text-primary">
                    <i className="ri-eye-line" style={{fontSize: '14px'}}></i>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <label className="form-label text-secondary mb-0" style={{fontSize: '11px'}}>Nominations</label>
                    <h5 className="mb-0">{page.nomination_count || 0}</h5>
                  </div>
                  <div className="avatar avatar-sm bg-success-transparent text-success">
                    <i className="ri-star-line" style={{fontSize: '14px'}}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Timestamps Card */}
            <h5 className="section-title mb-1 mt-2" style={{fontSize: '14px', fontWeight: '600'}}>Timestamps</h5>
            <Card className="card-one">
              <Card.Body style={{padding: '10px'}}>
                <div className="mb-1">
                  <label className="form-label text-secondary mb-0" style={{fontSize: '11px'}}>Created</label>
                  <p className="mb-0" style={{fontSize: '12px'}}>{new Date(page.created_at).toLocaleString()}</p>
                </div>
                <div className="mb-1">
                  <label className="form-label text-secondary mb-0" style={{fontSize: '11px'}}>Last Updated</label>
                  <p className="mb-0" style={{fontSize: '12px'}}>{new Date(page.updated_at).toLocaleString()}</p>
                </div>
                {page.verified_date && (
                  <div>
                    <label className="form-label text-secondary mb-0" style={{fontSize: '11px'}}>Verified Date</label>
                    <p className="mb-0" style={{fontSize: '12px'}}>{new Date(page.verified_date).toLocaleString()}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Approve Modal */}
        <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Approve Practice Page</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Verification Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add any notes about the approval..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApproveModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? 'Approving...' : 'Approve Page'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reject Modal */}
        <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reject Practice Page</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Rejection Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? 'Rejecting...' : 'Reject Page'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Flag Modal */}
        <Modal show={showFlagModal} onHide={() => setShowFlagModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Flag Practice Page</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Flag Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Provide a reason for flagging..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Apply penalty fee"
                checked={flagHasPenalty}
                onChange={(e) => setFlagHasPenalty(e.target.checked)}
              />
            </Form.Group>

            {flagHasPenalty && (
              <Form.Group>
                <Form.Label>Penalty Amount (₦) *</Form.Label>
                <Form.Control
                  type="number"
                  value={flagPenaltyAmount}
                  onChange={(e) => setFlagPenaltyAmount(e.target.value)}
                  placeholder="Enter penalty amount (e.g., 5000)"
                  required
                />
                <Form.Text className="text-muted">
                  Penalty amount in Nigerian Naira
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFlagModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleFlag} disabled={actionLoading}>
              {actionLoading ? 'Flagging...' : 'Flag Page'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Suspend Modal */}
        <Modal show={showSuspendModal} onHide={() => setShowSuspendModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Suspend Practice Page</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Suspension Reason *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Provide a reason for suspension..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Apply penalty fee"
                checked={suspendHasPenalty}
                onChange={(e) => setSuspendHasPenalty(e.target.checked)}
              />
            </Form.Group>

            {suspendHasPenalty && (
              <Form.Group>
                <Form.Label>Penalty Amount (₦) *</Form.Label>
                <Form.Control
                  type="number"
                  value={suspendPenaltyAmount}
                  onChange={(e) => setSuspendPenaltyAmount(e.target.value)}
                  placeholder="Enter penalty amount (e.g., 10000)"
                  required
                />
                <Form.Text className="text-muted">
                  Penalty amount in Nigerian Naira
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSuspendModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleSuspend} disabled={actionLoading}>
              {actionLoading ? 'Suspending...' : 'Suspend Page'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reactivate Modal */}
        <Modal show={showReactivateModal} onHide={() => setShowReactivateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reactivate Practice Page</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              <i className="ri-information-line me-2"></i>
              Reactivating this page will change its status to <strong>Verified</strong> and make it visible to the public again.
              An approval email will be sent to the page owner.
            </Alert>
            <Form.Group>
              <Form.Label>Reactivation Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reactivationNotes}
                onChange={(e) => setReactivationNotes(e.target.value)}
                placeholder="Add notes about the reactivation (e.g., 'Issues resolved', 'Reviewed and approved')..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReactivateModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleReactivate} disabled={actionLoading}>
              {actionLoading ? 'Reactivating...' : 'Reactivate Page'}
            </Button>
          </Modal.Footer>
        </Modal>

        <Footer />
      </div>
    </React.Fragment>
  );
}
