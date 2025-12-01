// components/Khata/PurchaseKhata/PurchaseHistory.js
import React from 'react';
import { Card, Table } from 'react-bootstrap';

const PurchaseHistory = ({ purchases }) => {
  return (
    <Card>
      <Card.Body>
        <h5>Purchase History</h5>
        {purchases.length === 0 ? (
          <p className="text-muted">No purchases recorded yet.</p>
        ) : (
          <Table striped>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase.id}>
                  <td>{new Date(purchase.date).toLocaleDateString()}</td>
                  <td>₹{purchase.finalAmount}</td>
                  <td>{purchase.items?.length || 0} items</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default PurchaseHistory;