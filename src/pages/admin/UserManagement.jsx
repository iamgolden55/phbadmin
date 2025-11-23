import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import userManagementService from '../../services/userManagementService';
import { useAuth } from '../../hooks/useAuth';

export default function UserManagement() {
  const { hasPermission } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form data
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role_id: '',
  });
  const [newRoleId, setNewRoleId] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        userManagementService.users.listAdminUsers(),
        userManagementService.users.listRoles(),
      ]);
      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('manage_users')) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create user
  const handleCreateUser = async () => {
    try {
      const response = await userManagementService.users.createAdminUser(newUser);
      setSuccess(`User created successfully. Temporary password: ${response.temporary_password}`);
      setCreateUserOpen(false);
      setNewUser({ email: '', first_name: '', last_name: '', role_id: '' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  // Update role
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRoleId) return;

    try {
      await userManagementService.users.updateUserRole(selectedUser.id, newRoleId);
      setSuccess('User role updated successfully');
      setEditRoleOpen(false);
      setSelectedUser(null);
      setNewRoleId('');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update role');
    }
  };

  // Deactivate user
  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await userManagementService.users.deactivateUser(userId);
      setSuccess('User deactivated successfully');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to deactivate user');
    }
  };

  // Reactivate user
  const handleReactivate = async (userId) => {
    try {
      await userManagementService.users.reactivateUser(userId);
      setSuccess('User reactivated successfully');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to reactivate user');
    }
  };

  // Open edit role dialog
  const openEditRole = (user) => {
    setSelectedUser(user);
    setNewRoleId(user.role?.id || '');
    setEditRoleOpen(true);
  };

  // Check permission
  if (!hasPermission('manage_users')) {
    return (
      <React.Fragment>
        <HeaderMobile />
        <div className="main p-4 p-lg-5">
          <div className="alert alert-danger">
            <h5 className="alert-heading">Access Denied</h5>
            <p>You do not have permission to manage users.</p>
            <p className="mb-0">Required permission: <code>manage_users</code></p>
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
          <li className="breadcrumb-item"><Link to="/admin/users">Admin</Link></li>
          <li className="breadcrumb-item active" aria-current="page">User Management</li>
        </ol>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="main-title mb-0">User Management</h2>
          <Button
            variant="primary"
            onClick={() => setCreateUserOpen(true)}
          >
            <i className="ri-add-line me-1"></i> Create Admin User
          </Button>
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

        {/* Users Table */}
        <Card className="card-one">
          <Card.Header>
            <Card.Title as="h6">Admin Users</Card.Title>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="table-agent mb-0" hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No admin users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.first_name} {user.last_name}</strong>
                          {user.is_superuser && (
                            <Badge bg="primary" className="ms-2">Superuser</Badge>
                          )}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          {user.role ? (
                            <Badge bg="secondary" className="text-uppercase">
                              {user.role.name}
                            </Badge>
                          ) : (
                            <Badge bg="warning">No Role</Badge>
                          )}
                        </td>
                        <td>
                          <Badge bg={user.is_active ? 'success' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          {user.last_login
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="text-end">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 me-3"
                            onClick={() => openEditRole(user)}
                            title="Change Role"
                          >
                            <i className="ri-edit-line"></i>
                          </Button>
                          {user.is_active ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-danger"
                              onClick={() => handleDeactivate(user.id)}
                              title="Deactivate"
                            >
                              <i className="ri-shield-cross-line"></i>
                            </Button>
                          ) : (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-success"
                              onClick={() => handleReactivate(user.id)}
                              title="Reactivate"
                            >
                              <i className="ri-shield-check-line"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Create User Modal */}
        <Modal show={createUserOpen} onHide={() => setCreateUserOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create Admin User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role *</Form.Label>
              <Form.Select
                value={newUser.role_id}
                onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateUser}>
              Create User
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Role Modal */}
        <Modal show={editRoleOpen} onHide={() => setEditRoleOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Change User Role</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              User: <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>
            </p>
            <Form.Group>
              <Form.Label>New Role</Form.Label>
              <Form.Select
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateRole}>
              Update Role
            </Button>
          </Modal.Footer>
        </Modal>

        <Footer />
      </div>
    </React.Fragment>
  );
}
