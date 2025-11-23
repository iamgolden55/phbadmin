import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Signin() {
  const [email, setEmail] = useState("test1234@gmail.com");
  const [password, setPassword] = useState("test1234");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const result = await login({ email, password });
    
    if (result.success) {
      navigate("/dashboard/analytics");
    } else {
      setError(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header>
          <Link to="/" className="header-logo mb-4">PHB Admin</Link>
          <Card.Title>Platform Admin Sign In</Card.Title>
          <Card.Text>Welcome back! Please sign in to access the admin dashboard.</Card.Text>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <div className="mb-4">
              <Form.Label>Email address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Form.Label className="d-flex justify-content-between">
                Password 
                <Link to="/pages/forgot">Forgot password?</Link>
              </Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              variant="primary" 
              className="btn-sign"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            Admin access only. Contact system administrator for account access.
          </small>
        </Card.Footer>
      </Card>
    </div>
  )
}