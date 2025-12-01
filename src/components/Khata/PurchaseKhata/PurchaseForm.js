// components/Khata/PurchaseKhata/PurchaseForm.js
import React from 'react';
import { Card, Alert } from 'react-bootstrap';

const PurchaseForm = ({ selectedPerson, products }) => {
  return (
    <Card>
      <Card.Body>
        <h5>Purchase Form for {selectedPerson.name}</h5>
        <Alert variant="info">
          Purchase form will be implemented here with product selection, quantity, rate, etc.
        </Alert>
        <p>Available Products: {products.length}</p>
      </Card.Body>
    </Card>
  );
};

export default PurchaseForm;