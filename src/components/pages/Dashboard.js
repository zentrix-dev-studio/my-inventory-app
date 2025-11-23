import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Toast, ToastContainer, Badge, Card, Row, Col } from "react-bootstrap";

const MAN_WEIGHT = 40;  // Weight of one man in kg

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [quantityMan, setQuantityMan] = useState(0);
  const [quantityKg, setQuantityKg] = useState(0);
  const [sellingPricePerMan, setSellingPricePerMan] = useState(0);
  const [sellingPricePerKg, setSellingPricePerKg] = useState(0);

  const [recentSales, setRecentSales] = useState([]);
  const [editingSaleIndex, setEditingSaleIndex] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState("success");

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
            man: 0,
            kg: p.stock || 0,
            stock: p.stock || 0,
            unit: p.unit || "kg",
            pricePerMan: p.pricePerMan || 0,
            pricePerKg: p.pricePerKg || p.price || 0,
            sales: p.sales || 0
          }
        ]
    }));
    setProducts(fixedProducts);
    checkLowStock(fixedProducts);

    const storedSales = JSON.parse(localStorage.getItem("recentSales")) || [];
    setRecentSales(storedSales);
  }, []);

  // Auto-calculate price per kg when price per man changes
  useEffect(() => {
    if (sellingPricePerMan > 0) {
      const calculatedPricePerKg = sellingPricePerMan / MAN_WEIGHT;
      setSellingPricePerKg(parseFloat(calculatedPricePerKg.toFixed(2)));
    }
  }, [sellingPricePerMan]);

  // Auto-calculate price per man when price per kg changes
  useEffect(() => {
    if (sellingPricePerKg > 0) {
      const calculatedPricePerMan = sellingPricePerKg * MAN_WEIGHT;
      setSellingPricePerMan(parseFloat(calculatedPricePerMan.toFixed(2)));
    }
  }, [sellingPricePerKg]);

  const checkLowStock = (productList) => {
    const lowStock = productList.filter(p =>
      p.variants && p.variants.some(v => v.stock < 10)
    ).map(p => p.id);
    setLowStockProducts(lowStock);

    // Show alert for low stock products
    productList.forEach(p => {
      p.variants && p.variants.forEach(v => {
        if (v.stock < 50) {
          showToastMessage(`Low stock alert: ${p.name} - ${v.variantName} (${v.stock} kg remaining)`, "danger");
        }
      });
    });
  };

  const saveProducts = (updatedProducts, toastMsg = "", variant = "success") => {
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    checkLowStock(updatedProducts);

    if (toastMsg) showToastMessage(toastMsg, variant);
  };

  const saveRecentSales = (sales, toastMsg = "", variant = "success") => {
    localStorage.setItem("recentSales", JSON.stringify(sales));
    setRecentSales(sales);
    if (toastMsg) showToastMessage(toastMsg, variant);
  };

  const showToastMessage = (msg, variant = "success") => {
    setToastMessage(msg);
    setToastVariant(variant);
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
      showToastMessage("Please select a product", "warning");
      return;
    }

    const variant = selectedProduct.variants[selectedVariantIndex];

    const sellingKg = quantityMan * MAN_WEIGHT + quantityKg;
    const currentTotalKg = variant.man * MAN_WEIGHT + variant.kg;

    if (sellingKg <= 0) {
      showToastMessage("Enter a valid quantity", "warning");
      return;
    }

    if (sellingKg > currentTotalKg) {
      showToastMessage("Not enough stock for this variant", "danger");
      return;
    }

    // Calculate remaining stock in kg
    const remainingKg = currentTotalKg - sellingKg;

    // Convert remaining kg back to man + kg format
    const remainingMan = Math.floor(remainingKg / MAN_WEIGHT);
    const remainingKgOnly = remainingKg % MAN_WEIGHT;

    // Update the variant with new man, kg, stock, and unit
    variant.man = remainingMan;
    variant.kg = remainingKgOnly;
    variant.stock = remainingKg; // Total stock in kg
    variant.unit = `${remainingMan} Man + ${remainingKgOnly} Kg`;
    variant.sales = (variant.sales || 0) + sellingKg;

    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id ? selectedProduct : p
    );

    let toastVariant = "success";
    if (remainingKg < 10) {
      toastVariant = "warning";
    }

    saveProducts(updatedProducts, `Sold ${quantityMan} man and ${quantityKg} kg of ${selectedProduct.name}`, toastVariant);

    // Calculate total amount and profit
    const totalAmount = (quantityMan * sellingPricePerMan) + (quantityKg * sellingPricePerKg);
    const costAmount = (quantityMan * (variant.pricePerMan || 0)) + (quantityKg * (variant.pricePerKg || variant.price || 0));
    const totalProfit = totalAmount - costAmount;

    const newSale = {
      productName: selectedProduct.name,
      variantName: variant.variantName,
      quantityMan,
      quantityKg,
      quantityInKg: sellingKg,
      unit: variant.unit,
      remainingMan,
      remainingKg: remainingKgOnly,
      costPricePerMan: variant.pricePerMan || 0,
      costPricePerKg: variant.pricePerKg || variant.price || 0,
      sellingPricePerMan,
      sellingPricePerKg,
      totalAmount,
      profit: totalProfit,
      date: new Date().toLocaleString()
    };

    let updatedSales;
    if (editingSaleIndex !== null) {
      updatedSales = [...recentSales];
      updatedSales[editingSaleIndex] = newSale;
      setEditingSaleIndex(null);
      showToastMessage("Sale record updated", "success");
    } else {
      updatedSales = [newSale, ...recentSales];
      showToastMessage("Sale record added", "success");
    }

    saveRecentSales(updatedSales);
    setShowSalesModal(false);

    // Reset form
    setSelectedProduct(null);
    setSelectedVariantIndex(null);
    setQuantityMan(0);
    setQuantityKg(0);
    setSellingPricePerMan(0);
    setSellingPricePerKg(0);
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
    setSellingPricePerMan(sale.sellingPricePerMan || 0);
    setSellingPricePerKg(sale.sellingPricePerKg || 0);
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
      // Restore the stock when deleting a sale
      const restoredKg = sale.quantityMan * MAN_WEIGHT + sale.quantityKg;
      const currentTotalKg = variant.man * MAN_WEIGHT + variant.kg;
      const newTotalKg = currentTotalKg + restoredKg;

      const newMan = Math.floor(newTotalKg / MAN_WEIGHT);
      const newKg = newTotalKg % MAN_WEIGHT;

      variant.man = newMan;
      variant.kg = newKg;
      variant.stock = newTotalKg;
      variant.unit = `${newMan} Man + ${newKg} Kg`;
      variant.sales = Math.max(0, (variant.sales || 0) - restoredKg);

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
    showToastMessage("Order cancelled successfully!", "success");
    setShowCancelModal(false);
  };

  // Helper function to get available stock for display
  const getAvailableStockDisplay = (variant) => {
    if (!variant) return "0 kg";
    const totalKg = variant.man * MAN_WEIGHT + variant.kg;
    return `${variant.man} Man + ${variant.kg} Kg (${totalKg} kg total)`;
  };

  // Helper function to get max values for quantity inputs
  const getMaxQuantityMan = (variant) => {
    if (!variant) return 0;
    return variant.man;
  };

  const getMaxQuantityKg = (variant) => {
    if (!variant) return 0;
    return variant.man * MAN_WEIGHT + variant.kg;
  };

  const isProductLowStock = (product) => {
    return lowStockProducts.includes(product.id);
  };

  const isVariantLowStock = (variant) => {
    return variant.stock < 10;
  };

  // Calculate dashboard statistics
  const totalProducts = products.length;
  const totalLowStockProducts = lowStockProducts.length;
  const totalSales = recentSales.length;
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalProfit = recentSales.reduce((sum, sale) => sum + sale.profit, 0);

  return (
    <div className="dashboard-container container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Dashboard Overview</h2>
          <p className="text-muted mb-0">Monitor your sales, inventory, and performance</p>
        </div>
        <Badge bg="primary" className="fs-6 px-3 py-2">
          <i className="bi bi-graph-up me-2"></i>
          Real-time Analytics
        </Badge>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="dashboard-stat-card">
                <i className="bi bi-box-seam display-6 text-primary mb-3"></i>
                <h4 className="fw-bold text-primary">{totalProducts}</h4>
                <p className="text-muted mb-0">Total Products</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className={`shadow-sm border-0 h-100 ${totalLowStockProducts > 0 ? 'border-warning' : ''}`}>
            <Card.Body className="text-center">
              <div className="dashboard-stat-card">
                <i className="bi bi-exclamation-triangle display-6 text-warning mb-3"></i>
                <h4 className="fw-bold text-warning">{totalLowStockProducts}</h4>
                <p className="text-muted mb-0">Low Stock Items</p>
                {totalLowStockProducts > 0 && (
                  <Badge bg="warning" className="mt-2">
                    Attention Needed
                  </Badge>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="dashboard-stat-card">
                <i className="bi bi-currency-dollar display-6 text-success mb-3"></i>
                <h4 className="fw-bold text-success">PKR {totalRevenue.toFixed(2)}</h4>
                <p className="text-muted mb-0">Total Revenue</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="dashboard-stat-card">
                <i className="bi bi-graph-up-arrow display-6 text-info mb-3"></i>
                <h4 className="fw-bold text-info">PKR {totalProfit.toFixed(2)}</h4>
                <p className="text-muted mb-0">Total Profit</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-5">
        <Col md={4} className="mb-3">
          <Card
            className={`shadow-sm h-100 action-card ${categories.filter(cat =>
              products.filter(p => p.category === cat).some(p => isProductLowStock(p))
            ).length > 0 ? 'border-danger' : ''}`}
            onClick={() => handleCardClick(categories[0])}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center p-4">
              <i className="bi bi-shop display-4 text-primary mb-3"></i>
              <Card.Title className="d-flex align-items-center justify-content-center mb-3">
                Commission Shop
                {products.filter(p => p.category === categories[0]).some(p => isProductLowStock(p)) && (
                  <Badge bg="danger" className="ms-2">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Low Stock
                  </Badge>
                )}
              </Card.Title>
              <Card.Text className="text-muted">
                {products.filter(p => p.category === categories[0]).length} products available
              </Card.Text>
              <Button variant="outline-primary" size="sm">
                View Products <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card
            className={`shadow-sm h-100 action-card ${categories.filter(cat =>
              products.filter(p => p.category === cat).some(p => isProductLowStock(p))
            ).length > 0 ? 'border-danger' : ''}`}
            onClick={() => handleCardClick(categories[1])}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center p-4">
              <i className="bi bi-tree display-4 text-success mb-3"></i>
              <Card.Title className="d-flex align-items-center justify-content-center mb-3">
                Cattle Field
                {products.filter(p => p.category === categories[1]).some(p => isProductLowStock(p)) && (
                  <Badge bg="danger" className="ms-2">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Low Stock
                  </Badge>
                )}
              </Card.Title>
              <Card.Text className="text-muted">
                {products.filter(p => p.category === categories[1]).length} products available
              </Card.Text>
              <Button variant="outline-success" size="sm">
                View Products <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card
            className="shadow-sm h-100 action-card bg-primary text-white"
            onClick={() => setShowSalesModal(true)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center p-4">
              <i className="bi bi-cart-check display-4 mb-3"></i>
              <Card.Title className="mb-3">Process Sale</Card.Title>
              <Card.Text>
                Quick sales processing with real-time stock updates
              </Card.Text>
              <Button variant="light" size="sm">
                Start Selling <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Sales Section */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-clock-history me-2 text-primary"></i>
              Recent Sales
            </h5>
            <Badge bg="primary" pill>
              {recentSales.length} transactions
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {recentSales.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt display-4 text-muted mb-3"></i>
              <h5 className="text-muted">No sales recorded yet</h5>
              <p className="text-muted">Start selling to see your transaction history</p>
              <Button variant="primary" onClick={() => setShowSalesModal(true)}>
                <i className="bi bi-cart-plus me-2"></i>
                Make Your First Sale
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date & Time</th>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Quantity</th>
                    <th>Total KG</th>
                    <th>Price per Man</th>
                    <th>Price per Kg</th>
                    <th>Total Amount</th>
                    <th>Profit/Loss</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale, idx) => (
                    <tr key={idx}>
                      <td>
                        <small className="text-muted">{sale.date}</small>
                      </td>
                      <td className="fw-semibold">{sale.productName}</td>
                      <td>
                        <Badge bg="outline-secondary" className="text-dark">
                          {sale.variantName}
                        </Badge>
                      </td>
                      <td>
                        {sale.quantityMan > 0 && `${sale.quantityMan} Man`}
                        {sale.quantityMan > 0 && sale.quantityKg > 0 && ' + '}
                        {sale.quantityKg > 0 && `${sale.quantityKg} Kg`}
                      </td>
                      <td className="fw-semibold">{sale.quantityInKg} kg</td>
                      <td className="text-success fw-semibold">
                        PKR {sale.sellingPricePerMan}
                      </td>
                      <td className="text-success fw-semibold">
                        PKR {sale.sellingPricePerKg}
                      </td>
                      <td className="text-success fw-semibold">
                        PKR {sale.totalAmount.toFixed(2)}
                      </td>
                      <td>
                        <Badge bg={sale.profit >= 0 ? "success" : "danger"}>
                          <i className={`bi ${sale.profit >= 0 ? "bi-arrow-up" : "bi-arrow-down"} me-1`}></i>
                          PKR {sale.profit.toFixed(2)}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditSale(idx)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteSale(idx)}
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

      {/* Category Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-grid me-2"></i>
            {selectedCategory} - Product Inventory
            {filteredProducts.some(p => isProductLowStock(p)) && (
              <Badge bg="danger" className="ms-2">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Low Stock Items
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-inbox display-4 text-muted mb-3"></i>
              <h5 className="text-muted">No products in this category</h5>
              <p className="text-muted">Add products to see them listed here</p>
            </div>
          ) : (
            filteredProducts.map((p) => (
              <Card key={p.id} className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="d-flex align-items-center mb-2">
                        {p.name}
                        {isProductLowStock(p) && (
                          <Badge bg="danger" className="ms-2">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Low Stock
                          </Badge>
                        )}
                      </h6>
                      <small className="text-muted">
                        <i className="bi bi-tag me-1"></i>
                        {p.category}
                      </small>
                    </div>
                  </div>
                  <Table striped bordered hover size="sm" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Variant</th>
                        <th>Man</th>
                        <th>Kg</th>
                        <th>Total KG</th>
                        <th>Unit</th>
                        <th>Price per Man</th>
                        <th>Price per Kg</th>
                        <th>Total Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.variants.map((v, idx) => {
                        const totalValue = v.stock * (v.pricePerKg || v.price || 0);
                        return (
                          <tr key={idx} className={isVariantLowStock(v) ? "table-warning" : ""}>
                            <td className="fw-semibold">{v.variantName}</td>
                            <td>{v.man}</td>
                            <td>{v.kg}</td>
                            <td className={isVariantLowStock(v) ? "fw-bold text-danger" : "fw-semibold"}>
                              {v.stock} kg
                            </td>
                            <td>
                              <small className="text-muted">{v.unit}</small>
                            </td>
                            <td className="text-success fw-semibold">
                              {v.pricePerMan > 0 ? `PKR ${v.pricePerMan}` : '-'}
                            </td>
                            <td className="text-success fw-semibold">
                              {v.pricePerKg > 0 ? `PKR ${v.pricePerKg}` : (v.price ? `PKR ${v.price}` : '-')}
                            </td>
                            <td className="fw-semibold">PKR {totalValue.toFixed(2)}</td>
                            <td>
                              {isVariantLowStock(v) ? (
                                <Badge bg="warning" className="text-dark">
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sales Modal */}
      <Modal show={showSalesModal} onHide={() => {
        setShowSalesModal(false);
        setEditingSaleIndex(null);
        setSelectedProduct(null);
        setSelectedVariantIndex(null);
        setQuantityMan(0);
        setQuantityKg(0);
        setSellingPricePerMan(0);
        setSellingPricePerKg(0);
      }} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-cart-check me-2"></i>
            {editingSaleIndex !== null ? "Edit Sale Record" : "Process New Sale"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {products.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-inbox display-4 text-muted mb-3"></i>
              <h5 className="text-muted">No products available</h5>
              <p className="text-muted">Add products in the Products section to start selling</p>
            </div>
          ) : (
            <Row>
              <Col md={8}>
                <Form>
                  {selectedProduct && selectedVariantIndex !== null && (
                    <Card className={`mb-4 ${isVariantLowStock(selectedProduct.variants[selectedVariantIndex]) ? 'border-warning bg-warning bg-opacity-10' : 'border-success bg-success bg-opacity-10'}`}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">Available Stock</h6>
                            <p className="mb-0 fw-semibold">
                              {getAvailableStockDisplay(selectedProduct.variants[selectedVariantIndex])}
                            </p>
                          </div>
                          {isVariantLowStock(selectedProduct.variants[selectedVariantIndex]) && (
                            <Badge bg="warning" className="text-dark fs-6">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Low Stock Warning!
                            </Badge>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Select Product</Form.Label>
                        <Form.Control
                          as="select"
                          value={selectedProduct?.id || ""}
                          onChange={(e) => {
                            const product = products.find(p => p.id === Number(e.target.value));
                            setSelectedProduct(product);
                            setSelectedVariantIndex(0);
                            setSellingPricePerMan(0);
                            setSellingPricePerKg(0);
                            setQuantityMan(0);
                            setQuantityKg(0);
                          }}
                          size="lg"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      {selectedProduct && (
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Select Variant</Form.Label>
                          <Form.Control
                            as="select"
                            value={selectedVariantIndex}
                            onChange={(e) => {
                              const idx = Number(e.target.value);
                              setSelectedVariantIndex(idx);
                              setSellingPricePerMan(0);
                              setSellingPricePerKg(0);
                              setQuantityMan(0);
                              setQuantityKg(0);
                            }}
                            size="lg"
                          >
                            {selectedProduct.variants.map((v, idx) => (
                              <option key={idx} value={idx}>{v.variantName}</option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      )}
                    </Col>
                  </Row>

                  {selectedProduct && (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Quantity (Man)</Form.Label>
                            <Form.Control
                              type="number"
                              value={quantityMan}
                              min={0}
                              max={getMaxQuantityMan(selectedProduct.variants[selectedVariantIndex])}
                              onChange={(e) => setQuantityMan(Number(e.target.value))}
                              size="lg"
                            />
                            <Form.Text className="text-muted">
                              Maximum: {getMaxQuantityMan(selectedProduct.variants[selectedVariantIndex])} man available
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Quantity (Kg)</Form.Label>
                            <Form.Control
                              type="number"
                              value={quantityKg}
                              min={0}
                              max={getMaxQuantityKg(selectedProduct.variants[selectedVariantIndex])}
                              onChange={(e) => setQuantityKg(Number(e.target.value))}
                              size="lg"
                            />
                            <Form.Text className="text-muted">
                              Maximum: {getMaxQuantityKg(selectedProduct.variants[selectedVariantIndex])} kg total available
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Selling Price per Man (PKR)</Form.Label>
                            <Form.Control
                              type="number"
                              value={sellingPricePerMan}
                              min={0}
                              step="1"
                              onChange={(e) => setSellingPricePerMan(Number(e.target.value))}
                              size="lg"
                              placeholder="Enter price per man"
                            />
                            <Form.Text className="text-muted">
                              Auto-calculates price per kg: {sellingPricePerKg > 0 ? `PKR ${sellingPricePerKg}/kg` : 'Enter price to calculate'}
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Selling Price per Kg (PKR)</Form.Label>
                            <Form.Control
                              type="number"
                              value={sellingPricePerKg}
                              min={0}
                              step="0.01"
                              onChange={(e) => setSellingPricePerKg(Number(e.target.value))}
                              size="lg"
                              placeholder="Enter price per kg"
                            />
                            <Form.Text className="text-muted">
                              Auto-calculates price per man: {sellingPricePerMan > 0 ? `PKR ${sellingPricePerMan}/man` : 'Enter price to calculate'}
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}
                </Form>
              </Col>
              <Col md={4}>
                <Card className="bg-primary text-white">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-receipt me-2"></i>
                      Sale Summary
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="sale-summary">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Man:</span>
                        <strong>{quantityMan}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Kg:</span>
                        <strong>{quantityKg} kg</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total KG Equivalent:</span>
                        <strong>{(quantityMan * MAN_WEIGHT + quantityKg).toFixed(2)} kg</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Price per Man:</span>
                        <strong>PKR {sellingPricePerMan}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Price per Kg:</span>
                        <strong>PKR {sellingPricePerKg}</strong>
                      </div>
                      <hr className="my-3" />
                      <div className="d-flex justify-content-between mb-3 fs-5">
                        <span>Total Amount:</span>
                        <strong>PKR {((quantityMan * sellingPricePerMan) + (quantityKg * sellingPricePerKg)).toFixed(2)}</strong>
                      </div>
                      <div className="d-grid">
                        <Button
                          variant="light"
                          size="lg"
                          onClick={handleProcessSale}
                          className="fw-bold"
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          {editingSaleIndex !== null ? "Update Sale" : "Confirm Sale"}
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Cancel Order
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <i className="bi bi-x-circle display-4 text-warning"></i>
          </div>
          <h5 className="text-center mb-3">Cancel this order?</h5>
          <p className="text-center text-muted">
            This action will cancel the current order process. Any unsaved changes will be lost.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            <i className="bi bi-arrow-left me-2"></i>
            Continue Order
          </Button>
          <Button variant="warning" onClick={confirmCancelOrder}>
            <i className="bi bi-x-circle me-2"></i>
            Cancel Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Sale Modal */}
      <Modal show={showDeleteSaleModal} onHide={() => setShowDeleteSaleModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-trash me-2"></i>
            Delete Sale Record
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <i className="bi bi-exclamation-triangle display-4 text-danger"></i>
          </div>
          <h5 className="text-center mb-3">Delete this sale record?</h5>
          <p className="text-center text-muted">
            This action cannot be undone. Stock levels will be restored to their previous state.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteSaleModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Keep Record
          </Button>
          <Button variant="danger" onClick={confirmDeleteSale}>
            <i className="bi bi-trash me-2"></i>
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3 mt-5">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={5000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header className={`${toastVariant === "danger" || toastVariant === "warning" ? "text-white" : ""}`}>
            <strong className="me-auto">
              <i className={`bi ${toastVariant === "danger" || toastVariant === "warning" ? "bi-exclamation-triangle" : "bi-check-circle"} me-2`}></i>
              {toastVariant === "danger" || toastVariant === "warning" ? "Stock Alert" : "Success"}
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

export default Dashboard;