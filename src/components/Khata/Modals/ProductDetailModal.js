// components/Khata/Modals/PersonDetailModal.js
import React from 'react';
import { Modal, Button, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaRupeeSign, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHistory } from 'react-icons/fa';

const PersonDetailModal = ({ show, onHide, person, sales, purchases, onEdit, onDelete }) => {
  if (!person) return null;

  // Get person's transaction history
  const personSales = sales.filter(sale => sale.personId === person.id);
  const personPurchases = purchases.filter(purchase => purchase.personId === person.id);
  const allTransactions = [
    ...personSales.map(s => ({ ...s, type: 'sale' })),
    ...personPurchases.map(p => ({ ...p, type: 'purchase' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalSales = personSales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0);
  const totalPurchases = personPurchases.reduce((sum, purchase) => sum + (purchase.finalAmount || 0), 0);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaHistory className="me-2" />
          Person Details - {person.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Personal Information */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Personal Information</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Name:</strong> {person.name}
                </div>
                <div className="mb-3">
                  <strong>Type:</strong> 
                  <Badge bg={person.type === 'customer' ? 'success' : 'warning'} className="ms-2">
                    {person.type}
                  </Badge>
                </div>
                {person.phone && (
                  <div className="mb-3">
                    <FaPhone className="me-2 text-muted" />
                    <strong>Phone:</strong> {person.phone}
                  </div>
                )}
                {person.email && (
                  <div className="mb-3">
                    <FaEnvelope className="me-2 text-muted" />
                    <strong>Email:</strong> {person.email}
                  </div>
                )}
                {person.address && (
                  <div className="mb-3">
                    <FaMapMarkerAlt className="me-2 text-muted" />
                    <strong>Address:</strong> {person.address}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Financial Summary</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Current Balance:</strong>
                  <div className={`fs-4 fw-bold ${person.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    <FaRupeeSign className="me-1" />
                    {person.balance}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Bar Dana:</strong>
                  <div className="text-warning fw-bold fs-5">
                    <FaRupeeSign className="me-1" />
                    {person.barDana}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Total Sales:</strong>
                  <div className="text-success fw-bold">
                    <FaRupeeSign className="me-1" />
                    {totalSales}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Total Purchases:</strong>
                  <div className="text-info fw-bold">
                    <FaRupeeSign className="me-1" />
                    {totalPurchases}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Transaction History */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">Transaction History</h6>
          </Card.Header>
          <Card.Body>
            {allTransactions.length === 0 ? (
              <div className="text-center py-4">
                <FaHistory className="display-4 text-muted mb-3" />
                <h5 className="text-muted">No Transactions</h5>
                <p className="text-muted">This person has no transaction history yet</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Bar Dana</th>
                      <th>Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.slice(0, 10).map((transaction, idx) => (
                      <tr key={idx}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={transaction.type === 'sale' ? 'success' : 'info'}>
                            {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                          </Badge>
                        </td>
                        <td className="fw-bold">
                          <FaRupeeSign className="me-1" />
                          {transaction.finalAmount}
                        </td>
                        <td>
                          {transaction.barDanaProvided ? (
                            <Badge bg="warning">
                              <FaRupeeSign className="me-1" />
                              {transaction.barDanaAmount}
                            </Badge>
                          ) : 'None'}
                        </td>
                        <td>{transaction.items?.length || 0} items</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={onDelete}>
          <FaTrash className="me-2" />
          Delete
        </Button>
        <Button variant="outline-primary" onClick={onEdit}>
          <FaEdit className="me-2" />
          Edit
        </Button>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PersonDetailModal;