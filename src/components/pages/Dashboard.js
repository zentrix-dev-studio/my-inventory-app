import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Toast, ToastContainer, Badge, Card, Row, Col } from "react-bootstrap";

const MAN_WEIGHT = 40;  // Weight of one man in kg

// Stock Payment Analytics Component
const StockPaymentAnalytics = ({ products }) => {
  const calculateStockValue = () => {
    let totalStockValue = 0;
    let totalSalesValue = 0;

    products.forEach(product => {
      product.variants.forEach(variant => {
        const stockValue = variant.stock * (variant.pricePerKg || variant.price || 0);
        totalStockValue += stockValue;
        totalSalesValue += (variant.sales || 0) * (variant.pricePerKg || variant.price || 0);
      });
    });

    return { totalStockValue, totalSalesValue };
  };

  const { totalStockValue, totalSalesValue } = calculateStockValue();

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-cash-stack me-2 text-primary"></i>
          Stock Payment Analytics
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-3">
              <div>
                <h6 className="text-muted mb-1">Total Stock Value</h6>
                <h4 className="text-primary fw-bold mb-0">PKR {totalStockValue.toFixed(2)}</h4>
              </div>
              <i className="bi bi-box-seam display-6 text-primary"></i>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-3">
              <div>
                <h6 className="text-muted mb-1">Total Sales Value</h6>
                <h4 className="text-success fw-bold mb-0">PKR {totalSalesValue.toFixed(2)}</h4>
              </div>
              <i className="bi bi-graph-up display-6 text-success"></i>
            </div>
          </Col>
        </Row>

        {/* Stock Items Breakdown */}
        <h6 className="fw-bold mb-3">Stock Items Breakdown</h6>
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Stock Quantity</th>
                <th>Rate (Per Kg)</th>
                <th>Total Value</th>
                <th>Sales Trend</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product =>
                product.variants.map((variant, idx) => {
                  const stockValue = variant.stock * (variant.pricePerKg || variant.price || 0);
                  const salesTrend = variant.sales > 0 ? "positive" : "neutral";

                  return (
                    <tr key={`${product.id}-${idx}`}>
                      <td className="fw-semibold">{product.name}</td>
                      <td>
                        <Badge bg="outline-secondary" className="text-dark">
                          {variant.variantName}
                        </Badge>
                      </td>
                      <td>{variant.stock} kg</td>
                      <td className="text-success fw-semibold">
                        PKR {variant.pricePerKg || variant.price || 0}
                      </td>
                      <td className="fw-bold">PKR {stockValue.toFixed(2)}</td>
                      <td>
                        <Badge bg={salesTrend === "positive" ? "success" : "secondary"}>
                          <i className={`bi ${salesTrend === "positive" ? "bi-arrow-up" : "bi-dash"} me-1`}></i>
                          {salesTrend === "positive" ? "Active" : "No Sales"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

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

  // Internal Purchase States
  const [showInternalPurchaseModal, setShowInternalPurchaseModal] = useState(false);
  const [selectedSourceProduct, setSelectedSourceProduct] = useState(null);
  const [selectedSourceVariantIndex, setSelectedSourceVariantIndex] = useState(null);
  const [purchaseQuantityMan, setPurchaseQuantityMan] = useState(0);
  const [purchaseQuantityKg, setPurchaseQuantityKg] = useState(0);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newVariantName, setNewVariantName] = useState("");
  const [storedProducts, setStoredProducts] = useState([]); // Store multiple products temporarily
  
  // Enhanced Internal Purchase States
  const [pricingMethod, setPricingMethod] = useState("average");
  const [customPricePerMan, setCustomPricePerMan] = useState(0);
  const [customPricePerKg, setCustomPricePerKg] = useState(0);

  // Add these with your other state declarations
const [showSourceDetailsModal, setShowSourceDetailsModal] = useState(false);
const [selectedInternalPurchase, setSelectedInternalPurchase] = useState(null);

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
      const calculatedPricePerKg = Math.round(sellingPricePerMan / MAN_WEIGHT);
      setSellingPricePerKg(calculatedPricePerKg);
    }
  }, [sellingPricePerMan]);

  // Auto-calculate price per man when price per kg changes
  useEffect(() => {
    if (sellingPricePerKg > 0) {
      const calculatedPricePerMan = Math.round(sellingPricePerKg * MAN_WEIGHT);
      setSellingPricePerMan(calculatedPricePerMan);
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
      date: new Date().toLocaleString(),
      type: "sale"
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

  // Enhanced Internal Purchase Functions

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

  // Add Item to the list
  const handleAddItem = () => {
    if ((purchaseQuantityMan === 0 && purchaseQuantityKg === 0) || !selectedSourceProduct) {
      showToastMessage("Please select a product and enter quantity", "warning");
      return;
    }

    const sourceVariant = selectedSourceProduct.variants[selectedSourceVariantIndex];
    const purchaseKg = purchaseQuantityMan * MAN_WEIGHT + purchaseQuantityKg;
    const currentTotalKg = sourceVariant.man * MAN_WEIGHT + sourceVariant.kg;

    if (purchaseKg <= 0) {
      showToastMessage("Enter a valid quantity", "warning");
      return;
    }

    if (purchaseKg > currentTotalKg) {
      showToastMessage("Not enough stock for this purchase", "danger");
      return;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      sourceProductId: selectedSourceProduct.id,
      sourceProductName: selectedSourceProduct.name,
      sourceVariantName: sourceVariant.variantName,
      man: purchaseQuantityMan,
      kg: purchaseQuantityKg,
      totalKg: purchaseKg,
      pricePerMan: sourceVariant.pricePerMan || 0,
      pricePerKg: sourceVariant.pricePerKg || sourceVariant.price || 0,
      totalCost: (purchaseQuantityMan * (sourceVariant.pricePerMan || 0)) + (purchaseQuantityKg * (sourceVariant.pricePerKg || sourceVariant.price || 0))
    };

    const updatedItems = [...storedProducts, newItem];
    setStoredProducts(updatedItems);

    showToastMessage(`Added ${purchaseQuantityMan} Man + ${purchaseQuantityKg} Kg from ${selectedSourceProduct.name}`, "success");

    // Reset quantity inputs for next item
    setPurchaseQuantityMan(0);
    setPurchaseQuantityKg(0);
  };

  // Remove single item
  const handleRemoveItem = (index) => {
    const updatedItems = storedProducts.filter((_, i) => i !== index);
    setStoredProducts(updatedItems);
    showToastMessage("Item removed from purchase list", "info");
  };

  // Clear all items
  const handleClearAllItems = () => {
    setStoredProducts([]);
    showToastMessage("All items cleared from purchase list", "info");
  };

  // Helper functions for price calculation
  const calculateAveragePricePerMan = () => {
    if (storedProducts.length === 0) return 0;
    const totalMan = storedProducts.reduce((sum, item) => sum + item.man, 0);
    if (totalMan === 0) return 0;
    
    const totalCost = storedProducts.reduce((sum, item) => sum + (item.man * item.pricePerMan), 0);
    return Math.round(totalCost / totalMan);
  };

  const calculateAveragePricePerKg = () => {
    if (storedProducts.length === 0) return 0;
    const totalKg = storedProducts.reduce((sum, item) => sum + item.totalKg, 0);
    if (totalKg === 0) return 0;
    
    const totalCost = storedProducts.reduce((sum, item) => sum + (item.kg * item.pricePerKg), 0);
    return Math.round(totalCost / totalKg);
  };

  const calculateFinalPrices = () => {
    switch (pricingMethod) {
      case 'average':
        return {
          pricePerMan: calculateAveragePricePerMan(),
          pricePerKg: calculateAveragePricePerKg()
        };
      case 'highest':
        return {
          pricePerMan: Math.max(...storedProducts.map(item => item.pricePerMan)),
          pricePerKg: Math.max(...storedProducts.map(item => item.pricePerKg))
        };
      case 'lowest':
        return {
          pricePerMan: Math.min(...storedProducts.map(item => item.pricePerMan)),
          pricePerKg: Math.min(...storedProducts.map(item => item.pricePerKg))
        };
      case 'custom':
        return {
          pricePerMan: customPricePerMan,
          pricePerKg: customPricePerKg
        };
      default:
        return {
          pricePerMan: calculateAveragePricePerMan(),
          pricePerKg: calculateAveragePricePerKg()
        };
    }
  };

  // Create final product from all items - UPDATED VERSION
  const handleCreateFinalProduct = () => {
    if (!newProductName || !newProductCategory || storedProducts.length === 0) {
      showToastMessage("Please fill all required fields and add at least one item", "warning");
      return;
    }

    // Check stock availability for all source products
    for (const item of storedProducts) {
      const sourceProduct = products.find(p => p.id === item.sourceProductId);
      const sourceVariant = sourceProduct?.variants.find(v => v.variantName === item.sourceVariantName);
      
      if (!sourceVariant) {
        showToastMessage(`Source product not found for item: ${item.sourceProductName}`, "danger");
        return;
      }

      const currentTotalKg = sourceVariant.man * MAN_WEIGHT + sourceVariant.kg;
      if (item.totalKg > currentTotalKg) {
        showToastMessage(`Not enough stock in ${item.sourceProductName} - ${item.sourceVariantName}`, "danger");
        return;
      }
    }

    // Update stock for all source products and calculate total cost
    const updatedProducts = [...products];
    let totalPurchaseCost = 0;
    
    storedProducts.forEach(item => {
      const sourceProductIndex = updatedProducts.findIndex(p => p.id === item.sourceProductId);
      if (sourceProductIndex !== -1) {
        const sourceVariantIndex = updatedProducts[sourceProductIndex].variants.findIndex(
          v => v.variantName === item.sourceVariantName
        );
        
        if (sourceVariantIndex !== -1) {
          const sourceVariant = updatedProducts[sourceProductIndex].variants[sourceVariantIndex];
          const currentTotalKg = sourceVariant.man * MAN_WEIGHT + sourceVariant.kg;
          const remainingKg = currentTotalKg - item.totalKg;
          
          const remainingMan = Math.floor(remainingKg / MAN_WEIGHT);
          const remainingKgOnly = remainingKg % MAN_WEIGHT;

          // Update source variant stock
          sourceVariant.man = remainingMan;
          sourceVariant.kg = remainingKgOnly;
          sourceVariant.stock = remainingKg;
          sourceVariant.unit = `${remainingMan} Man + ${remainingKgOnly} Kg`;

          // Calculate cost for this item
          const itemCost = (item.man * (sourceVariant.pricePerMan || 0)) + (item.kg * (sourceVariant.pricePerKg || sourceVariant.price || 0));
          totalPurchaseCost += itemCost;
        }
      }
    });

    // Calculate final prices
    const finalPrices = calculateFinalPrices();

    // Create final combined product
    const finalProduct = {
      id: Date.now(),
      name: newProductName,
      category: newProductCategory,
      variants: [
        {
          variantName: newVariantName || "Default",
          man: storedProducts.reduce((total, item) => total + item.man, 0),
          kg: storedProducts.reduce((total, item) => total + item.kg, 0),
          stock: storedProducts.reduce((total, item) => total + item.totalKg, 0),
          unit: `${storedProducts.reduce((total, item) => total + item.man, 0)} Man + ${storedProducts.reduce((total, item) => total + item.kg, 0)} Kg`,
          pricePerMan: finalPrices.pricePerMan,
          pricePerKg: finalPrices.pricePerKg,
          sales: 0,
          sourceProducts: storedProducts.map(item => ({
            sourceProductId: item.sourceProductId,
            sourceProductName: item.sourceProductName,
            sourceVariantName: item.sourceVariantName,
            quantityMan: item.man,
            quantityKg: item.kg,
            costPerMan: item.pricePerMan,
            costPerKg: item.pricePerKg
          }))
        }
      ]
    };

    updatedProducts.push(finalProduct);
    
    // Create Internal Purchase Sale Record - NEW CODE
    const internalPurchaseSale = {
      productName: newProductName,
      variantName: newVariantName || "Default",
      quantityMan: storedProducts.reduce((total, item) => total + item.man, 0),
      quantityKg: storedProducts.reduce((total, item) => total + item.kg, 0),
      quantityInKg: storedProducts.reduce((total, item) => total + item.totalKg, 0),
      unit: `${storedProducts.reduce((total, item) => total + item.man, 0)} Man + ${storedProducts.reduce((total, item) => total + item.kg, 0)} Kg`,
      costPricePerMan: finalPrices.pricePerMan,
      costPricePerKg: finalPrices.pricePerKg,
      sellingPricePerMan: 0, // Internal purchase has no selling price
      sellingPricePerKg: 0,
      totalAmount: totalPurchaseCost,
      profit: 0, // Internal purchase profit is 0
      date: new Date().toLocaleString(),
      type: "internal_purchase", // Mark as internal purchase
      sourceProducts: storedProducts.map(item => ({
        sourceProductName: item.sourceProductName,
        sourceVariantName: item.sourceVariantName,
        quantityMan: item.man,
        quantityKg: item.kg,
        costPerMan: item.pricePerMan,
        costPerKg: item.pricePerKg
      })),
      isInternalPurchase: true // Flag to identify internal purchases
    };

    // Add to recent sales
    const updatedSales = [internalPurchaseSale, ...recentSales];
    saveRecentSales(updatedSales, `Internal purchase recorded for "${newProductName}"`, "success");

    saveProducts(updatedProducts, `Created new product "${newProductName}" from ${storedProducts.length} source items`, "success");
    
    // Reset everything
    setStoredProducts([]);
    setShowInternalPurchaseModal(false);
    setSelectedSourceProduct(null);
    setSelectedSourceVariantIndex(null);
    setPurchaseQuantityMan(0);
    setPurchaseQuantityKg(0);
    setNewProductName("");
    setNewProductCategory("");
    setNewVariantName("");
    setPricingMethod("average");
    setCustomPricePerMan(0);
    setCustomPricePerKg(0);
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
        <Col md={4} className="mb-3">
          <Card
            className="shadow-sm h-100 action-card bg-warning text-dark"
            onClick={() => setShowInternalPurchaseModal(true)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center p-4">
              <i className="bi bi-arrow-left-right display-4 mb-3"></i>
              <Card.Title className="mb-3">Internal Purchase</Card.Title>
              <Card.Text>
                Create new products from multiple sources
              </Card.Text>
              <Button variant="dark" size="sm">
                Create Product <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stock Payment Analytics */}
      <StockPaymentAnalytics products={products} />

      {/* Recent Sales Section */}
     {/* Recent Sales Section */}
<Card className="shadow-sm border-0">
  <Card.Header className="bg-white border-0 py-3">
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="mb-0 fw-bold">
        <i className="bi bi-clock-history me-2 text-primary"></i>
        Recent Sales & Internal Purchases
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
              <th>Type</th>
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
              <tr key={idx} className={sale.isInternalPurchase ? "table-info" : ""}>
                <td>
                  <small className="text-muted">{sale.date}</small>
                </td>
                <td>
                  {sale.isInternalPurchase ? (
                    <Badge bg="info" className="text-dark">
                      <i className="bi bi-arrow-left-right me-1"></i>
                      Internal Purchase
                    </Badge>
                  ) : (
                    <Badge bg="success">
                      <i className="bi bi-cart-check me-1"></i>
                      Sale
                    </Badge>
                  )}
                </td>
                <td className="fw-semibold">
                  {sale.productName}
                  {sale.isInternalPurchase && sale.sourceProducts && (
                    <div>
                      <small className="text-muted">
                        From: {sale.sourceProducts.map(sp => sp.sourceProductName).join(', ')}
                      </small>
                    </div>
                  )}
                </td>
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
                  PKR {sale.isInternalPurchase ? sale.costPricePerMan : sale.sellingPricePerMan}
                </td>
                <td className="text-success fw-semibold">
                  PKR {sale.isInternalPurchase ? sale.costPricePerKg : sale.sellingPricePerKg}
                </td>
                <td className="text-success fw-semibold">
                  PKR {sale.totalAmount.toFixed(2)}
                </td>
                <td>
                  {sale.isInternalPurchase ? (
                    <Badge bg="secondary">
                      <i className="bi bi-dash me-1"></i>
                      Internal
                    </Badge>
                  ) : (
                    <Badge bg={sale.profit >= 0 ? "success" : "danger"}>
                      <i className={`bi ${sale.profit >= 0 ? "bi-arrow-up" : "bi-arrow-down"} me-1`}></i>
                      PKR {sale.profit.toFixed(2)}
                    </Badge>
                  )}
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    {!sale.isInternalPurchase && (
                      <>
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
                      </>
                    )}
                    {sale.isInternalPurchase && (
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          setSelectedInternalPurchase(sale);
                          setShowSourceDetailsModal(true);
                        }}
                        title="View Source Details"
                      >
                        <i className="bi bi-info-circle"></i>
                      </Button>
                    )}
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

{/* Source Products Details Modal */}
<Modal show={showSourceDetailsModal} onHide={() => setShowSourceDetailsModal(false)} size="lg" centered>
  <Modal.Header closeButton className="bg-info text-white">
    <Modal.Title>
      <i className="bi bi-box-seam me-2"></i>
      Source Products Details
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedInternalPurchase && (
      <>
        <Card className="mb-4 border-primary">
          <Card.Header className="bg-primary text-white">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Final Product Information
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <strong>Product Name:</strong> {selectedInternalPurchase.productName}
              </Col>
              <Col md={6}>
                <strong>Variant:</strong> {selectedInternalPurchase.variantName}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={6}>
                <strong>Total Quantity:</strong> {selectedInternalPurchase.quantityMan} Man + {selectedInternalPurchase.quantityKg} Kg
              </Col>
              <Col md={6}>
                <strong>Total KG:</strong> {selectedInternalPurchase.quantityInKg} kg
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={6}>
                <strong>Total Cost:</strong> PKR {selectedInternalPurchase.totalAmount.toFixed(2)}
              </Col>
              <Col md={6}>
                <strong>Date Created:</strong> {selectedInternalPurchase.date}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <h6 className="fw-bold mb-3">
          <i className="bi bi-list-check me-2 text-primary"></i>
          Source Products Used ({selectedInternalPurchase.sourceProducts.length})
        </h6>
        
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="table-info">
              <tr>
                <th>#</th>
                <th>Source Product</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Total KG</th>
                <th>Cost per Man</th>
                <th>Cost per Kg</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {selectedInternalPurchase.sourceProducts.map((source, index) => (
                <tr key={index}>
                  <td className="fw-semibold">{index + 1}</td>
                  <td className="fw-semibold">{source.sourceProductName}</td>
                  <td>
                    <Badge bg="outline-secondary" className="text-dark">
                      {source.sourceVariantName}
                    </Badge>
                  </td>
                  <td>
                    {source.quantityMan > 0 && `${source.quantityMan} Man`}
                    {source.quantityMan > 0 && source.quantityKg > 0 && ' + '}
                    {source.quantityKg > 0 && `${source.quantityKg} Kg`}
                  </td>
                  <td className="fw-semibold">
                    {(source.quantityMan * MAN_WEIGHT + source.quantityKg).toFixed(2)} kg
                  </td>
                  <td className="text-success">PKR {source.costPerMan}</td>
                  <td className="text-success">PKR {source.costPerKg}</td>
                  <td className="fw-bold text-primary">
                    PKR {((source.quantityMan * source.costPerMan) + (source.quantityKg * source.costPerKg)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Summary Card */}
        <Card className="mt-3 bg-light">
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="d-flex justify-content-between">
                  <strong>Total Source Products:</strong>
                  <span>{selectedInternalPurchase.sourceProducts.length}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <strong>Total Man Used:</strong>
                  <span>{selectedInternalPurchase.sourceProducts.reduce((total, item) => total + item.quantityMan, 0)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <strong>Total Kg Used:</strong>
                  <span>{selectedInternalPurchase.sourceProducts.reduce((total, item) => total + item.quantityKg, 0)}</span>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex justify-content-between">
                  <strong>Total KG Equivalent:</strong>
                  <span>{selectedInternalPurchase.sourceProducts.reduce((total, item) => total + (item.quantityMan * MAN_WEIGHT + item.quantityKg), 0).toFixed(2)} kg</span>
                </div>
                <div className="d-flex justify-content-between">
                  <strong>Final Product Quantity:</strong>
                  <span>{selectedInternalPurchase.quantityMan} Man + {selectedInternalPurchase.quantityKg} Kg</span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowSourceDetailsModal(false)}>
      <i className="bi bi-x-circle me-2"></i>
      Close
    </Button>
  </Modal.Footer>
</Modal>

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
                    <>
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

                      {/* Rates Display Card */}
                      <Card className="mb-4 border-info bg-info bg-opacity-10">
                        <Card.Body>
                          <h6 className="mb-3 text-info">
                            <i className="bi bi-currency-exchange me-2"></i>
                            Current Rates for {selectedProduct.name} - {selectedProduct.variants[selectedVariantIndex].variantName}
                          </h6>
                          <Row>
                            <Col md={6}>
                              <div className="text-center p-2">
                                <h5 className="text-success fw-bold mb-1">
                                  PKR {selectedProduct.variants[selectedVariantIndex].pricePerMan || 0}
                                </h5>
                                <small className="text-muted">Per Man Rate</small>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="text-center p-2">
                                <h5 className="text-success fw-bold mb-1">
                                  PKR {selectedProduct.variants[selectedVariantIndex].pricePerKg || selectedProduct.variants[selectedVariantIndex].price || 0}
                                </h5>
                                <small className="text-muted">Per Kg Rate</small>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </>
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
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setSellingPricePerMan(value);
                                // Auto-calculate price per kg only if manually entered
                                if (value > 0 && document.activeElement === e.target) {
                                  const calculatedPricePerKg = Math.round(value / MAN_WEIGHT);
                                  setSellingPricePerKg(calculatedPricePerKg);
                                }
                              }}
                              onBlur={(e) => {
                                // Final calculation when user leaves the field
                                const value = parseInt(e.target.value) || 0;
                                if (value > 0) {
                                  const calculatedPricePerKg = Math.round(value / MAN_WEIGHT);
                                  setSellingPricePerKg(calculatedPricePerKg);
                                }
                              }}
                              size="lg"
                              placeholder="Enter whole number price"
                            />
                            <Form.Text className="text-muted">
                              Enter whole number only. Auto-calculates price per kg
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
                              step="1"
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setSellingPricePerKg(value);
                                // Auto-calculate price per man only if manually entered
                                if (value > 0 && document.activeElement === e.target) {
                                  const calculatedPricePerMan = Math.round(value * MAN_WEIGHT);
                                  setSellingPricePerMan(calculatedPricePerMan);
                                }
                              }}
                              onBlur={(e) => {
                                // Final calculation when user leaves the field
                                const value = parseInt(e.target.value) || 0;
                                if (value > 0) {
                                  const calculatedPricePerMan = Math.round(value * MAN_WEIGHT);
                                  setSellingPricePerMan(calculatedPricePerMan);
                                }
                              }}
                              size="lg"
                              placeholder="Enter whole number price"
                            />
                            <Form.Text className="text-muted">
                              Enter whole number only. Auto-calculates price per man
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Price Conversion Display */}
                      {(sellingPricePerMan > 0 || sellingPricePerKg > 0) && (
                        <Card className="mb-3 border-success bg-success bg-opacity-10">
                          <Card.Body className="py-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-success">
                                <i className="bi bi-arrow-left-right me-1"></i>
                                Price Conversion:
                              </small>
                              {sellingPricePerMan > 0 && (
                                <small className="text-success fw-semibold">
                                  PKR {sellingPricePerMan}/man = PKR {Math.round(sellingPricePerMan / MAN_WEIGHT)}/kg
                                </small>
                              )}
                              {sellingPricePerKg > 0 && (
                                <small className="text-success fw-semibold">
                                  PKR {sellingPricePerKg}/kg = PKR {Math.round(sellingPricePerKg * MAN_WEIGHT)}/man
                                </small>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      )}
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

      {/* Enhanced Internal Purchase Modal */}
      <Modal show={showInternalPurchaseModal} onHide={() => setShowInternalPurchaseModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <i className="bi bi-arrow-left-right me-2"></i>
            Internal Purchase - Create New Product from Multiple Sources
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Row>
            <Col md={6}>
              <Form>
                <h6 className="fw-bold mb-3">Source Products</h6>

                {/* Source Product Selection */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Select Source Product</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedSourceProduct?.id || ""}
                    onChange={(e) => {
                      const product = products.find(p => p.id === Number(e.target.value));
                      setSelectedSourceProduct(product);
                      setSelectedSourceVariantIndex(0);
                    }}
                    size="lg"
                  >
                    <option value="">-- Choose Source Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>

                {selectedSourceProduct && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Select Variant</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedSourceVariantIndex}
                        onChange={(e) => setSelectedSourceVariantIndex(Number(e.target.value))}
                        size="lg"
                      >
                        {selectedSourceProduct.variants.map((v, idx) => (
                          <option key={idx} value={idx}>{v.variantName}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>

                    {selectedSourceVariantIndex !== null && (
                      <Card className="mb-3 border-info">
                        <Card.Body>
                          <h6 className="mb-2">Available Stock</h6>
                          <p className="mb-0 fw-semibold">
                            {getAvailableStockDisplay(selectedSourceProduct.variants[selectedSourceVariantIndex])}
                          </p>
                          <small className="text-muted">
                            Price per Man: PKR {selectedSourceProduct.variants[selectedSourceVariantIndex].pricePerMan || 0} | 
                            Price per Kg: PKR {selectedSourceProduct.variants[selectedSourceVariantIndex].pricePerKg || selectedSourceProduct.variants[selectedSourceVariantIndex].price || 0}
                          </small>
                        </Card.Body>
                      </Card>
                    )}

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Quantity (Man)</Form.Label>
                          <Form.Control
                            type="number"
                            value={purchaseQuantityMan}
                            min={0}
                            max={getMaxQuantityMan(selectedSourceProduct.variants[selectedSourceVariantIndex])}
                            onChange={(e) => setPurchaseQuantityMan(Number(e.target.value))}
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Quantity (Kg)</Form.Label>
                          <Form.Control
                            type="number"
                            value={purchaseQuantityKg}
                            min={0}
                            max={getMaxQuantityKg(selectedSourceProduct.variants[selectedSourceVariantIndex])}
                            onChange={(e) => setPurchaseQuantityKg(Number(e.target.value))}
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Add Item Button */}
                    <div className="d-grid">
                      <Button 
                        variant="outline-primary" 
                        size="lg"
                        onClick={handleAddItem}
                        disabled={(purchaseQuantityMan === 0 && purchaseQuantityKg === 0) || !selectedSourceProduct}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Item to Purchase List
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            </Col>

            <Col md={6}>
              <Form>
                <h6 className="fw-bold mb-3">New Product Details</h6>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">New Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    size="lg"
                    placeholder="Enter new product name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Category *</Form.Label>
                  <Form.Control
                    as="select"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    size="lg"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Variant Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    size="lg"
                    placeholder="Enter variant name (optional)"
                  />
                </Form.Group>

                {/* Pricing Strategy */}
                <Card className="border-primary">
                  <Card.Header className="bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="bi bi-currency-exchange me-2"></i>
                      Pricing Strategy
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Price Calculation Method</Form.Label>
                      <Form.Control
                        as="select"
                        value={pricingMethod}
                        onChange={(e) => setPricingMethod(e.target.value)}
                        size="lg"
                      >
                        <option value="average">Average of Source Prices</option>
                        <option value="highest">Highest Source Price</option>
                        <option value="lowest">Lowest Source Price</option>
                        <option value="custom">Custom Price</option>
                      </Form.Control>
                    </Form.Group>

                    {pricingMethod === 'custom' && (
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Custom Price per Man</Form.Label>
                            <Form.Control
                              type="number"
                              value={customPricePerMan}
                              onChange={(e) => setCustomPricePerMan(Number(e.target.value))}
                              size="lg"
                              min="0"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Custom Price per Kg</Form.Label>
                            <Form.Control
                              type="number"
                              value={customPricePerKg}
                              onChange={(e) => setCustomPricePerKg(Number(e.target.value))}
                              size="lg"
                              min="0"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Form>
            </Col>
          </Row>

          {/* Added Items Section */}
          {storedProducts.length > 0 && (
            <div className="mt-4">
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-list-check me-2 text-primary"></i>
                  Purchase Items ({storedProducts.length})
                </h6>
                <div>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={handleClearAllItems}
                    className="me-2"
                  >
                    <i className="bi bi-trash me-1"></i>
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead className="table-primary">
                    <tr>
                      <th>#</th>
                      <th>Source Product</th>
                      <th>Variant</th>
                      <th>Quantity</th>
                      <th>Total KG</th>
                      <th>Price per Man</th>
                      <th>Price per Kg</th>
                      <th>Total Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storedProducts.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{index + 1}</td>
                        <td className="fw-semibold">{item.sourceProductName}</td>
                        <td>
                          <Badge bg="outline-secondary" className="text-dark">
                            {item.sourceVariantName}
                          </Badge>
                        </td>
                        <td>
                          {item.man > 0 && `${item.man} Man`}
                          {item.man > 0 && item.kg > 0 && ' + '}
                          {item.kg > 0 && `${item.kg} Kg`}
                        </td>
                        <td className="fw-semibold">{item.totalKg} kg</td>
                        <td className="text-success">PKR {item.pricePerMan}</td>
                        <td className="text-success">PKR {item.pricePerKg}</td>
                        <td className="fw-bold text-primary">
                          PKR {((item.man * item.pricePerMan) + (item.kg * item.pricePerKg)).toFixed(2)}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Total Summary */}
              <Card className="bg-primary text-white mt-3">
                <Card.Body>
                  <h6 className="mb-3">
                    <i className="bi bi-calculator me-2"></i>
                    Final Product Summary
                  </h6>
                  <Row>
                    <Col md={6}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Total Items:</span>
                        <strong>{storedProducts.length}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Total Man:</span>
                        <strong>{storedProducts.reduce((total, item) => total + item.man, 0)}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Total Kg:</span>
                        <strong>{storedProducts.reduce((total, item) => total + item.kg, 0)}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Total KG Equivalent:</span>
                        <strong>{storedProducts.reduce((total, item) => total + item.totalKg, 0).toFixed(2)} kg</strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Total Cost:</span>
                        <strong>PKR {storedProducts.reduce((total, item) => total + ((item.man * item.pricePerMan) + (item.kg * item.pricePerKg)), 0).toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Avg Price per Man:</span>
                        <strong>PKR {calculateAveragePricePerMan()}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Avg Price per Kg:</span>
                        <strong>PKR {calculateAveragePricePerKg()}</strong>
                      </div>
                    </Col>
                  </Row>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center fs-5">
                    <span>Final Product:</span>
                    <strong>
                      {storedProducts.reduce((total, item) => total + item.man, 0)} Man + {' '}
                      {storedProducts.reduce((total, item) => total + item.kg, 0)} Kg
                      {' '}({storedProducts.reduce((total, item) => total + item.totalKg, 0).toFixed(2)} kg)
                    </strong>
                  </div>
                </Card.Body>
              </Card>

              {/* Create Final Product Button */}
              <div className="d-grid mt-3">
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={handleCreateFinalProduct}
                  disabled={!newProductName || !newProductCategory || storedProducts.length === 0}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Create Final Product from {storedProducts.length} Source{storedProducts.length > 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInternalPurchaseModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          {storedProducts.length > 0 && (
            <Button 
              variant="success" 
              onClick={handleCreateFinalProduct}
              disabled={!newProductName || !newProductCategory}
            >
              <i className="bi bi-check-circle me-2"></i>
              Create Product ({storedProducts.length} items)
            </Button>
          )}
        </Modal.Footer>
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