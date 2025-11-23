import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, Form } from 'react-bootstrap';
import Footer from '../../layouts/Footer';
import HeaderMobile from '../../layouts/HeaderMobile';
import registryService from '../../services/registryService';
import { useAuth } from '../../hooks/useAuth';

export default function ApplicationsList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    professional_type: '',
    search: '',
  });

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await registryService.applications.listApplications(filters);

      // Handle both array and paginated response formats
      // Backend returns {applications: [...]} not {results: [...]}
      const data = Array.isArray(response) ? response : (response?.applications || []);
      setApplications(data);

      // Calculate stats
      const newStats = {
        total: data.length,
        submitted: data.filter(app => app.status === 'submitted').length,
        under_review: data.filter(app => app.status === 'under_review').length,
        approved: data.filter(app => app.status === 'approved').length,
        rejected: data.filter(app => app.status === 'rejected').length,
      };
      setStats(newStats);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || 'Failed to load applications');
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('view_applications')) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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

  return (
    <React.Fragment>
      <HeaderMobile />
      <div className="main p-4 p-lg-5">
        <ol className="breadcrumb fs-sm mb-2">
          <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/registry/applications">Registry</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Applications</li>
        </ol>
        <h2 className="main-title mb-4">Professional Registry Applications</h2>

        {/* Statistics Cards */}
        <Row className="g-3 mb-4">
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1">Total Applications</label>
                <h2 className="card-value mb-0">{stats.total}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-info">Submitted</label>
                <h2 className="card-value mb-0 text-info">{stats.submitted}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-warning">Under Review</label>
                <h2 className="card-value mb-0 text-warning">{stats.under_review}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-success">Approved</label>
                <h2 className="card-value mb-0 text-success">{stats.approved}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-danger">Rejected</label>
                <h2 className="card-value mb-0 text-danger">{stats.rejected}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="card-one mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, number..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.professional_type}
                  onChange={(e) => handleFilterChange('professional_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="midwife">Midwife</option>
                  <option value="dentist">Dentist</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="outline-primary" onClick={fetchApplications} className="w-100">
                  <i className="ri-refresh-line"></i> Refresh
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Applications Table */}
        <Card className="card-one">
          <Card.Header>
            <Card.Title as="h6">All Applications</Card.Title>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="table-agent mb-0" hover>
                <thead>
                  <tr>
                    <th>Application #</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Registration #</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="text-muted">
                          <i className="ri-file-list-3-line fs-1 mb-3 d-block"></i>
                          <h6>No Applications Found</h6>
                          <p className="mb-0 small">
                            {error ?
                              'The backend API endpoint is not available yet. Please check backend implementation.' :
                              'There are currently no professional registration applications to review.'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.application_reference}</td>
                        <td>
                          <strong>{app.first_name} {app.last_name}</strong>
                        </td>
                        <td>
                          <Badge bg="secondary" className="text-uppercase">
                            {app.professional_type}
                          </Badge>
                        </td>
                        <td>{app.regulatory_body_registration_number}</td>
                        <td>
                          <Badge bg={getStatusVariant(app.status)}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/registry/applications/${app.id}`)}
                          >
                            <i className="ri-eye-line"></i> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}
