// components/Khata/PurchaseKhata/PurchaseKhata.js
import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { FaTruck, FaHistory, FaRupeeSign } from 'react-icons/fa';

// Import child components
import PurchaseForm from './PurchaseForm';
import PurchaseHistory from './PurchaseHistory';

const PurchaseKhata = ({ 
  selectedPerson, 
  persons, 
  products, 
  purchases, 
  onSavePurchases, 
  onSavePersons,
  updateProductStock 
}) => {
  const [activeView, setActiveView] = useState('new'); // 'new' or 'history'

  // Filter purchases for current person
  const personPurchases = purchases.filter(purchase => purchase.personId === selectedPerson.id);

  return (
    <div>
      {/* View Toggle */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex gap-2">
            <Button
              variant={activeView === 'new' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveView('new')}
              className="d-flex align-items-center"
            >
              <FaTruck className="me-2" />
              New Purchase
            </Button>
            <Button
              variant={activeView === 'history' ? 'info' : 'outline-info'}
              onClick={() => setActiveView('history')}
              className="d-flex align-items-center"
            >
              <FaHistory className="me-2" />
              Purchase History ({personPurchases.length})
            </Button>
          </div>
        </Col>
      </Row>

      {/* Content based on active view */}
      {activeView === 'new' ? (
        <PurchaseForm
          selectedPerson={selectedPerson}
          products={products}
          onSavePurchases={onSavePurchases}
          onSavePersons={onSavePersons}
          existingPurchases={purchases}
          updateProductStock={updateProductStock}
        />
      ) : (
        <PurchaseHistory 
          purchases={personPurchases}
          selectedPerson={selectedPerson}
        />
      )}

      {/* Quick Stats */}
      <Row className="mt-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">
                <FaRupeeSign />
                {personPurchases.reduce((total, purchase) => total + (purchase.finalAmount || 0), 0)}
              </h4>
              <small className="text-muted">Total Purchases</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{personPurchases.length}</h4>
              <small className="text-muted">Total Transactions</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">
                <FaRupeeSign />
                {selectedPerson.barDana}
              </h4>
              <small className="text-muted">Current Bar Dana</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PurchaseKhata;