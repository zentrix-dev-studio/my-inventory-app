import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalForm = ({ show, handleClose, handleSave, product }) => {
  const [formData, setFormData] = useState({ name: "", price: "", quantity: "" });

  useEffect(() => {
    if (product) setFormData(product);
    else setFormData({ name: "", price: "", quantity: "" });
  }, [product]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    handleSave({ ...formData, price: Number(formData.price), quantity: Number(formData.quantity) });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{product ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button type="submit" variant="primary">{product ? "Update" : "Add"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalForm;
