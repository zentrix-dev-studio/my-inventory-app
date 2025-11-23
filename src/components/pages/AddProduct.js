import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/productService";

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({ name: "", price: "", quantity: "" });

  const handleChange = e => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    addProduct({ ...product, price: Number(product.price), quantity: Number(product.quantity) });
    navigate("/products");
  };

  return (
    <div>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input type="text" className="form-control" name="name" value={product.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Price</label>
          <input type="number" className="form-control" name="price" value={product.price} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Quantity</label>
          <input type="number" className="form-control" name="quantity" value={product.quantity} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-success">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
