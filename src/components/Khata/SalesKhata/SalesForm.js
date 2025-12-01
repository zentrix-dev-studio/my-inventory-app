// components/Khata/SalesKhata/SalesForm.js
import React from 'react';
import { Card, Alert } from 'react-bootstrap';

const SalesForm = ({ selectedPerson, products }) => {
  return (
    <Card>
      <Card.Body>
        <h5>Sales Form for {selectedPerson.name}</h5>
        <Alert variant="info">
          Sales form will be implemented here with product selection, quantity, rate, etc.
        </Alert>
        <p>Available Products: {products.length}</p>
      </Card.Body>
    </Card>
  );
};

export default SalesForm;