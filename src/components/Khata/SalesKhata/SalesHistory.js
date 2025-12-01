// components/Khata/SalesKhata/SalesHistory.js
import React from 'react';
import { Card, Table } from 'react-bootstrap';

const SalesHistory = ({ sales }) => {
  return (
    <Card>
      <Card.Body>
        <h5>Sales History</h5>
        {sales.length === 0 ? (
          <p className="text-muted">No sales recorded yet.</p>
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
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                  <td>₹{sale.finalAmount}</td>
                  <td>{sale.items?.length || 0} items</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default SalesHistory;