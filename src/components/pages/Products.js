import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Table, Toast, ToastContainer } from "react-bootstrap";

const MAN_WEIGHT = 40;  // Weight of one man in kg

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantForm, setVariantForm] = useState({
    variantName: "",
    man: 0,
    kg: 0,
    stock: 0,  // Total stock in kg
    unit: "",
    price: 0,
    sales: 0,
  });
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const saveProducts = (updatedProducts, toastMsg = "") => {
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    if (toastMsg) {
      setToastMessage(toastMsg);
      setShowToast(true);
    }
  };

  const handleSaveProduct = (product) => {
    let updatedProducts;
    if (product.id) {
      updatedProducts = products.map((p) =>
        p.id === product.id ? { ...p, name: product.name, category: product.category } : p
      );
      saveProducts(updatedProducts, "Product updated");
    } else {
      product.id = Date.now();
      product.variants = [];
      updatedProducts = [...products, product];
      saveProducts(updatedProducts, "Product added");
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter((p) => p.id !== id);
      saveProducts(updated, "Product deleted");
      setSelectedProduct(null);
    }
  };

  const handleOpenVariantForm = (product, variant = null, index = null) => {
    setSelectedProduct(product);
    if (variant) {
      setVariantForm(variant);
      setEditingVariantIndex(index);
    } else {
      setVariantForm({
        variantName: "",
        man: 0,
        kg: 0,
        stock: 0,
        unit: "",
        price: 0,
        sales: 0,
      });
      setEditingVariantIndex(null);
    }
    setShowVariantForm(true);
  };

  // Function to handle the variant save and update
  const handleSaveVariant = (e) => {
    e.preventDefault();

    // Recalculate total stock (Total KG) based on the "man" and "kg" values
    const totalKG = variantForm.man * MAN_WEIGHT + variantForm.kg;

    const updatedProduct = { ...selectedProduct };
    const newVariant = {
      ...variantForm,
      stock: totalKG,
      unit: `${variantForm.man} Man + ${variantForm.kg} Kg`, // Unit format
    };

    if (editingVariantIndex !== null) {
      // If editing an existing variant, update it
      updatedProduct.variants[editingVariantIndex] = newVariant;
      setToastMessage("Variant updated");
    } else {
      // If adding a new variant, push it into the variants array
      updatedProduct.variants.push(newVariant);
      setToastMessage("Variant added");
    }

    // Update the products array in the state
    const updatedProducts = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    saveProducts(updatedProducts);
    setSelectedProduct(updatedProduct);
    setShowVariantForm(false);
    setShowToast(true);
  };

const handleDeleteVariant = (idx) => {
  if (!selectedProduct || !selectedProduct.variants || selectedProduct.variants.length === 0) {
    // Early exit if there are no variants or no selected product
    alert("No variants found to delete.");
    return;
  }

  if (window.confirm("Are you sure you want to delete this variant?")) {
    const updatedProduct = { ...selectedProduct };

    // Make sure the variant exists before calling splice
    if (updatedProduct.variants && updatedProduct.variants[idx]) {
      updatedProduct.variants.splice(idx, 1);  // Remove the variant at the given index

      const updatedProducts = products.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      );
      saveProducts(updatedProducts, "Variant deleted");
      setSelectedProduct(updatedProduct);
    } else {
      alert("Variant not found.");
    }
  }
};


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Products</h2>
        <Button variant="success" onClick={() => { setSelectedProduct(null); setShowProductModal(true); }}>Add Product</Button>
      </div>

      <div className="row">
        {products.length === 0 && <p>No products available.</p>}
        {products.map((p) => (
          <div className="col-md-12 mb-3" key={p.id}>
            <Card>
              <Card.Body>
                <Card.Title>{p.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{p.category}</Card.Subtitle>
                <Button variant="primary" size="sm" onClick={() => setShowProductModal(true) || setSelectedProduct(p)}>Edit Product</Button>{" "}
                <Button variant="warning" size="sm" onClick={() => handleOpenVariantForm(p)}>Add Variant</Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(p.id)}>Delete Product</Button>

                {p.variants.length > 0 && (
                  <Table striped bordered hover className="mt-3">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Man</th>
                        <th>Kg</th>
                        <th>Total KG</th>
                        <th>Price</th>
                        <th>Sales</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.variants.map((v, idx) => (
                        <tr key={idx}>
                          <td>{v.variantName}</td>
                          <td>{v.man}</td>
                          <td>{v.kg}</td>
                          <td>{v.stock}</td>
                          <td>${v.price}</td>
                          <td>{v.sales || 0}</td>
                          <td>
                            <Button size="sm" variant="primary" onClick={() => handleOpenVariantForm(p, v, idx)}>Edit</Button>{" "}
                            <Button size="sm" variant="danger" onClick={() => handleDeleteVariant(idx)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm product={selectedProduct} onSave={handleSaveProduct} />
        </Modal.Body>
      </Modal>

      {/* Variant Modal */}
      <Modal show={showVariantForm} onHide={() => setShowVariantForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingVariantIndex !== null ? "Edit Variant" : `Add Variant for ${selectedProduct?.name}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveVariant}>
            <Form.Group className="mb-2">
              <Form.Label>Variant Name</Form.Label>
              <Form.Control
                value={variantForm.variantName}
                onChange={(e) => setVariantForm({ ...variantForm, variantName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Man</Form.Label>
              <Form.Control
                type="number"
                value={variantForm.man}
                onChange={(e) => setVariantForm({ ...variantForm, man: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Kg</Form.Label>
              <Form.Control
                type="number"
                value={variantForm.kg}
                onChange={(e) => setVariantForm({ ...variantForm, kg: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={variantForm.price}
                onChange={(e) => setVariantForm({ ...variantForm, price: Number(e.target.value) })}
                required
              />
            </Form.Group>
            <Button variant="success" type="submit">
              {editingVariantIndex !== null ? "Update Variant" : "Add Variant"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="success">
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

const ProductForm = ({ product, onSave }) => {
  const [form, setForm] = useState(product || { name: "", category: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2">
        <Form.Label>Name</Form.Label>
        <Form.Control name="name" value={form.name} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Category</Form.Label>
        <Form.Control name="category" value={form.category} onChange={handleChange} required />
      </Form.Group>

      <Button variant="success" type="submit">{product ? "Update Product" : "Add Product"}</Button>
    </Form>
  );
};

export default Products;
