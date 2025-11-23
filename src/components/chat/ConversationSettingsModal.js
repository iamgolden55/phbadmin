import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Badge, Tabs, Tab, Card, ListGroup } from 'react-bootstrap';
import { messagingAPI, platformAPI } from '../../config/api';
import Avatar from '../Avatar';

/**
 * Modal for managing conversation/channel settings, members, and permissions
 * Supports group chats, department channels, and emergency channels
 */
const ConversationSettingsModal = ({ show, onHide, conversation, currentUser, onConversationUpdated }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Conversation settings state
  const [conversationData, setConversationData] = useState({
    title: '',
    description: '',
    priority_level: 'routine',
    department: '',
    is_private: false
  });
  
  // Members state
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Permissions state
  const [permissions, setPermissions] = useState({
    can_add_members: true,
    can_remove_members: false,
    can_edit_info: false,
    can_pin_messages: false,
    can_delete_messages: false,
    admin_only_messaging: false
  });

  // Initialize data when conversation changes
  useEffect(() => {
    if (conversation && show) {
      setConversationData({
        title: conversation.title || '',
        description: conversation.description || '',
        priority_level: conversation.priority_level || 'routine',
        department: conversation.department || '',
        is_private: conversation.is_private || false
      });
      
      loadMembers();
      loadPermissions();
    }
  }, [conversation, show]);

  // Load conversation members
  const loadMembers = async () => {
    if (!conversation?.id) return;
    
    setLoadingMembers(true);
    try {
      // In a real app, you would have an API endpoint for conversation members
      // For now, we'll simulate with the conversation participants
      const mockMembers = [
        {
          id: currentUser?.id || 1,
          name: currentUser?.name || 'You',
          email: currentUser?.email || 'you@hospital.com',
          role: 'admin',
          avatar: currentUser?.avatar,
          joined_at: new Date().toISOString(),
          last_seen: 'now'
        }
      ];
      
      setMembers(mockMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
      setError('Failed to load conversation members');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Load conversation permissions
  const loadPermissions = async () => {
    if (!conversation?.id) return;
    
    try {
      // For now, set default permissions based on conversation type
      const defaultPermissions = {
        can_add_members: true,
        can_remove_members: conversation.conversation_type === 'emergency',
        can_edit_info: conversation.conversation_type !== 'announcement',
        can_pin_messages: true,
        can_delete_messages: conversation.conversation_type === 'emergency',
        admin_only_messaging: conversation.conversation_type === 'announcement'
      };
      
      setPermissions(defaultPermissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  // Handle conversation settings update
  const handleUpdateSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate settings
      if (!conversationData.title.trim()) {
        setError('Conversation title is required');
        return;
      }
      
      const updateData = {
        title: conversationData.title.trim(),
        description: conversationData.description.trim(),
        priority_level: conversationData.priority_level,
        department: conversationData.department.trim(),
        is_private: conversationData.is_private
      };
      
      console.log('Updating conversation settings:', updateData);
      
      // In a real app, you would call the API to update the conversation
      // const response = await messagingAPI.updateConversation(conversation.id, updateData);
      
      // Simulate API success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Conversation settings updated successfully');
      
      if (onConversationUpdated) {
        onConversationUpdated({
          ...conversation,
          ...updateData
        });
      }
      
    } catch (error) {
      console.error('Failed to update conversation:', error);
      setError('Failed to update conversation settings');
    } finally {
      setLoading(false);
    }
  };

  // Search for users to add as members
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const contactsResponse = await platformAPI.getContacts({ search: query });
      
      const users = [];
      
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

      const filteredUsers = users.filter(user => 
        !members.find(member => member.id === user.id) && // Exclude existing members
        (user.name?.toLowerCase().includes(query.toLowerCase()) ||
         user.email?.toLowerCase().includes(query.toLowerCase()))
      );

      setSearchResults(filteredUsers.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  // Add member to conversation
  const handleAddMember = async (user) => {
    try {
      console.log('Adding member to conversation:', user);
      
      // In a real app, you would call the API
      // await messagingAPI.addMemberToConversation(conversation.id, user.id);
      
      // Simulate adding the member
      const newMember = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'member',
        avatar: user.avatar,
        joined_at: new Date().toISOString(),
        last_seen: 'recently'
      };
      
      setMembers(prev => [...prev, newMember]);
      setMemberSearchQuery('');
      setSearchResults([]);
      setSuccess(`${user.name} added to conversation`);
      
    } catch (error) {
      console.error('Failed to add member:', error);
      setError('Failed to add member to conversation');
    }
  };

  // Remove member from conversation
  const handleRemoveMember = async (memberId) => {
    if (memberId === currentUser?.id) {
      setError('You cannot remove yourself from the conversation');
      return;
    }
    
    try {
      console.log('Removing member from conversation:', memberId);
      
      // In a real app, you would call the API
      // await messagingAPI.removeMemberFromConversation(conversation.id, memberId);
      
      setMembers(prev => prev.filter(member => member.id !== memberId));
      setSuccess('Member removed from conversation');
      
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError('Failed to remove member from conversation');
    }
  };

  // Update member role
  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      console.log('Updating member role:', { memberId, newRole });
      
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      
      setSuccess(`Member role updated to ${newRole}`);
      
    } catch (error) {
      console.error('Failed to update member role:', error);
      setError('Failed to update member role');
    }
  };

  // Handle modal close
  const handleClose = () => {
    setActiveTab('settings');
    setError('');
    setSuccess('');
    setMemberSearchQuery('');
    setSearchResults([]);
    onHide();
  };

  if (!conversation) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex align-items-center">
            <div className="avatar me-3">
              <span className="avatar-initial bg-primary">
                <i className="ri-settings-3-line"></i>
              </span>
            </div>
            <div>
              <h5 className="mb-0">{conversation.title}</h5>
              <small className="text-muted">
                {conversation.conversation_type} • {members.length} member{members.length !== 1 ? 's' : ''}
              </small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            {success}
          </Alert>
        )}

        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
          {/* Settings Tab */}
          <Tab eventKey="settings" title={<><i className="ri-settings-line me-2"></i>Settings</>}>
            <Form>
              {/* Conversation Title */}
              <Form.Group className="mb-3">
                <Form.Label>Conversation Title</Form.Label>
                <Form.Control
                  type="text"
                  value={conversationData.title}
                  onChange={(e) => setConversationData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter conversation title..."
                />
              </Form.Group>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={conversationData.description}
                  onChange={(e) => setConversationData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this conversation..."
                />
              </Form.Group>

              {/* Priority Level */}
              <Form.Group className="mb-3">
                <Form.Label>Priority Level</Form.Label>
                <Form.Select
                  value={conversationData.priority_level}
                  onChange={(e) => setConversationData(prev => ({ ...prev, priority_level: e.target.value }))}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </Form.Select>
              </Form.Group>

              {/* Department (if applicable) */}
              {conversation.conversation_type === 'department' && (
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={conversationData.department}
                    onChange={(e) => setConversationData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Department name..."
                  />
                </Form.Group>
              )}

              {/* Privacy Settings */}
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Private conversation (invite only)"
                  checked={conversationData.is_private}
                  onChange={(e) => setConversationData(prev => ({ ...prev, is_private: e.target.checked }))}
                />
              </Form.Group>

              <Button 
                variant="primary" 
                onClick={handleUpdateSettings}
                disabled={loading}
                className="w-100"
              >
                {loading ? 'Updating...' : 'Update Settings'}
              </Button>
            </Form>
          </Tab>

          {/* Members Tab */}
          <Tab eventKey="members" title={<><i className="ri-group-line me-2"></i>Members ({members.length})</>}>
            {/* Add Member Search */}
            <Card className="mb-3">
              <Card.Body>
                <h6 className="mb-3">Add Members</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Search people to add..."
                    value={memberSearchQuery}
                    onChange={(e) => {
                      setMemberSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                  />
                </Form.Group>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(user => (
                      <div key={user.id} className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                        <div className="d-flex align-items-center">
                          <Avatar img={user.avatar} size="sm" className="me-2" />
                          <div>
                            <h6 className="mb-0">{user.name}</h6>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                        <Button size="sm" variant="outline-primary" onClick={() => handleAddMember(user)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Current Members */}
            <h6 className="mb-3">Current Members</h6>
            {loadingMembers ? (
              <div className="text-center py-4">
                <i className="ri-loader-line me-2"></i>
                Loading members...
              </div>
            ) : (
              <ListGroup>
                {members.map(member => (
                  <ListGroup.Item key={member.id} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <Avatar img={member.avatar} className="me-3" />
                      <div>
                        <h6 className="mb-0">
                          {member.name}
                          {member.id === currentUser?.id && <small className="text-muted ms-2">(You)</small>}
                        </h6>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-muted">{member.email}</small>
                          <Badge bg={member.role === 'admin' ? 'primary' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </div>
                        <small className="text-muted">
                          Joined {new Date(member.joined_at).toLocaleDateString()} • Last seen {member.last_seen}
                        </small>
                      </div>
                    </div>
                    
                    {member.id !== currentUser?.id && (
                      <div className="d-flex gap-2">
                        <Form.Select
                          size="sm"
                          value={member.role}
                          onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                          style={{ width: '100px' }}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </Form.Select>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <i className="ri-user-unfollow-line"></i>
                        </Button>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Tab>

          {/* Permissions Tab */}
          <Tab eventKey="permissions" title={<><i className="ri-shield-user-line me-2"></i>Permissions</>}>
            <h6 className="mb-3">Member Permissions</h6>
            
            {Object.entries({
              can_add_members: 'Add new members',
              can_remove_members: 'Remove members',
              can_edit_info: 'Edit conversation info',
              can_pin_messages: 'Pin messages',
              can_delete_messages: 'Delete messages',
              admin_only_messaging: 'Only admins can send messages'
            }).map(([key, label]) => (
              <Form.Group key={key} className="mb-3">
                <Form.Check
                  type="switch"
                  label={label}
                  checked={permissions[key]}
                  onChange={(e) => setPermissions(prev => ({ ...prev, [key]: e.target.checked }))}
                />
              </Form.Group>
            ))}

            <Alert variant="info">
              <i className="ri-information-line me-2"></i>
              <strong>Note:</strong> Admins always have full permissions regardless of these settings.
            </Alert>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {activeTab === 'permissions' && (
          <Button variant="primary" disabled={loading}>
            Save Permissions
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ConversationSettingsModal;