import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { messagingAPI } from '../config/api';

const MessageModal = ({ show, onHide, recipient }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('routine');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Message content is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const title = subject.trim() || `Message to ${recipient?.name || 'Hospital Admin'}`;
      
      await messagingAPI.sendQuickMessage(
        recipient?.id,
        message.trim(),
        title
      );
      
      setSuccess('Message sent successfully!');
      setMessage('');
      setSubject('');
      setPriority('routine');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        onHide();
        setSuccess('');
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setSubject('');
    setPriority('routine');
    setError('');
    setSuccess('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="ri-mail-line me-2"></i>
          Send Message to {recipient?.name || 'Hospital Admin'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSendMessage}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Recipient Info */}
          {recipient && (
            <div className="mb-3 p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm me-3">
                  <span className="avatar-initial bg-primary text-white rounded-circle">
                    {recipient.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h6 className="mb-1">{recipient.name}</h6>
                  <small className="text-muted">
                    {recipient.hospital_name} • {recipient.email}
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Subject */}
          <Form.Group className="mb-3">
            <Form.Label>Subject (Optional)</Form.Label>
            <Form.Control
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject..."
              maxLength={100}
            />
            <Form.Text className="text-muted">
              Leave blank for a default subject
            </Form.Text>
          </Form.Group>

          {/* Priority */}
          <Form.Group className="mb-3">
            <Form.Label>Priority Level</Form.Label>
            <Form.Select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </Form.Select>
          </Form.Group>

          {/* Message Content */}
          <Form.Group className="mb-3">
            <Form.Label>Message <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              required
              maxLength={2000}
            />
            <Form.Text className="text-muted">
              {message.length}/2000 characters
            </Form.Text>
          </Form.Group>

          {/* Quick Actions */}
          <div className="mb-3">
            <small className="text-muted">Quick Actions:</small>
            <div className="mt-2">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2 mb-2"
                onClick={() => setMessage('Hello! I hope this message finds you well. I wanted to reach out regarding...')}
              >
                Professional Greeting
              </Button>
              <Button
                variant="outline-warning"
                size="sm"
                className="me-2 mb-2"
                onClick={() => {
                  setMessage('This is an urgent matter that requires your immediate attention. Please respond as soon as possible.');
                  setPriority('urgent');
                }}
              >
                Urgent Request
              </Button>
              <Button
                variant="outline-info"
                size="sm"
                className="me-2 mb-2"
                onClick={() => setMessage('I would like to schedule a meeting to discuss important matters. Please let me know your availability.')}
              >
                Meeting Request
              </Button>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Sending...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line me-2"></i>
                Send Message
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MessageModal;