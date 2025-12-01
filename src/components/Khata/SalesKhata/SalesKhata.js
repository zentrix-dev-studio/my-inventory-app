// components/Khata/SalesKhata/SalesKhata.js
import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { FaShoppingCart, FaHistory, FaRupeeSign } from 'react-icons/fa';

// Import child components
import SalesForm from './SalesForm';
import SalesHistory from './SalesHistory';

const SalesKhata = ({ 
  selectedPerson, 
  persons, 
  products, 
  sales, 
  onSaveSales, 
  onSavePersons,
  updateProductStock 
}) => {
  const [activeView, setActiveView] = useState('new'); // 'new' or 'history'

  // Filter sales for current person
  const personSales = sales.filter(sale => sale.personId === selectedPerson.id);

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
              <FaShoppingCart className="me-2" />
              New Sale
            </Button>
            <Button
              variant={activeView === 'history' ? 'info' : 'outline-info'}
              onClick={() => setActiveView('history')}
              className="d-flex align-items-center"
            >
              <FaHistory className="me-2" />
              Sales History ({personSales.length})
            </Button>
          </div>
        </Col>
      </Row>

      {/* Content based on active view */}
      {activeView === 'new' ? (
        <SalesForm
          selectedPerson={selectedPerson}
          products={products}
          onSaveSales={onSaveSales}
          onSavePersons={onSavePersons}
          existingSales={sales}
          updateProductStock={updateProductStock}
        />
      ) : (
        <SalesHistory 
          sales={personSales}
          selectedPerson={selectedPerson}
        />
      )}

      {/* Quick Stats */}
      <Row className="mt-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">
                <FaRupeeSign />
                {personSales.reduce((total, sale) => total + (sale.finalAmount || 0), 0)}
              </h4>
              <small className="text-muted">Total Sales</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{personSales.length}</h4>
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

export default SalesKhata;