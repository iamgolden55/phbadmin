import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Nav, Row, Form, Button, Badge, Spinner, Alert } from "react-bootstrap";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import Avatar from "../components/Avatar";
import MessageModal from "../components/MessageModal";
import { useHospitalAdminContacts } from "../hooks/usePlatformData";

// Default avatar placeholder for contacts without images
const defaultAvatar = "https://via.placeholder.com/120x120/6c757d/fff?text=HA";

// Generate avatar color based on contact name
const getAvatarColor = (name) => {
  const colors = ['#506fd9', '#85b6ff', '#28a745', '#dc3545', '#ffc107', '#6610f2', '#20c997', '#fd7e14'];
  const hash = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return colors[hash % colors.length];
};

// Create avatar placeholder with initials
const createAvatarPlaceholder = (name, color) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HA';
  return `https://via.placeholder.com/120x120/${color.slice(1)}/fff?text=${initials}`;
};

export default function HospitalAdminContacts() {
  const { contacts, summary, loading, error } = useHospitalAdminContacts();
  const [activeTab, setActiveTab] = useState('recently_active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  // Messaging modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  
  // Handle send message click
  const handleSendMessage = (contact) => {
    setSelectedRecipient({
      id: contact.user_id,
      name: contact.name,
      email: contact.email,
      hospital_name: contact.hospital_name
    });
    setShowMessageModal(true);
  };

  const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
  const [skin, setSkin] = useState(currentSkin);

  if (loading) {
    return (
      <React.Fragment>
        <Header onSkin={setSkin} />
        <div className="main main-app p-3 p-lg-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading hospital admin contacts...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  if (error) {
    return (
      <React.Fragment>
        <Header onSkin={setSkin} />
        <div className="main main-app p-3 p-lg-4">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Contacts</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </div>
      </React.Fragment>
    );
  }

  // Filter contacts based on search term
  const filterContacts = (contactList) => {
    if (!searchTerm) return contactList;
    return contactList?.filter(contact => 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  };

  // Get contact data based on active tab
  const getActiveTabData = () => {
    if (!contacts) return [];
    
    switch (activeTab) {
      case 'recently_active':
        return filterContacts(contacts.recently_active);
      case 'all_admins':
        return filterContacts(contacts.all_admins);
      case 'by_type':
        const allByType = Object.values(contacts.by_hospital_type || {}).flat();
        return filterContacts(allByType);
      case 'by_region':
        if (selectedRegion === 'all') {
          const allByRegion = Object.values(contacts.by_region || {}).flat();
          return filterContacts(allByRegion);
        } else {
          return filterContacts(contacts.by_region?.[selectedRegion] || []);
        }
      default:
        return [];
    }
  };

  const activeContacts = getActiveTabData();

  // Render contact card
  const renderContactCard = (contact, index) => {
    const contactName = contact.name || 'Hospital Admin';
    const contactEmail = contact.admin_email || contact.user_email;
    const contactPosition = contact.position || 'Hospital Administrator';
    const hospitalName = contact.hospital_name || 'Hospital';
    const avatarColor = getAvatarColor(contactName);
    const avatarImg = createAvatarPlaceholder(contactName, avatarColor);
    
    return (
      <Col sm="6" md="4" key={`${contact.id}-${index}`}>
        <Card className="card-people">
          <Card.Body>
            <Link to=""><Avatar img={avatarImg} size="xl" status={contact.is_active ? 'online' : 'offline'} /></Link>
            <h6 className="mt-3"><Link to="">{contactName}</Link></h6>
            <p className="text-primary">{contactPosition}</p>
            
            {/* Hospital Information */}
            <div className="mb-2">
              <small className="text-secondary d-block">
                <i className="ri-hospital-line me-1"></i>{hospitalName}
              </small>
              {contact.address && (
                <small className="text-muted d-block">{contact.address}</small>
              )}
            </div>
            
            {/* Contact Details */}
            <div className="mb-3">
              <small className="text-secondary d-block mb-1">
                <i className="ri-mail-line me-1"></i>{contactEmail}
              </small>
              {contact.contact_email && contact.contact_email !== contactEmail && (
                <small className="text-secondary d-block mb-1">
                  <i className="ri-mail-send-line me-1"></i>{contact.contact_email}
                </small>
              )}
              {contact.phone && (
                <small className="text-secondary d-block mb-1">
                  <i className="ri-phone-line me-1"></i>{contact.phone}
                </small>
              )}
              {contact.last_login && (
                <small className="text-muted d-block">
                  <i className="ri-time-line me-1"></i>Last login: {new Date(contact.last_login).toLocaleDateString()}
                </small>
              )}
            </div>

            {/* Status Badges */}
            <div className="mb-3">
              <Badge bg={contact.is_active ? 'success' : 'danger'} className="me-2">
                {contact.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {contact.hospital_verified !== undefined && (
                <Badge bg={contact.hospital_verified ? 'success' : 'secondary'}>
                  {contact.hospital_verified ? 'Hospital Verified' : 'Hospital Pending'}
                </Badge>
              )}
              {contact.hospital_type && (
                <Badge bg="info" className="ms-2">
                  {contact.hospital_type.charAt(0).toUpperCase() + contact.hospital_type.slice(1)}
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleSendMessage(contact)}
              >
                <i className="ri-mail-line me-1"></i>Send Message
              </Button>
              <Button variant="outline-secondary" size="sm">
                <i className="ri-user-settings-line me-1"></i>Manage Account
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <Row className="g-5">
          <Col xl>
            <ol className="breadcrumb fs-sm mb-2">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="#">Platform Management</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Hospital Admin Contacts</li>
            </ol>
            <h2 className="main-title">Hospital Admin Communication Hub</h2>
            <p className="text-secondary mb-4">Connect with hospital administrators, department heads, and key healthcare stakeholders across your platform.</p>

            {/* Statistics Summary */}
            {summary && (
              <Row className="g-3 mb-4">
                <Col sm="6" md="3">
                  <Card className="card-one">
                    <Card.Body className="text-center py-3">
                      <h3 className="text-primary mb-1">{summary.total_admins}</h3>
                      <label className="text-secondary fs-sm">Total Admin Users</label>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm="6" md="3">
                  <Card className="card-one">
                    <Card.Body className="text-center py-3">
                      <h3 className="text-success mb-1">{summary.active_admins}</h3>
                      <label className="text-secondary fs-sm">Active Admins</label>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm="6" md="3">
                  <Card className="card-one">
                    <Card.Body className="text-center py-3">
                      <h3 className="text-info mb-1">{summary.verified_hospital_admins}</h3>
                      <label className="text-secondary fs-sm">Verified Hospitals</label>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm="6" md="3">
                  <Card className="card-one">
                    <Card.Body className="text-center py-3">
                      <h3 className="text-warning mb-1">{summary.recent_logins}</h3>
                      <label className="text-secondary fs-sm">Recent Logins (7d)</label>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Navigation Tabs */}
            <Nav className="nav-line mb-4">
              <Nav.Link 
                href="#" 
                className={activeTab === 'recently_active' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('recently_active'); }}
              >
                Recently Added ({contacts?.recently_active?.length || 0})
              </Nav.Link>
              <Nav.Link 
                href="#" 
                className={activeTab === 'all_admins' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('all_admins'); }}
              >
                All Admin Users ({contacts?.all_admins?.length || 0})
              </Nav.Link>
              <Nav.Link 
                href="#" 
                className={activeTab === 'by_type' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('by_type'); }}
              >
                By Hospital Type
              </Nav.Link>
              <Nav.Link 
                href="#" 
                className={activeTab === 'by_region' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('by_region'); }}
              >
                By Region
              </Nav.Link>
            </Nav>

            {/* Region Filter for By Region tab */}
            {activeTab === 'by_region' && contacts?.by_region && (
              <div className="mb-4">
                <Form.Select 
                  value={selectedRegion} 
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-auto"
                >
                  <option value="all">All Regions</option>
                  {Object.keys(contacts.by_region).map(region => (
                    <option key={region} value={region}>
                      {region} ({contacts.by_region[region].length})
                    </option>
                  ))}
                </Form.Select>
              </div>
            )}

            {/* Active Tab Label */}
            <div className="main-label-group mb-3">
              <label>
                {activeTab === 'recently_active' && 'Recently Added Hospital Admin Users'}
                {activeTab === 'all_admins' && 'All Hospital Administrator Users'}
                {activeTab === 'by_type' && 'Hospital Administrators by Hospital Type'}
                {activeTab === 'by_region' && `Hospital Administrators ${selectedRegion === 'all' ? '(All Regions)' : `in ${selectedRegion}`}`}
              </label>
              <span className="text-secondary">({activeContacts?.length || 0} admin users)</span>
            </div>

            {/* Contacts Grid */}
            <Row className="g-2 g-xxl-3 mb-5">
              {activeContacts?.length > 0 ? (
                activeContacts.map((contact, index) => renderContactCard(contact, index))
              ) : (
                <Col xs="12">
                  <Card className="card-one">
                    <Card.Body className="text-center py-5">
                      <i className="ri-user-search-line fs-48 text-secondary mb-3"></i>
                      <h5 className="text-secondary">No contacts found</h5>
                      <p className="text-muted">
                        {searchTerm 
                          ? `No contacts match your search "${searchTerm}"`
                          : 'No contacts available in this category'
                        }
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </Col>

          {/* Sidebar */}
          <Col xl="4" xxl="3" className="d-none d-xl-block">
            <h5 className="section-title">Contact Management</h5>
            <p className="text-secondary fs-sm mb-4">Search and filter hospital administrators and healthcare stakeholders.</p>

            {/* Search */}
            <div className="form-search mb-4">
              <i className="ri-search-line"></i>
              <Form.Control 
                type="text" 
                placeholder="Search by name, email, or hospital"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <hr className="my-4 opacity-0" />

            {/* Hospital Types Summary */}
            <h5 className="section-title mb-4">Hospital Types</h5>
            <Nav className="nav-classic">
              {summary?.hospital_types && Object.entries(summary.hospital_types).map(([type, count]) => (
                <Nav.Link to="#" key={type}>
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)} Hospitals</span> 
                  <span className="badge">{count}</span>
                </Nav.Link>
              ))}
            </Nav>

            <hr className="my-4 opacity-0" />

            {/* Recent Activity */}
            <h5 className="section-title mb-4">Recent Verifications</h5>
            <ul className="people-group">
              {contacts?.recently_active?.slice(0, 5).map((contact, index) => {
                const contactName = contact.name || contact.user_name || 'Hospital Contact';
                const avatarColor = getAvatarColor(contactName);
                const avatarImg = createAvatarPlaceholder(contactName, avatarColor);
                
                return (
                  <li className="people-item" key={index}>
                    <Avatar img={avatarImg} />
                    <div className="people-body">
                      <h6><Link to="">{contactName}</Link></h6>
                      <span>{contact.position || 'Hospital Administrator'}</span>
                      <small className="text-success d-block">Recently verified</small>
                    </div>
                  </li>
                );
              })}
            </ul>

            <hr className="my-4 opacity-0" />

            {/* Communication Tools */}
            <h5 className="section-title">Communication Tools</h5>
            <p className="text-secondary fs-sm mb-4">Quick actions for managing hospital relationships.</p>

            <div className="d-grid gap-2">
              <Button variant="primary" size="sm">
                <i className="ri-mail-send-line me-2"></i>Broadcast Message
              </Button>
              <Button variant="outline-primary" size="sm">
                <i className="ri-calendar-event-line me-2"></i>Schedule Meeting
              </Button>
              <Button variant="outline-secondary" size="sm">
                <i className="ri-file-download-line me-2"></i>Export Contacts
              </Button>
            </div>
          </Col>
        </Row>

        <Footer />
      </div>

      {/* Message Modal */}
      <MessageModal
        show={showMessageModal}
        onHide={() => setShowMessageModal(false)}
        recipient={selectedRecipient}
      />
    </React.Fragment>
  );
}