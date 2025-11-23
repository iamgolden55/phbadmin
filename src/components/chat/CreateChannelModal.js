import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Badge } from 'react-bootstrap';
import { messagingAPI } from '../../config/api';

/**
 * Modal for creating new channels/groups
 * Supports different types: department, emergency, group, direct
 */
const CreateChannelModal = ({ show, onHide, onChannelCreated, currentUser }) => {
  const [channelData, setChannelData] = useState({
    title: '',
    description: '',
    conversation_type: 'group',
    priority_level: 'routine',
    department: '',
    is_private: false,
    hospital_context_id: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Settings, 3: Participants

  // Channel type configurations
  const channelTypes = {
    group: {
      name: 'Group Chat',
      icon: 'ri-group-line',
      description: 'General group conversation',
      color: 'primary'
    },
    department: {
      name: 'Department Channel',
      icon: 'ri-building-line',
      description: 'Department-specific discussions',
      color: 'info'
    },
    emergency: {
      name: 'Emergency Channel',
      icon: 'ri-alarm-line',
      description: 'Emergency response coordination',
      color: 'danger'
    },
    announcement: {
      name: 'Announcement Channel',
      icon: 'ri-megaphone-line',
      description: 'One-way announcements',
      color: 'warning'
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setChannelData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Validate channel data
  const validateChannelData = () => {
    if (!channelData.title.trim()) {
      setError('Channel title is required');
      return false;
    }

    if (channelData.title.length > 50) {
      setError('Channel title must be 50 characters or less');
      return false;
    }

    if (channelData.conversation_type === 'department' && !channelData.department.trim()) {
      setError('Department name is required for department channels');
      return false;
    }

    return true;
  };

  // Create the channel
  const handleCreateChannel = async () => {
    if (!validateChannelData()) return;

    setLoading(true);
    setError('');

    try {
      const conversationData = {
        title: channelData.title.trim(),
        conversation_type: channelData.conversation_type,
        priority_level: channelData.priority_level,
        department: channelData.department.trim(),
        hospital_context_id: channelData.hospital_context_id,
        participant_ids: [], // Start with just the creator
        initial_message: channelData.description ? `Channel created: ${channelData.description}` : null
      };

      console.log('Creating channel:', conversationData);
      
      const response = await messagingAPI.createConversation(conversationData);
      
      console.log('Channel created successfully:', response);
      
      if (onChannelCreated) {
        onChannelCreated(response);
      }
      
      handleClose();
      
    } catch (error) {
      console.error('Failed to create channel:', error);
      setError(error.message || 'Failed to create channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset and close modal
  const handleClose = () => {
    setChannelData({
      title: '',
      description: '',
      conversation_type: 'group',
      priority_level: 'routine',
      department: '',
      is_private: false,
      hospital_context_id: null
    });
    setStep(1);
    setError('');
    setLoading(false);
    onHide();
  };

  // Get current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            {/* Channel Type Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Channel Type</Form.Label>
              <div className="row g-2">
                {Object.entries(channelTypes).map(([type, config]) => (
                  <div key={type} className="col-6">
                    <div
                      className={`card h-100 cursor-pointer border-2 ${
                        channelData.conversation_type === type 
                          ? `border-${config.color} bg-${config.color} bg-opacity-10` 
                          : 'border-light'
                      }`}
                      onClick={() => handleInputChange('conversation_type', type)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <i className={`${config.icon} fs-2 text-${config.color} mb-2`}></i>
                        <h6 className="mb-1">{config.name}</h6>
                        <small className="text-muted">{config.description}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Channel Title */}
            <Form.Group className="mb-3">
              <Form.Label>
                Channel Title <span className="text-danger">*</span>
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className={channelTypes[channelData.conversation_type]?.icon || 'ri-hashtag'}></i>
                </span>
                <Form.Control
                  type="text"
                  placeholder="Enter channel title..."
                  value={channelData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={50}
                />
              </div>
              <Form.Text className="text-muted">
                {channelData.title.length}/50 characters
              </Form.Text>
            </Form.Group>

            {/* Department field for department channels */}
            {channelData.conversation_type === 'department' && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Department <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter department name..."
                  value={channelData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </Form.Group>
            )}

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe the purpose of this channel..."
                value={channelData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={200}
              />
              <Form.Text className="text-muted">
                {channelData.description.length}/200 characters
              </Form.Text>
            </Form.Group>
          </>
        );

      case 2:
        return (
          <>
            {/* Priority Level */}
            <Form.Group className="mb-3">
              <Form.Label>Priority Level</Form.Label>
              <Form.Select 
                value={channelData.priority_level}
                onChange={(e) => handleInputChange('priority_level', e.target.value)}
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </Form.Select>
              <Form.Text className="text-muted">
                {channelData.priority_level === 'emergency' && 
                  'Emergency channels will send push notifications to all members'}
                {channelData.priority_level === 'urgent' && 
                  'Urgent channels will highlight messages for faster attention'}
                {channelData.priority_level === 'routine' && 
                  'Standard priority for regular communication'}
              </Form.Text>
            </Form.Group>

            {/* Privacy Settings */}
            <Form.Group className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <Form.Label className="mb-1">Private Channel</Form.Label>
                  <div className="text-muted small">
                    Only invited members can see and join this channel
                  </div>
                </div>
                <Form.Check
                  type="switch"
                  checked={channelData.is_private}
                  onChange={(e) => handleInputChange('is_private', e.target.checked)}
                />
              </div>
            </Form.Group>

            {/* Channel Preview */}
            <div className="border rounded p-3 bg-light">
              <h6 className="mb-2">
                <i className="ri-eye-line me-2"></i>
                Channel Preview
              </h6>
              <div className="d-flex align-items-center">
                <div className="avatar me-3">
                  <span className={`avatar-initial bg-${channelTypes[channelData.conversation_type]?.color || 'primary'}`}>
                    <i className={channelTypes[channelData.conversation_type]?.icon || 'ri-hashtag'}></i>
                  </span>
                </div>
                <div className="flex-1">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">{channelData.title || 'Channel Title'}</h6>
                    {channelData.priority_level !== 'routine' && (
                      <Badge bg={channelData.priority_level === 'emergency' ? 'danger' : 'warning'}>
                        {channelData.priority_level}
                      </Badge>
                    )}
                    {channelData.is_private && (
                      <Badge bg="secondary">Private</Badge>
                    )}
                  </div>
                  <small className="text-muted">
                    {channelData.description || 'No description'}
                  </small>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="ri-add-circle-line me-2"></i>
          Create New Channel
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Step Indicator */}
        <div className="mb-4">
          <div className="d-flex align-items-center">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-title">Basic Info</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-title">Settings</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            {step > 1 && (
              <Button variant="outline-secondary" onClick={() => setStep(step - 1)}>
                <i className="ri-arrow-left-line me-2"></i>
                Back
              </Button>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            {step < 2 ? (
              <Button 
                variant="primary" 
                onClick={() => setStep(step + 1)}
                disabled={!channelData.title.trim() || (channelData.conversation_type === 'department' && !channelData.department.trim())}
              >
                Next
                <i className="ri-arrow-right-line ms-2"></i>
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleCreateChannel}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="ri-loader-line me-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="ri-add-line me-2"></i>
                    Create Channel
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>

      <style jsx>{`
        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        
        .step-indicator.active {
          opacity: 1;
        }
        
        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .step-indicator.active .step-number {
          background: #0d6efd;
          color: white;
        }
        
        .step-title {
          font-size: 0.8rem;
          text-align: center;
        }
        
        .step-connector {
          flex: 1;
          height: 2px;
          background: #e9ecef;
          margin: 0 20px;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Modal>
  );
};

export default CreateChannelModal;