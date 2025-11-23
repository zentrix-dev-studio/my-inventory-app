import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../services/productService";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({ name: "", price: "", quantity: "" });

  useEffect(() => {
    const existingProduct = getProductById(id);
    if (existingProduct) setProduct(existingProduct);
  }, [id]);

  const handleChange = e => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    updateProduct(id, { ...product, price: Number(product.price), quantity: Number(product.quantity) });
    navigate("/products");
  };

  return (
    <div>
      <h2>Edit Product</h2>
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
        <button type="submit" className="btn btn-primary">Update Product</button>
      </form>
    </div>
  );
};

export default EditProduct;
