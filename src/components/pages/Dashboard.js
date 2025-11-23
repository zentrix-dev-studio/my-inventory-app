import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Toast, ToastContainer } from "react-bootstrap";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [quantityMan, setQuantityMan] = useState(0);
  const [quantityKg, setQuantityKg] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  const [recentSales, setRecentSales] = useState([]);
  const [editingSaleIndex, setEditingSaleIndex] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteSaleModal, setShowDeleteSaleModal] = useState(false);
  const [deleteSaleIndex, setDeleteSaleIndex] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    const fixedProducts = storedProducts.map(p => ({
      ...p,
      variants: p.variants && p.variants.length > 0
        ? p.variants
        : [
            {
              variantName: "Default",
              stock: p.stock || 0,
              unit: p.unit || "kg",
              price: p.price || 0,
              sales: p.sales || 0
            }
          ]
    }));
    setProducts(fixedProducts);

    const storedSales = JSON.parse(localStorage.getItem("recentSales")) || [];
    setRecentSales(storedSales);

    const lowStock = fixedProducts.filter(p =>
      p.variants.some(v => (v.unit === "man" ? v.stock : v.stock / 40) < 10)
    ).map(p => p.id);
    setLowStockProducts(lowStock);

    fixedProducts.forEach(p => {
      p.variants.forEach(v => {
        const stockInMan = v.unit === "man" ? v.stock : v.stock / 40;
        if (stockInMan < 10) showToastMessage(`Low stock alert: ${p.name} (${v.variantName})`);
      });
    });
  }, []);

  const saveProducts = (updatedProducts, toastMsg = "") => {
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    const lowStock = updatedProducts.filter(p =>
      p.variants.some(v => (v.unit === "man" ? v.stock : v.stock / 40) < 10)
    ).map(p => p.id);
    setLowStockProducts(lowStock);

    updatedProducts.forEach(p => {
      p.variants.forEach(v => {
        const stockInMan = v.unit === "man" ? v.stock : v.stock / 40;
        if (stockInMan < 10) showToastMessage(`Low stock alert: ${p.name} (${v.variantName})`);
      });
    });

    if (toastMsg) showToastMessage(toastMsg);
  };

  const saveRecentSales = (sales, toastMsg = "") => {
    localStorage.setItem("recentSales", JSON.stringify(sales));
    setRecentSales(sales);
    if (toastMsg) showToastMessage(toastMsg);
  };

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const categories = ["Comission Shop", "Cattle Field"];
  const filteredProducts = products.filter(p => p.category === selectedCategory);

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleProcessSale = () => {
    if (!selectedProduct) {
      showToastMessage("Please select a product");
      return;
    }

    const variant = selectedProduct.variants[selectedVariantIndex];

    const sellingKg = quantityMan * 40 + quantityKg;
    const stockKg = variant.unit === "man" ? variant.stock * 40 : variant.stock;

    if (sellingKg <= 0) {
      showToastMessage("Enter a valid quantity");
      return;
    }

    if (sellingKg > stockKg) {
      showToastMessage("Not enough stock for this variant");
      return;
    }

    // Deduct stock and calculate remaining man + kg
    const remainingKg = stockKg - sellingKg;
    const remainingMan = Math.floor(remainingKg / 40);
    const remainingKgOnly = remainingKg % 40;

    variant.sales = (variant.sales || 0) + sellingKg;
    variant.unit = remainingMan > 0 ? "man" : "kg";
    variant.stock = remainingMan > 0 ? remainingMan : remainingKgOnly;

    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id ? selectedProduct : p
    );
    saveProducts(updatedProducts, `Sold ${quantityMan} man and ${quantityKg} kg of ${selectedProduct.name}`);

    const totalProfit = (sellingPrice - variant.price) * sellingKg;

    const newSale = {
      productName: selectedProduct.name,
      variantName: variant.variantName,
      quantityMan,
      quantityKg,
      quantityInKg: sellingKg,
      unit: variant.unit,
      remainingMan,
      remainingKg: remainingKgOnly,
      costPrice: variant.price,
      sellingPrice,
      profit: totalProfit,
      date: new Date().toLocaleString()
    };

    let updatedSales;
    if (editingSaleIndex !== null) {
      updatedSales = [...recentSales];
      updatedSales[editingSaleIndex] = newSale;
      setEditingSaleIndex(null);
      showToastMessage("Sale record updated");
    } else {
      updatedSales = [newSale, ...recentSales];
      showToastMessage("Sale record added");
    }

    saveRecentSales(updatedSales);
    setShowSalesModal(false);
  };

  const handleEditSale = (index) => {
    const sale = recentSales[index];
    setEditingSaleIndex(index);

    const product = products.find(p => p.name === sale.productName);
    const variantIndex = product ? product.variants.findIndex(v => v.variantName === sale.variantName) : 0;

    setSelectedProduct(product);
    setSelectedVariantIndex(variantIndex);
    setQuantityMan(sale.quantityMan || 0);
    setQuantityKg(sale.quantityKg || 0);
    setSellingPrice(sale.sellingPrice);
    setShowSalesModal(true);
  };

  const handleDeleteSale = (index) => {
    setDeleteSaleIndex(index);
    setShowDeleteSaleModal(true);
  };

  const confirmDeleteSale = () => {
    const updatedSales = [...recentSales];
    const sale = updatedSales[deleteSaleIndex];
    const product = products.find(p => p.name === sale.productName);
    const variant = product?.variants.find(v => v.variantName === sale.variantName);

    if (variant) {
      const stockKg = variant.unit === "man" ? variant.stock * 40 : variant.stock;
      const remainingKg = stockKg + sale.quantityMan * 40 + sale.quantityKg;

      variant.sales -= sale.quantityMan * 40 + sale.quantityKg;
      variant.stock = remainingKg / 40;

      const updatedProducts = products.map(p =>
        p.id === product.id ? product : p
      );
      saveProducts(updatedProducts);
    }

    updatedSales.splice(deleteSaleIndex, 1);
    saveRecentSales(updatedSales, "Sale record deleted");
    setShowDeleteSaleModal(false);
    setDeleteSaleIndex(null);
  };

  const handleCancelOrder = () => setShowCancelModal(true);
  const confirmCancelOrder = () => {
    showToastMessage("Order cancelled successfully!");
    setShowCancelModal(false);
  };

  return (
    <div className="dashboard-container container mt-4">
      <h2 className="mb-4 fw-bold">Dashboard Overview</h2>

      <div className="row">
        {categories.map(cat => {
          const categoryProducts = products.filter(p => p.category === cat);
          const hasLowStock = categoryProducts.some(p => lowStockProducts.includes(p.id));
          return (
            <div className="col-md-4 mb-3" key={cat}>
              <div
                className={`card shadow-sm dashboard-card cursor-pointer ${hasLowStock ? "border-danger bg-light" : ""}`}
                onClick={() => handleCardClick(cat)}
              >
                <div className="card-body text-center">
                  <h5 className="card-title">{cat}</h5>
                  <p>Total Products: {categoryProducts.length}</p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm dashboard-card cursor-pointer" onClick={() => setShowSalesModal(true)}>
            <div className="card-body text-center">
              <h5 className="card-title">Process Sale</h5>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm dashboard-card cursor-pointer" onClick={handleCancelOrder}>
            <div className="card-body text-center">
              <h5 className="card-title">Cancel Order</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCategory}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {filteredProducts.length === 0 ? (
            <p>No products in this category.</p>
          ) : (
            filteredProducts.map((p) => (
              <div key={p.id} className="mb-3">
                <h5>{p.name}</h5>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Variant</th>
                      <th>Stock</th>
                      <th>Unit</th>
                      <th>Price (Cost)</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.variants.map((v, idx) => {
                      const stockDisplay = v.unit === "man"
                        ? `${v.stock} man (${v.stock*40} kg)`
                        : `${v.stock.toFixed(2)} kg`;
                      return (
                        <tr key={idx} className={(v.unit === "man" ? v.stock : v.stock / 40) < 10 ? "table-danger" : ""}>
                          <td>{v.variantName}</td>
                          <td>{stockDisplay}</td>
                          <td>{v.unit}</td>
                          <td>${v.price}</td>
                          <td>${v.unit === "man" ? (v.stock*40*v.price).toFixed(2) : (v.stock*v.price).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Sales Modal */}
      <Modal show={showSalesModal} onHide={() => setShowSalesModal(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingSaleIndex !== null ? "Edit Sale" : "Sell Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {products.length === 0 ? (
            <p>No products available to sell.</p>
          ) : (
            <Form>
              {selectedProduct && selectedVariantIndex !== null && (
                <div className="mb-3">
                  <strong>Available Stock:</strong>{" "}
                  {selectedProduct.variants[selectedVariantIndex].unit === "man"
                    ? `${selectedProduct.variants[selectedVariantIndex].stock} man (${selectedProduct.variants[selectedVariantIndex].stock * 40} kg)`
                    : `${selectedProduct.variants[selectedVariantIndex].stock.toFixed(2)} kg`}
                </div>
              )}

              <Form.Group className="mb-2">
                <Form.Label>Select Product</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedProduct?.id || ""}
                  onChange={(e) => {
                    const product = products.find(p => p.id === Number(e.target.value));
                    setSelectedProduct(product);
                    setSelectedVariantIndex(0);
                    setSellingPrice(product.variants[0]?.price || 0);
                    setQuantityMan(0);
                    setQuantityKg(0);
                  }}
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              {selectedProduct && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label>Select Variant</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedVariantIndex}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setSelectedVariantIndex(idx);
                        setSellingPrice(selectedProduct.variants[idx].price);
                        setQuantityMan(0);
                        setQuantityKg(0);
                      }}
                    >
                      {selectedProduct.variants.map((v, idx) => (
                        <option key={idx} value={idx}>{v.variantName}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Quantity (Man)</Form.Label>
                    <Form.Control
                      type="number"
                      value={quantityMan}
                      min={0}
                      max={selectedProduct.variants[selectedVariantIndex]?.unit === "man"
                        ? selectedProduct.variants[selectedVariantIndex]?.stock
                        : Math.floor(selectedProduct.variants[selectedVariantIndex]?.stock / 40)}
                      onChange={(e) => setQuantityMan(Number(e.target.value))}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Quantity (Kg)</Form.Label>
                    <Form.Control
                      type="number"
                      value={quantityKg}
                      min={0}
                      max={selectedProduct.variants[selectedVariantIndex]?.unit === "kg"
                        ? selectedProduct.variants[selectedVariantIndex]?.stock
                        : (selectedProduct.variants[selectedVariantIndex]?.stock * 40)}
                      onChange={(e) => setQuantityKg(Number(e.target.value))}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Selling Price per Unit ($)</Form.Label>
                    <Form.Control
                      type="number"
                      value={sellingPrice}
                      min={0}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                    />
                  </Form.Group>

                  <Button variant="success" onClick={handleProcessSale}>
                    {editingSaleIndex !== null ? "Update Sale" : "Sell"}
                  </Button>
                </>
              )}
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this order?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Close</Button>
          <Button variant="danger" onClick={confirmCancelOrder}>Confirm Cancel</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Sale Modal */}
      <Modal show={showDeleteSaleModal} onHide={() => setShowDeleteSaleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Sale</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this sale record?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteSaleModal(false)}>Close</Button>
          <Button variant="danger" onClick={confirmDeleteSale}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Recent Sales Table */}
      <div className="mt-5">
        <h4>Recent Sales</h4>
        {recentSales.length === 0 ? (
          <p>No recent sales.</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Variant</th>
                <th>Man</th>
                <th>Kg</th>
                <th>KG Equivalent</th>
                <th>Remaining (Man)</th>
                <th>Remaining (Kg)</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Profit / Loss</th>
                <th>Total ($)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, idx) => (
                <tr key={idx}>
                  <td>{sale.date}</td>
                  <td>{sale.productName}</td>
                  <td>{sale.variantName}</td>
                  <td>{sale.quantityMan}</td>
                  <td>{sale.quantityKg}</td>
                  <td>{sale.quantityInKg}</td>
                  <td>{sale.remainingMan}</td>
                  <td>{sale.remainingKg}</td>
                  <td>${sale.costPrice}</td>
                  <td>${sale.sellingPrice}</td>
                  <td style={{ color: sale.profit >= 0 ? "green" : "red" }}>
                    ${sale.profit.toFixed(2)}
                  </td>
                  <td>${(sale.sellingPrice * sale.quantityInKg).toFixed(2)}</td>
                  <td>
                    <Button size="sm" variant="primary" onClick={() => handleEditSale(idx)}>Edit</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleDeleteSale(idx)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Toast for Notifications */}
      <ToastContainer position="top-center">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Dashboard;
