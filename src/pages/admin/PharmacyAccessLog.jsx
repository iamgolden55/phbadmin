import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import { Button, Card, Col, Row, Table, Badge, Dropdown, Spinner, Alert, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

export default function PharmacyAccessLog() {
  const [data, setData] = useState({
    loading: true,
    error: null,
    logs: [],
    filteredLogs: [],
    stats: {
      total_accesses: 0,
      granted_count: 0,
      denied_count: 0,
      controlled_substances_accessed: 0
    }
  });

  const [filters, setFilters] = useState({
    searchTerm: '',
    accessType: 'all',
    accessGranted: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch pharmacy access logs from API
  useEffect(() => {
    fetchAccessLogs();
  }, []);

  const fetchAccessLogs = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/pharmacy-access-logs/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const logs = response.data.results || response.data;

      // Calculate stats
      const stats = {
        total_accesses: logs.length,
        granted_count: logs.filter(log => log.access_granted).length,
        denied_count: logs.filter(log => !log.access_granted).length,
        controlled_substances_accessed: logs.reduce((sum, log) => sum + (log.controlled_substance_count || 0), 0)
      };

      setData({
        loading: false,
        error: null,
        logs: logs,
        filteredLogs: logs,
        stats: stats
      });
    } catch (error) {
      console.error('Error fetching pharmacy access logs:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to load pharmacy access logs'
      }));
    }
  };

  // Filter logs based on current filters
  useEffect(() => {
    let filtered = [...data.logs];

    // Search term filter (HPN, pharmacist email, or patient email)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.patient_hpn?.toLowerCase().includes(searchLower) ||
        log.pharmacist_user?.email?.toLowerCase().includes(searchLower) ||
        log.patient_user?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Access type filter
    if (filters.accessType !== 'all') {
      filtered = filtered.filter(log => log.access_type === filters.accessType);
    }

    // Access granted filter
    if (filters.accessGranted !== 'all') {
      const granted = filters.accessGranted === 'granted';
      filtered = filtered.filter(log => log.access_granted === granted);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.access_time) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => new Date(log.access_time) <= new Date(filters.dateTo));
    }

    setData(prev => ({ ...prev, filteredLogs: filtered }));
  }, [filters, data.logs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      accessType: 'all',
      accessGranted: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAccessTypeBadge = (type) => {
    const badges = {
      'search': 'info',
      'view': 'primary',
      'dispense': 'success'
    };
    return <Badge bg={badges[type] || 'secondary'}>{type.toUpperCase()}</Badge>;
  };

  const getVerificationBadge = (method) => {
    if (!method) return <Badge bg="secondary">Not Verified</Badge>;

    const badges = {
      'hpn_name': { bg: 'info', text: 'HPN + Name' },
      'government_id': { bg: 'warning', text: 'Government ID' },
      'biometric': { bg: 'success', text: 'Biometric' }
    };

    const badge = badges[method] || { bg: 'secondary', text: method };
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/dashboard/hospital">Hospital Management</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Pharmacy Access Logs</li>
            </ol>
            <h4 className="main-title mb-0">Pharmacy Prescription Access Audit Trail</h4>
          </div>
          <div>
            <Button variant="primary" size="sm" onClick={fetchAccessLogs}>
              <i className="ri-refresh-line me-2"></i>
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card className="card-one">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="card-title mb-0">Total Accesses</h6>
                  <i className="ri-file-list-3-line fs-24 text-primary"></i>
                </div>
                <h2 className="mb-0">{data.stats.total_accesses}</h2>
                <small className="text-secondary">All pharmacy prescription lookups</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-one">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="card-title mb-0">Access Granted</h6>
                  <i className="ri-checkbox-circle-line fs-24 text-success"></i>
                </div>
                <h2 className="mb-0 text-success">{data.stats.granted_count}</h2>
                <small className="text-secondary">Successful accesses</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-one">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="card-title mb-0">Access Denied</h6>
                  <i className="ri-close-circle-line fs-24 text-danger"></i>
                </div>
                <h2 className="mb-0 text-danger">{data.stats.denied_count}</h2>
                <small className="text-secondary">Failed access attempts</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-one">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="card-title mb-0">Controlled Substances</h6>
                  <i className="ri-medicine-bottle-line fs-24 text-warning"></i>
                </div>
                <h2 className="mb-0 text-warning">{data.stats.controlled_substances_accessed}</h2>
                <small className="text-secondary">Total accessed</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="card-one mb-3">
          <Card.Header>
            <Card.Title as="h6">Filters</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Search HPN/Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><i className="ri-search-line"></i></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Access Type</Form.Label>
                  <Form.Select
                    value={filters.accessType}
                    onChange={(e) => handleFilterChange('accessType', e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="search">Search</option>
                    <option value="view">View</option>
                    <option value="dispense">Dispense</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.accessGranted}
                    onChange={(e) => handleFilterChange('accessGranted', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="granted">Granted</option>
                    <option value="denied">Denied</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Date To</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <Button variant="secondary" size="sm" onClick={clearFilters} className="w-100">
                  Clear
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Access Logs Table */}
        <Card className="card-one">
          <Card.Header>
            <Card.Title as="h6">
              Access Logs ({data.filteredLogs.length} records)
            </Card.Title>
          </Card.Header>
          <Card.Body>
            {data.loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-secondary">Loading access logs...</p>
              </div>
            ) : data.error ? (
              <Alert variant="danger">
                <i className="ri-error-warning-line me-2"></i>
                {data.error}
              </Alert>
            ) : data.filteredLogs.length === 0 ? (
              <Alert variant="info">
                <i className="ri-information-line me-2"></i>
                No pharmacy access logs found. Adjust filters to see more results.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table className="table-agent mb-0" hover>
                  <thead>
                    <tr>
                      <th>Access Time</th>
                      <th>Patient HPN</th>
                      <th>Pharmacist</th>
                      <th>Pharmacy</th>
                      <th>Access Type</th>
                      <th>Prescriptions</th>
                      <th>Controlled</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.filteredLogs.map((log, index) => (
                      <tr key={index}>
                        <td>
                          <small>{formatDate(log.access_time)}</small>
                        </td>
                        <td>
                          <strong>{log.patient_hpn}</strong>
                        </td>
                        <td>
                          <small>{log.pharmacist_user?.email || 'N/A'}</small>
                        </td>
                        <td>
                          <small>{log.pharmacy?.name || 'N/A'}</small>
                        </td>
                        <td>
                          {getAccessTypeBadge(log.access_type)}
                        </td>
                        <td className="text-center">
                          <Badge bg="info">{log.prescription_count || 0}</Badge>
                        </td>
                        <td className="text-center">
                          {log.controlled_substance_count > 0 ? (
                            <Badge bg="warning">{log.controlled_substance_count}</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {getVerificationBadge(log.verification_method)}
                        </td>
                        <td>
                          {log.access_granted ? (
                            <Badge bg="success">Granted</Badge>
                          ) : (
                            <Badge bg="danger" title={log.denial_reason}>Denied</Badge>
                          )}
                        </td>
                        <td>
                          <small className="text-muted">{log.ip_address || 'N/A'}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Compliance Notice */}
        <Alert variant="info" className="mt-3">
          <i className="ri-information-line me-2"></i>
          <strong>Compliance Notice:</strong> This audit trail logs all pharmacy access to patient prescriptions.
          Access logs cannot be deleted to maintain compliance with NHS EPS standards, NAFDAC regulations, and PCN guidelines.
          All controlled substance accesses are tracked and flagged for review.
        </Alert>

        <Footer />
      </div>
    </React.Fragment>
  );
}
