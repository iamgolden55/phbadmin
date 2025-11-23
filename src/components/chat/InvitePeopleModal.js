import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { platformAPI } from '../../config/api';
import Avatar from '../Avatar';

/**
 * Modal for inviting people to conversations/channels
 * Supports searching users and hospital admins
 */
const InvitePeopleModal = ({ show, onHide, conversation, onPeopleInvited }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Search for users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Search in platform contacts (hospital admins)
      const contactsResponse = await platformAPI.getContacts({ search: query });
      
      // Transform contacts data to user format
      const users = [];
      
      // Add recently active contacts
      if (contactsResponse.contacts?.recently_active) {
        contactsResponse.contacts.recently_active.forEach(contact => {
          users.push({
            id: contact.user_id || contact.id,
            name: contact.user_name || contact.name,
            email: contact.user_email || contact.email,
            hospital_name: contact.hospital_name,
            position: contact.position || 'Hospital Admin',
            avatar: contact.avatar,
            type: 'hospital_admin'
          });
        });
      }

      // Add hospital type contacts
      if (contactsResponse.contacts?.by_hospital_type) {
        Object.values(contactsResponse.contacts.by_hospital_type).forEach(hospitalTypeUsers => {
          hospitalTypeUsers.forEach(contact => {
            // Avoid duplicates
            if (!users.find(u => u.id === (contact.user_id || contact.id))) {
              users.push({
                id: contact.user_id || contact.id,
                name: contact.user_name || contact.name,
                email: contact.user_email || contact.email,
                hospital_name: contact.hospital_name,
                position: contact.position || 'Hospital Admin',
                avatar: contact.avatar,
                type: 'hospital_admin'
              });
            }
          });
        });
      }

      // Filter by search query
      const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase()) ||
        user.hospital_name?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filteredUsers.slice(0, 10)); // Limit to 10 results
      
    } catch (error) {
      console.error('Failed to search users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Toggle user selection
  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Remove selected user
  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Send invitations
  const handleSendInvitations = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    setError('');

    try {
      // In a real app, you would add users to the conversation
      // For now, we'll simulate the invitation process
      console.log('Inviting users to conversation:', {
        conversation_id: conversation?.id,
        users: selectedUsers
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onPeopleInvited) {
        onPeopleInvited(selectedUsers, conversation);
      }

      handleClose();
      
    } catch (error) {
      console.error('Failed to invite people:', error);
      setError('Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset and close modal
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setError('');
    setLoading(false);
    setSearching(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="ri-user-add-line me-2"></i>
          Invite People to {conversation?.title || 'Conversation'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Search Input */}
        <Form.Group className="mb-3">
          <Form.Label>Search People</Form.Label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="ri-search-line"></i>
            </span>
            <Form.Control
              type="text"
              placeholder="Search by name, email, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searching && (
              <span className="input-group-text">
                <Spinner animation="border" size="sm" />
              </span>
            )}
          </div>
        </Form.Group>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mb-3">
            <Form.Label>Selected People ({selectedUsers.length})</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div key={user.id} className="d-flex align-items-center bg-primary bg-opacity-10 rounded px-2 py-1">
                  <Avatar img={user.avatar} size="sm" className="me-2" />
                  <span className="me-2">{user.name}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger p-0"
                    style={{ width: '20px', height: '20px' }}
                    onClick={() => removeSelectedUser(user.id)}
                  >
                    <i className="ri-close-line" style={{ fontSize: '12px' }}></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="search-results" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {searchQuery && !searching && searchResults.length === 0 && (
            <div className="text-center py-4 text-muted">
              <i className="ri-user-search-line fs-2 mb-2"></i>
              <p>No people found for "{searchQuery}"</p>
              <small>Try searching by name, email, or hospital name</small>
            </div>
          )}

          {searchResults.map(user => {
            const isSelected = selectedUsers.find(u => u.id === user.id);
            return (
              <div
                key={user.id}
                className={`d-flex align-items-center p-3 border rounded mb-2 cursor-pointer ${
                  isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                }`}
                onClick={() => toggleUserSelection(user)}
                style={{ cursor: 'pointer' }}
              >
                <Avatar img={user.avatar} status="offline" className="me-3" />
                <div className="flex-1">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">{user.name}</h6>
                    <Badge bg="info" className="small">{user.type === 'hospital_admin' ? 'Admin' : 'User'}</Badge>
                    {isSelected && (
                      <Badge bg="success">
                        <i className="ri-check-line"></i> Selected
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted small">
                    <i className="ri-mail-line me-1"></i>
                    {user.email}
                  </div>
                  {user.hospital_name && (
                    <div className="text-muted small">
                      <i className="ri-building-line me-1"></i>
                      {user.hospital_name} • {user.position}
                    </div>
                  )}
                </div>
                <div className="text-end">
                  {isSelected ? (
                    <i className="ri-checkbox-circle-fill text-primary fs-4"></i>
                  ) : (
                    <i className="ri-checkbox-blank-circle-line text-muted fs-4"></i>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Invite Suggestions */}
        {!searchQuery && (
          <div className="mt-3">
            <Form.Label>Quick Suggestions</Form.Label>
            <div className="row g-2">
              <div className="col-6">
                <div className="card text-center p-3">
                  <i className="ri-stethoscope-line fs-2 text-primary mb-2"></i>
                  <h6>Medical Staff</h6>
                  <small className="text-muted">Doctors & Nurses</small>
                </div>
              </div>
              <div className="col-6">
                <div className="card text-center p-3">
                  <i className="ri-user-settings-line fs-2 text-info mb-2"></i>
                  <h6>Hospital Admins</h6>
                  <small className="text-muted">Administrative Staff</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSendInvitations}
          disabled={selectedUsers.length === 0 || loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Sending Invitations...
            </>
          ) : (
            <>
              <i className="ri-send-plane-line me-2"></i>
              Invite {selectedUsers.length} {selectedUsers.length === 1 ? 'Person' : 'People'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvitePeopleModal;