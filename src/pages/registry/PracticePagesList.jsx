import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, Form } from 'react-bootstrap';
import Footer from '../../layouts/Footer';
import HeaderMobile from '../../layouts/HeaderMobile';
import practicePageService from '../../services/practicePageService';
import { useAuth } from '../../hooks/useAuth';

export default function PracticePagesList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    flagged: 0,
    suspended: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    verification_status: '',
    service_type: '',
    search: '',
  });

  // Fetch practice pages
  const fetchPages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await practicePageService.pages.listPages(filters);

      // Handle both array and paginated response formats
      const data = Array.isArray(response) ? response : (response?.pages || response?.results || []);
      setPages(data);

      // Calculate stats
      const newStats = {
        total: data.length,
        pending: data.filter(page => page.verification_status === 'pending').length,
        verified: data.filter(page => page.verification_status === 'verified').length,
        rejected: data.filter(page => page.verification_status === 'rejected').length,
        flagged: data.filter(page => page.verification_status === 'flagged').length,
        suspended: data.filter(page => page.verification_status === 'suspended').length,
      };
      setStats(newStats);
    } catch (err) {
      console.error('Failed to fetch practice pages:', err);
      setError(err.message || 'Failed to load practice pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('view_practice_pages')) {
      fetchPages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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

  // Service type display name
  const getServiceTypeDisplay = (type) => {
    const types = {
      in_store: 'In-Store',
      online: 'Online',
      hybrid: 'Hybrid',
    };
    return types[type] || type;
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Check permission
  if (!hasPermission('view_practice_pages')) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <div className="alert alert-danger">
            <h5 className="alert-heading">Access Denied</h5>
            <p>You do not have permission to view practice pages.</p>
            <p className="mb-0">Required permission: <code>view_practice_pages</code></p>
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
          <li className="breadcrumb-item"><Link to="/registry/practice-pages">Registry</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Practice Pages</li>
        </ol>
        <h2 className="main-title mb-4">Professional Practice Pages</h2>

        {/* Statistics Cards */}
        <Row className="g-3 mb-4">
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1">Total Pages</label>
                <h2 className="card-value mb-0">{stats.total}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-warning">Pending</label>
                <h2 className="card-value mb-0 text-warning">{stats.pending}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-success">Verified</label>
                <h2 className="card-value mb-0 text-success">{stats.verified}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-danger">Flagged</label>
                <h2 className="card-value mb-0 text-danger">{stats.flagged}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md>
            <Card className="card-one">
              <Card.Body className="p-3">
                <label className="card-label fs-sm fw-medium mb-1 text-dark">Suspended</label>
                <h2 className="card-value mb-0 text-dark">{stats.suspended}</h2>
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
                  placeholder="Search by practice name, owner, location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.verification_status}
                  onChange={(e) => handleFilterChange('verification_status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">Flagged</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.service_type}
                  onChange={(e) => handleFilterChange('service_type', e.target.value)}
                >
                  <option value="">All Service Types</option>
                  <option value="in_store">In-Store</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="outline-primary" onClick={fetchPages} className="w-100">
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

        {/* Practice Pages Table */}
        <Card className="card-one">
          <Card.Header>
            <Card.Title as="h6">All Practice Pages</Card.Title>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="table-agent mb-0" hover>
                <thead>
                  <tr>
                    <th>Practice Name</th>
                    <th>Owner</th>
                    <th>License</th>
                    <th>Service Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Nominations</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading practice pages...
                      </td>
                    </tr>
                  ) : pages.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="text-muted">
                          <i className="ri-store-2-line fs-1 mb-3 d-block"></i>
                          <h6>No Practice Pages Found</h6>
                          <p className="mb-0 small">
                            {error ?
                              'Unable to load practice pages. Please try again.' :
                              'There are currently no professional practice pages to review.'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pages.map((page) => (
                      <tr key={page.id}>
                        <td>
                          <strong>{page.practice_name}</strong>
                        </td>
                        <td>
                          {page.owner_name || `${page.owner?.first_name || ''} ${page.owner?.last_name || ''}`}
                        </td>
                        <td>
                          <span className="text-muted small">{page.license_number || 'N/A'}</span>
                        </td>
                        <td>
                          <Badge bg="secondary" className="text-uppercase">
                            {getServiceTypeDisplay(page.service_type)}
                          </Badge>
                        </td>
                        <td>{page.city}, {page.state}</td>
                        <td>
                          <Badge bg={getStatusVariant(page.verification_status)}>
                            {page.verification_status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="text-center">{page.nomination_count || 0}</td>
                        <td className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/registry/practice-pages/${page.id}`)}
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
