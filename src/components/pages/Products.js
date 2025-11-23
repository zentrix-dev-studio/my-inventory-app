import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Table, Toast, ToastContainer, Badge, Row, Col } from "react-bootstrap";

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
    pricePerMan: 0,  // Price per man in PKR
    pricePerKg: 0,   // Price per kg in PKR
    sales: 0,
  });
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState("success");
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  // New state for confirmation modals
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState({ product: null, index: null });

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
    checkLowStock(storedProducts);
  }, []);

  const checkLowStock = (productList) => {
    const lowStock = productList.filter(p => 
      p.variants && p.variants.some(v => v.stock < 10)
    ).map(p => p.id);
    setLowStockProducts(lowStock);

    // Show alert for low stock products
    productList.forEach(p => {
      p.variants && p.variants.forEach(v => {
        if (v.stock < 10) {
          showToastMessage(`Low stock alert: ${p.name} - ${v.variantName} (${v.stock} kg remaining)`, "danger");
        }
      });
    });
  };

  const saveProducts = (updatedProducts, toastMsg = "", variant = "success") => {
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    checkLowStock(updatedProducts);
    
    if (toastMsg) {
      setToastMessage(toastMsg);
      setToastVariant(variant);
      setShowToast(true);
    }
  };

  const showToastMessage = (msg, variant = "success") => {
    setToastMessage(msg);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSaveProduct = (product) => {
    let updatedProducts;
    if (product.id) {
      updatedProducts = products.map((p) =>
        p.id === product.id ? { ...p, name: product.name, category: product.category } : p
      );
      saveProducts(updatedProducts, "Product updated successfully");
    } else {
      product.id = Date.now();
      product.variants = [];
      updatedProducts = [...products, product];
      saveProducts(updatedProducts, "Product added successfully");
    }
    setShowProductModal(false);
  };

  // Open delete product confirmation modal
  const handleDeleteProductClick = (product) => {
    setProductToDelete(product);
    setShowDeleteProductModal(true);
  };

  // Confirm product deletion
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      const updated = products.filter((p) => p.id !== productToDelete.id);
      saveProducts(updated, "Product deleted successfully");
      setSelectedProduct(null);
    }
    setShowDeleteProductModal(false);
    setProductToDelete(null);
  };

  // Open delete variant confirmation modal
  const handleDeleteVariantClick = (product, index) => {
    setVariantToDelete({ product, index });
    setShowDeleteVariantModal(true);
  };

  // Confirm variant deletion
  const confirmDeleteVariant = () => {
    const { product, index } = variantToDelete;
    
    if (!product || !product.variants || product.variants.length === 0) {
      showToastMessage("No variants found to delete.", "warning");
      return;
    }

    const updatedProduct = { ...product };

    // Make sure the variant exists before calling splice
    if (updatedProduct.variants && updatedProduct.variants[index]) {
      updatedProduct.variants.splice(index, 1);  // Remove the variant at the given index

      const updatedProducts = products.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      );
      saveProducts(updatedProducts, "Variant deleted successfully");
      setSelectedProduct(updatedProduct);
    } else {
      showToastMessage("Variant not found.", "warning");
    }

    setShowDeleteVariantModal(false);
    setVariantToDelete({ product: null, index: null });
  };

  const handleOpenVariantForm = (product, variant = null, index = null) => {
    setSelectedProduct(product);
    if (variant) {
      // Convert old price structure to new structure if needed
      const updatedVariant = {
        ...variant,
        pricePerMan: variant.pricePerMan || variant.price || 0,
        pricePerKg: variant.pricePerKg || variant.price || 0
      };
      setVariantForm(updatedVariant);
      setEditingVariantIndex(index);
    } else {
      setVariantForm({
        variantName: "",
        man: 0,
        kg: 0,
        stock: 0,
        unit: "",
        pricePerMan: 0,
        pricePerKg: 0,
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
      // Remove old price field if it exists
      price: undefined
    };

    let toastMsg = "";
    let toastVariant = "success";

    if (editingVariantIndex !== null) {
      // If editing an existing variant, update it
      updatedProduct.variants[editingVariantIndex] = newVariant;
      toastMsg = "Variant updated successfully";
    } else {
      // If adding a new variant, push it into the variants array
      updatedProduct.variants.push(newVariant);
      toastMsg = "Variant added successfully";
    }

    // Check if stock is low after update
    if (totalKG < 10) {
      toastMsg += " - Low Stock Alert!";
      toastVariant = "warning";
    }

    // Update the products array in the state
    const updatedProducts = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    saveProducts(updatedProducts, toastMsg, toastVariant);
    setSelectedProduct(updatedProduct);
    setShowVariantForm(false);
  };

  const isProductLowStock = (product) => {
    return lowStockProducts.includes(product.id);
  };

  const isVariantLowStock = (variant) => {
    return variant.stock < 10;
  };

  // Calculate average price for display in tables (for backward compatibility)
  const getDisplayPrice = (variant) => {
    if (variant.pricePerMan > 0 && variant.pricePerKg > 0) {
      return `PKR ${variant.pricePerMan}/man, PKR ${variant.pricePerKg}/kg`;
    } else if (variant.pricePerMan > 0) {
      return `PKR ${variant.pricePerMan}/man`;
    } else if (variant.pricePerKg > 0) {
      return `PKR ${variant.pricePerKg}/kg`;
    } else if (variant.price) {
      return `PKR ${variant.price}/kg`; // Fallback for old data
    }
    return "PKR 0";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Product Management</h2>
          <p className="text-muted mb-0">Manage your products and variants</p>
        </div>
        <Button 
          variant="success" 
          onClick={() => { setSelectedProduct(null); setShowProductModal(true); }}
          className="px-4"
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Product
        </Button>
      </div>

      <div className="row">
        {products.length === 0 && (
          <div className="col-12">
            <Card className="text-center py-5">
              <Card.Body>
                <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                <h5 className="text-muted">No products available</h5>
                <p className="text-muted">Get started by adding your first product</p>
                <Button 
                  variant="success" 
                  onClick={() => { setSelectedProduct(null); setShowProductModal(true); }}
                >
                  Add Your First Product
                </Button>
              </Card.Body>
            </Card>
          </div>
        )}
        {products.map((p) => (
          <div className="col-md-12 mb-4" key={p.id}>
            <Card className={`shadow-sm ${isProductLowStock(p) ? "border-danger bg-light" : ""}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <Card.Title className="mb-0 me-2">{p.name}</Card.Title>
                      {isProductLowStock(p) && (
                        <Badge bg="danger" className="ms-2">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <Card.Subtitle className="text-muted">
                      <i className="bi bi-tag me-1"></i>
                      {p.category}
                    </Card.Subtitle>
                  </div>
                  <div className="btn-group">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => { setSelectedProduct(p); setShowProductModal(true); }}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      onClick={() => handleOpenVariantForm(p)}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Variant
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteProductClick(p)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </Button>
                  </div>
                </div>

                {p.variants && p.variants.length > 0 && (
                  <div className="mt-3">
                    <h6 className="border-bottom pb-2 mb-3">Product Variants</h6>
                    <Table striped bordered hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Variant Name</th>
                          <th>Man</th>
                          <th>Kg</th>
                          <th>Total KG</th>
                          <th>Price</th>
                          <th>Sales</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.variants.map((v, idx) => (
                          <tr key={idx} className={isVariantLowStock(v) ? "table-danger" : ""}>
                            <td className="fw-semibold">{v.variantName}</td>
                            <td>{v.man}</td>
                            <td>{v.kg}</td>
                            <td>
                              <span className={isVariantLowStock(v) ? "fw-bold text-danger" : "fw-semibold"}>
                                {v.stock} kg
                              </span>
                            </td>
                            <td className="text-success fw-semibold">
                              {getDisplayPrice(v)}
                            </td>
                            <td>{v.sales || 0} kg</td>
                            <td>
                              {isVariantLowStock(v) ? (
                                <Badge bg="danger">
                                  <i className="bi bi-exclamation-triangle me-1"></i>
                                  Low Stock
                                </Badge>
                              ) : (
                                <Badge bg="success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  In Stock
                                </Badge>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <Button 
                                  variant="outline-primary" 
                                  onClick={() => handleOpenVariantForm(p, v, idx)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  onClick={() => handleDeleteVariantClick(p, idx)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-box me-2"></i>
            {selectedProduct ? "Edit Product" : "Add New Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm product={selectedProduct} onSave={handleSaveProduct} />
        </Modal.Body>
      </Modal>

      {/* Variant Modal */}
      <Modal show={showVariantForm} onHide={() => setShowVariantForm(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-list-nested me-2"></i>
            {editingVariantIndex !== null ? "Edit Variant" : `Add Variant for ${selectedProduct?.name}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveVariant}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Variant Name</Form.Label>
              <Form.Control
                value={variantForm.variantName}
                onChange={(e) => setVariantForm({ ...variantForm, variantName: e.target.value })}
                placeholder="Enter variant name"
                required
              />
            </Form.Group>
            
            <Row>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Man</Form.Label>
                  <Form.Control
                    type="number"
                    value={variantForm.man}
                    onChange={(e) => setVariantForm({ ...variantForm, man: Number(e.target.value) })}
                    min="0"
                    step="1"
                  />
                  <Form.Text className="text-muted">
                    Each man = {MAN_WEIGHT} kg
                  </Form.Text>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Kg</Form.Label>
                  <Form.Control
                    type="number"
                    value={variantForm.kg}
                    onChange={(e) => setVariantForm({ ...variantForm, kg: Number(e.target.value) })}
                    min="0"
                    step="0.1"
                  />
                </Form.Group>
              </div>
            </Row>

            <Row>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Price per Man (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    value={variantForm.pricePerMan}
                    onChange={(e) => setVariantForm({ ...variantForm, pricePerMan: Number(e.target.value) })}
                    min="0"
                    step="1"
                    placeholder="Enter price per man"
                  />
                  <Form.Text className="text-muted">
                    Price for one man (40kg)
                  </Form.Text>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Price per Kg (PKR)</Form.Label>
                  <Form.Control
                    type="number"
                    value={variantForm.pricePerKg}
                    onChange={(e) => setVariantForm({ ...variantForm, pricePerKg: Number(e.target.value) })}
                    min="0"
                    step="1"
                    placeholder="Enter price per kg"
                  />
                  <Form.Text className="text-muted">
                    Price for one kilogram
                  </Form.Text>
                </Form.Group>
              </div>
            </Row>

            <Card className={`mb-3 ${variantForm.man * MAN_WEIGHT + variantForm.kg < 10 ? 'border-warning bg-warning bg-opacity-10' : 'border-success bg-success bg-opacity-10'}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Total Stock:</strong> {(variantForm.man * MAN_WEIGHT + variantForm.kg)} kg
                  </div>
                  {variantForm.man * MAN_WEIGHT + variantForm.kg < 10 && (
                    <Badge bg="warning" className="ms-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Low Stock Warning!
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    Composition: {variantForm.man} Man + {variantForm.kg} Kg
                  </small>
                </div>
                {(variantForm.pricePerMan > 0 || variantForm.pricePerKg > 0) && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Pricing: {variantForm.pricePerMan > 0 ? `PKR ${variantForm.pricePerMan}/man` : ''} 
                      {variantForm.pricePerMan > 0 && variantForm.pricePerKg > 0 ? ', ' : ''}
                      {variantForm.pricePerKg > 0 ? `PKR ${variantForm.pricePerKg}/kg` : ''}
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="d-grid">
              <Button variant="success" type="submit" size="lg">
                <i className="bi bi-check-circle me-2"></i>
                {editingVariantIndex !== null ? "Update Variant" : "Add Variant"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Product Confirmation Modal */}
      <Modal show={showDeleteProductModal} onHide={() => setShowDeleteProductModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <i className="bi bi-trash display-4 text-danger"></i>
          </div>
          <h5 className="text-center mb-3">Are you sure you want to delete this product?</h5>
          <p className="text-center text-muted">
            Product: <strong>{productToDelete?.name}</strong><br />
            This action cannot be undone and all variants will be lost.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteProductModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteProduct}>
            <i className="bi bi-trash me-2"></i>
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Variant Confirmation Modal */}
      <Modal show={showDeleteVariantModal} onHide={() => setShowDeleteVariantModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirm Variant Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <i className="bi bi-list-nested display-4 text-danger"></i>
          </div>
          <h5 className="text-center mb-3">Are you sure you want to delete this variant?</h5>
          <p className="text-center text-muted">
            Variant: <strong>{variantToDelete.product?.variants?.[variantToDelete.index]?.variantName}</strong><br />
            Product: <strong>{variantToDelete.product?.name}</strong><br />
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteVariantModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteVariant}>
            <i className="bi bi-trash me-2"></i>
            Delete Variant
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={5000} 
          autohide 
          bg={toastVariant}
        >
          <Toast.Header className={`${toastVariant === "danger" || toastVariant === "warning" ? "text-white" : ""}`}>
            <strong className="me-auto">
              <i className={`bi ${toastVariant === "danger" || toastVariant === "warning" ? "bi-exclamation-triangle" : "bi-check-circle"} me-2`}></i>
              {toastVariant === "danger" || toastVariant === "warning" ? "Alert" : "Success"}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === "danger" || toastVariant === "warning" ? "text-white" : ""}>
            {toastMessage}
          </Toast.Body>
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
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Product Name</Form.Label>
        <Form.Control 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Enter product name"
          required 
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Category</Form.Label>
        <Form.Control 
          name="category" 
          value={form.category} 
          onChange={handleChange} 
          placeholder="Enter category"
          required 
        />
      </Form.Group>

      <div className="d-grid">
        <Button variant="success" type="submit" size="lg">
          <i className="bi bi-check-circle me-2"></i>
          {product ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </Form>
  );
};

export default Products;