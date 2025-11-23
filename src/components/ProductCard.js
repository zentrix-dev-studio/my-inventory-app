import React from "react";

const ProductCard = ({ product, onDelete, onEdit }) => {
  return (
    <div className="card product-card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text"><strong>Price:</strong> ${product.price}</p>
        <p className="card-text"><strong>Quantity:</strong> {product.quantity}</p>
        <div className="mt-auto d-flex justify-content-between">
          <button className="btn btn-primary btn-sm" onClick={onEdit}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(product.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
