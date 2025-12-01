// components/Khata/Modals/PersonModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const PersonModal = ({ show, onHide, onAddPerson, onUpdatePerson, editingPerson }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer',
    phone: '',
    email: '',
    address: '',
    balance: 0,
    barDana: 0
  });

  useEffect(() => {
    if (editingPerson) {
      setFormData(editingPerson);
    } else {
      setFormData({
        name: '',
        type: 'customer',
        phone: '',
        email: '',
        address: '',
        balance: 0,
        barDana: 0
      });
    }
  }, [editingPerson, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPerson) {
      onUpdatePerson(formData);
    } else {
      onAddPerson(formData);
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editingPerson ? 'Edit Person' : 'Add New Person'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type *</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="person@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Enter complete address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Initial Balance</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Bar Dana Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.barDana}
                  onChange={(e) => setFormData({...formData, barDana: parseFloat(e.target.value) || 0})}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit">
            {editingPerson ? 'Update Person' : 'Add Person'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PersonModal;