// components/Khata/KhataSystem.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Nav, Badge, 
  InputGroup, Dropdown, Modal, Alert, Table 
} from 'react-bootstrap';
import { 
  FaSearch, FaPlus, FaUser, FaStore, FaEdit, FaTrash, FaEye, 
  FaRupeeSign, FaBox, FaUsers, FaShoppingBag, FaEllipsisV, 
  FaShoppingCart, FaTruck, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaHistory
} from 'react-icons/fa';

const KhataSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPersonDetailModal, setShowPersonDetailModal] = useState(false);
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false);
  const [showQuickPurchaseModal, setShowQuickPurchaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);
  
  // Data states
  const [products, setProducts] = useState([]);
  const [persons, setPersons] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    // const storedPersons = JSON.parse(localStorage.getItem("khataPersons")) || [
    //   { 
    //     id: 1, 
    //     name: 'John Doe', 
    //     type: 'customer', 
    //     balance: 1500, 
    //     barDana: 500, 
    //     phone: '0300-1234567', 
    //     address: 'Lahore',
    //     email: 'john@example.com',
    //     createdAt: new Date().toISOString()
    //   },
    //   { 
    //     id: 2, 
    //     name: 'Supplier A', 
    //     type: 'supplier', 
    //     balance: -2500, 
    //     barDana: 0, 
    //     phone: '0300-7654321', 
    //     address: 'Karachi',
    //     email: 'supplier@example.com',
    //     createdAt: new Date().toISOString()
    //   }
    // ];
    const storedSales = JSON.parse(localStorage.getItem("khataSales")) || [];
    const storedPurchases = JSON.parse(localStorage.getItem("khataPurchases")) || [];
    
    setProducts(storedProducts);
    /* setPersons(storedPersons); */
    setSales(storedSales);
    setPurchases(storedPurchases);
  }, []);

  // Save functions
  const savePersons = (updatedPersons) => {
    localStorage.setItem("khataPersons", JSON.stringify(updatedPersons));
    setPersons(updatedPersons);
  };

  const saveSales = (updatedSales) => {
    localStorage.setItem("khataSales", JSON.stringify(updatedSales));
    setSales(updatedSales);
  };

  const savePurchases = (updatedPurchases) => {
    localStorage.setItem("khataPurchases", JSON.stringify(updatedPurchases));
    setPurchases(updatedPurchases);
  };

  // Update product stock
  const updateProductStock = (productId, quantity, isSale = true) => {
    const updatedProducts = products.map(product => {
      if (product.id == productId) {
        const currentStock = product.variants?.[0]?.stock || 0;
        const newStock = isSale ? 
          (currentStock - quantity) : 
          (currentStock + quantity);
        
        const newMan = Math.floor(newStock / 40);
        const newKg = newStock % 40;
        
        const updatedVariant = {
          variantName: 'Default',
          stock: newStock,
          man: newMan,
          kg: newKg,
          unit: `${newMan} Man + ${newKg} Kg`
        };
        
        return { 
          ...product, 
          variants: [updatedVariant] 
        };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
  };

  // Person CRUD operations
  const handleAddPerson = (newPerson) => {
    const updatedPersons = [...persons, { 
      ...newPerson, 
      id: Date.now(),
      createdAt: new Date().toISOString()
    }];
    savePersons(updatedPersons);
  };

  const handleUpdatePerson = (updatedPerson) => {
    const updatedPersons = persons.map(person => 
      person.id === updatedPerson.id ? updatedPerson : person
    );
    savePersons(updatedPersons);
    setEditingPerson(null);
  };

  const handleDeletePerson = (personId) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      const updatedPersons = persons.filter(person => person.id !== personId);
      savePersons(updatedPersons);
      if (selectedPerson?.id === personId) {
        setSelectedPerson(null);
      }
    }
  };

  // Product handlers
  const handleAddProduct = (newProduct) => {
    const stock = newProduct.stock || 0;
    const updatedProducts = [...products, { 
      ...newProduct, 
      id: Date.now(),
      variants: [{
        variantName: 'Default',
        stock: stock,
        man: Math.floor(stock / 40),
        kg: stock % 40,
        unit: `${Math.floor(stock / 40)} Man + ${stock % 40} Kg`
      }]
    }];
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
  };

  // Quick Sale Handler
  const handleQuickSale = (saleData) => {
    const newSale = {
      id: Date.now(),
      personId: saleData.personId,
      personName: persons.find(p => p.id === saleData.personId)?.name || 'Unknown',
      date: new Date().toISOString(),
      items: [{
        productId: saleData.productId,
        productName: products.find(p => p.id === saleData.productId)?.name || 'Unknown',
        quantity: saleData.quantity,
        rate: saleData.rate,
        unit: 'kg',
        totalAmount: saleData.quantity * saleData.rate
      }],
      totalAmount: saleData.quantity * saleData.rate,
      barDanaProvided: saleData.barDanaProvided,
      barDanaAmount: saleData.barDanaAmount || 0,
      finalAmount: saleData.barDanaProvided ? 
        (saleData.quantity * saleData.rate) - (saleData.barDanaAmount || 0) : 
        saleData.quantity * saleData.rate,
      type: 'sale'
    };

    const updatedSales = [...sales, newSale];
    saveSales(updatedSales);

    // Update person balance
    const updatedPersons = persons.map(person => {
      if (person.id === saleData.personId) {
        return {
          ...person,
          balance: person.balance + newSale.finalAmount,
          barDana: saleData.barDanaProvided ? 
            person.barDana - (saleData.barDanaAmount || 0) : 
            person.barDana
        };
      }
      return person;
    });
    savePersons(updatedPersons);

    // Update product stock
    updateProductStock(saleData.productId, saleData.quantity, true);
    
    alert(`Sale recorded successfully! Amount: ₹${newSale.finalAmount}`);
  };

  // Quick Purchase Handler
  const handleQuickPurchase = (purchaseData) => {
    const newPurchase = {
      id: Date.now(),
      personId: purchaseData.personId,
      personName: persons.find(p => p.id === purchaseData.personId)?.name || 'Unknown',
      date: new Date().toISOString(),
      items: [{
        productId: purchaseData.productId,
        productName: products.find(p => p.id === purchaseData.productId)?.name || 'Unknown',
        quantity: purchaseData.quantity,
        rate: purchaseData.rate,
        unit: 'kg',
        totalAmount: purchaseData.quantity * purchaseData.rate
      }],
      totalAmount: purchaseData.quantity * purchaseData.rate,
      barDanaProvided: purchaseData.barDanaProvided,
      barDanaAmount: purchaseData.barDanaAmount || 0,
      finalAmount: purchaseData.barDanaProvided ? 
        (purchaseData.quantity * purchaseData.rate) - (purchaseData.barDanaAmount || 0) : 
        purchaseData.quantity * purchaseData.rate,
      type: 'purchase'
    };

    const updatedPurchases = [...purchases, newPurchase];
    savePurchases(updatedPurchases);

    // Update person balance
    const updatedPersons = persons.map(person => {
      if (person.id === purchaseData.personId) {
        return {
          ...person,
          balance: person.balance - newPurchase.finalAmount,
          barDana: purchaseData.barDanaProvided ? 
            person.barDana + (purchaseData.barDanaAmount || 0) : 
            person.barDana
        };
      }
      return person;
    });
    savePersons(updatedPersons);

    // Update product stock
    updateProductStock(purchaseData.productId, purchaseData.quantity, false);
    
    alert(`Purchase recorded successfully! Amount: ₹${newPurchase.finalAmount}`);
  };

  // Filter persons for search
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone?.includes(searchTerm) ||
    person.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setSearchTerm('');
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setShowPersonModal(true);
  };

  const handleViewPersonDetails = (person) => {
    setSelectedPerson(person);
    setShowPersonDetailModal(true);
  };

  // Calculate statistics
  const totalCustomers = persons.filter(p => p.type === 'customer').length;
  const totalSuppliers = persons.filter(p => p.type === 'supplier').length;
  const totalBalance = persons.reduce((sum, person) => sum + person.balance, 0);
  const totalProducts = products.length;
  const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0);
  const totalPurchasesAmount = purchases.reduce((sum, purchase) => sum + (purchase.finalAmount || 0), 0);

  // Custom Dropdown Component
  const CustomDropdown = ({ person }) => {
    return (
      <Dropdown>
        <Dropdown.Toggle 
          variant="outline-secondary" 
          size="sm"
          id={`dropdown-${person.id}`}
          className="dropdown-toggle-no-caret"
        >
          <FaEllipsisV />
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow-sm border-0">
          <Dropdown.Item 
            onClick={() => handleViewPersonDetails(person)}
            className="d-flex align-items-center"
          >
            <FaEye className="me-2 text-primary" />
            View Details
          </Dropdown.Item>
          <Dropdown.Item 
            onClick={() => handleEditPerson(person)}
            className="d-flex align-items-center"
          >
            <FaEdit className="me-2 text-success" />
            Edit
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item 
            onClick={() => handleDeletePerson(person.id)}
            className="d-flex align-items-center text-danger"
          >
            <FaTrash className="me-2" />
            Delete
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Header with Stats */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold text-primary mb-1">📒 Khata Management</h1>
              <p className="text-muted mb-0">Complete business account management system</p>
            </div>
            <div className="d-flex gap-3">
              <div className="text-center">
                <div className="fs-4 fw-bold text-primary">{persons.length}</div>
                <small className="text-muted">Total Persons</small>
              </div>
              <div className="text-center">
                <div className="fs-4 fw-bold text-success">{totalProducts}</div>
                <small className="text-muted">Products</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card border-0 bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fs-2 fw-bold">{totalCustomers}</div>
                  <div>Customers</div>
                </div>
                <FaUsers className="fs-1 opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card border-0 bg-warning text-dark">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fs-2 fw-bold">{totalSuppliers}</div>
                  <div>Suppliers</div>
                </div>
                <FaShoppingBag className="fs-1 opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card border-0 bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fs-2 fw-bold">
                    <FaRupeeSign className="me-1" />
                    {Math.abs(totalBalance)}
                  </div>
                  <div>Net Balance</div>
                </div>
                <FaRupeeSign className="fs-1 opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card border-0 bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fs-2 fw-bold">{totalProducts}</div>
                  <div>Products</div>
                </div>
                <FaBox className="fs-1 opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">🚀 Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap">
                <Button 
                  variant="success" 
                  size="lg"
                  className="d-flex align-items-center"
                  onClick={() => setShowQuickSaleModal(true)}
                >
                  <FaPlus className="me-2" />
                  Quick Sale
                </Button>
                <Button 
                  variant="info" 
                  size="lg"
                  className="d-flex align-items-center"
                  onClick={() => setShowQuickPurchaseModal(true)}
                >
                  <FaPlus className="me-2" />
                  Quick Purchase
                </Button>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="d-flex align-items-center"
                  onClick={() => {
                    setEditingPerson(null);
                    setShowPersonModal(true);
                  }}
                >
                  <FaPlus className="me-2" />
                  Add Person
                </Button>
                <Button 
                  variant="warning" 
                  size="lg"
                  className="d-flex align-items-center"
                  onClick={() => setShowProductModal(true)}
                >
                  <FaPlus className="me-2" />
                  Add Product
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Actions Bar */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search persons by name, phone, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <div className="d-flex gap-2 justify-content-end">
            <Badge bg="success" className="fs-6 p-2">
              Sales: ₹{totalSalesAmount}
            </Badge>
            <Badge bg="info" className="fs-6 p-2">
              Purchases: ₹{totalPurchasesAmount}
            </Badge>
          </div>
        </Col>
      </Row>

      {/* Search Results */}
      {searchTerm && filteredPersons.length > 0 && (
        <Row className="mb-3">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0">Search Results ({filteredPersons.length})</h6>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredPersons.map(person => (
                  <div 
                    key={person.id}
                    className="p-3 border-bottom search-result-item"
                    onClick={() => handlePersonSelect(person)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className={`avatar-sm me-3 ${person.type === 'customer' ? 'bg-success' : 'bg-warning'}`}>
                          {person.type === 'customer' ? 'C' : 'S'}
                        </div>
                        <div>
                          <h6 className="mb-1">{person.name}</h6>
                          <small className="text-muted">
                            {person.phone} • {person.type}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className={`fw-bold ${person.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                          <FaRupeeSign className="me-1" />
                          {person.balance}
                        </div>
                        <Badge bg="warning" text="dark">
                          <FaRupeeSign className="me-1" />
                          {person.barDana}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content Tabs */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-0">
          <Nav variant="tabs" className="border-0">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className="fw-bold text-dark"
              >
                📊 Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'sales'}
                onClick={() => setActiveTab('sales')}
                className="fw-bold text-dark"
              >
                💰 Sales Khata
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'purchase'}
                onClick={() => setActiveTab('purchase')}
                className="fw-bold text-dark"
              >
                🛒 Purchase Khata
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body className="p-4">
          {activeTab === 'overview' && (
            <OverviewTab 
              persons={persons}
              products={products}
              selectedPerson={selectedPerson}
              onPersonSelect={setSelectedPerson}
              CustomDropdown={CustomDropdown}
            />
          )}
          
          {(activeTab === 'sales' || activeTab === 'purchase') && !selectedPerson && (
            <div className="text-center py-5">
              <FaUsers className="display-1 text-muted mb-3" />
              <h4 className="text-muted">No Person Selected</h4>
              <p className="text-muted">Please select a person from the overview tab to continue</p>
              <Button 
                variant="primary" 
                onClick={() => setActiveTab('overview')}
              >
                Go to Overview
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* All Modals */}
      <PersonModal 
        show={showPersonModal}
        onHide={() => {
          setShowPersonModal(false);
          setEditingPerson(null);
        }}
        onAddPerson={handleAddPerson}
        onUpdatePerson={handleUpdatePerson}
        editingPerson={editingPerson}
      />

      <ProductModal 
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        onAddProduct={handleAddProduct}
      />

      <PersonDetailModal 
        show={showPersonDetailModal}
        onHide={() => setShowPersonDetailModal(false)}
        person={selectedPerson}
        sales={sales}
        purchases={purchases}
        onEdit={() => {
          setShowPersonDetailModal(false);
          handleEditPerson(selectedPerson);
        }}
        onDelete={() => {
          setShowPersonDetailModal(false);
          handleDeletePerson(selectedPerson.id);
        }}
      />

      <QuickSaleModal 
        show={showQuickSaleModal}
        onHide={() => setShowQuickSaleModal(false)}
        persons={persons}
        products={products}
        onQuickSale={handleQuickSale}
      />

      <QuickPurchaseModal 
        show={showQuickPurchaseModal}
        onHide={() => setShowQuickPurchaseModal(false)}
        persons={persons}
        products={products}
        onQuickPurchase={handleQuickPurchase}
      />

      <style jsx>{`
        .stat-card {
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .search-result-item:hover {
          background-color: #f8f9fa;
        }
        .avatar-sm {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }
      `}</style>
    </Container>
  );
};

// Overview Tab Component
const OverviewTab = ({ 
  persons, 
  products, 
  selectedPerson, 
  onPersonSelect, 
  CustomDropdown
}) => {
  return (
    <div>
      {/* Persons Section */}
      <Row className="mb-5">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">👥 Persons Management</h4>
            <Badge bg="primary" pill>{persons.length} Persons</Badge>
          </div>
          
          {persons.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaUsers className="display-4 text-muted mb-3" />
                <h5 className="text-muted">No Persons Added</h5>
                <p className="text-muted">Add your first customer or supplier to get started</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {persons.map(person => (
                <Col md={6} lg={4} key={person.id} className="mb-3">
                  <Card className={`h-100 person-card ${selectedPerson?.id === person.id ? 'border-primary' : ''}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <div className={`avatar me-3 ${person.type === 'customer' ? 'bg-success' : 'bg-warning'}`}>
                            {person.type === 'customer' ? 'C' : 'S'}
                          </div>
                          <div>
                            <h6 className="mb-1">{person.name}</h6>
                            <Badge bg={person.type === 'customer' ? 'success' : 'warning'}>
                              {person.type}
                            </Badge>
                          </div>
                        </div>
                        <CustomDropdown person={person} />
                      </div>
                      
                      <div className="mb-3">
                        {person.phone && (
                          <div className="text-muted small mb-1">
                            📞 {person.phone}
                          </div>
                        )}
                        {person.email && (
                          <div className="text-muted small mb-1">
                            ✉️ {person.email}
                          </div>
                        )}
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className={`fw-bold ${person.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            <FaRupeeSign className="me-1" />
                            {person.balance}
                          </div>
                          <small className="text-muted">Balance</small>
                        </div>
                        <div>
                          <div className="text-warning fw-bold">
                            <FaRupeeSign className="me-1" />
                            {person.barDana}
                          </div>
                          <small className="text-muted">Bar Dana</small>
                        </div>
                        <Button 
                          variant={selectedPerson?.id === person.id ? "primary" : "outline-primary"}
                          size="sm"
                          onClick={() => onPersonSelect(person)}
                        >
                          {selectedPerson?.id === person.id ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Products Section */}
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">📦 Products Inventory</h4>
            <Badge bg="success" pill>{products.length} Products</Badge>
          </div>
          
          {products.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaBox className="display-4 text-muted mb-3" />
                <h5 className="text-muted">No Products Added</h5>
                <p className="text-muted">Add products to manage your inventory</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {products.map(product => (
                <Col md={6} lg={4} key={product.id} className="mb-3">
                  <Card className="h-100 product-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="mb-0 text-truncate">{product.name}</h6>
                        <FaBox className="text-muted" />
                      </div>
                      
                      {product.category && (
                        <Badge bg="secondary" className="mb-2">
                          {product.category}
                        </Badge>
                      )}
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Price:</span>
                          <span className="fw-bold text-success">
                            <FaRupeeSign className="me-1" />
                            {product.price}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Stock:</span>
                          <span className="fw-bold text-primary">
                            {product.variants?.[0]?.unit || '0 Man + 0 Kg'}
                          </span>
                        </div>
                      </div>
                      
                      {product.description && (
                        <div className="text-muted small mb-3">
                          {product.description}
                        </div>
                      )}
                      
                      <div className="stock-bar">
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ 
                              width: `${Math.min((product.variants?.[0]?.stock || 0) / 100 * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          {product.variants?.[0]?.stock || 0} kg in stock
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      <style jsx>{`
        .person-card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .product-card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 14px;
        }
        .stock-bar {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

// Person Modal Component
const PersonModal = ({ show, onHide, onAddPerson, onUpdatePerson, editingPerson }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer',
    phone: '',
    email: '',
    address: '',
    balance: 0,
    barDana: 0
  });

  useEffect(() => {
    if (editingPerson) {
      setFormData(editingPerson);
    } else {
      setFormData({
        name: '',
        type: 'customer',
        phone: '',
        email: '',
        address: '',
        balance: 0,
        barDana: 0
      });
    }
  }, [editingPerson, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPerson) {
      onUpdatePerson(formData);
    } else {
      onAddPerson(formData);
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editingPerson ? 'Edit Person' : 'Add New Person'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type *</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="person@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Enter complete address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Initial Balance</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Bar Dana Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.barDana}
                  onChange={(e) => setFormData({...formData, barDana: parseFloat(e.target.value) || 0})}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit">
            {editingPerson ? 'Update Person' : 'Add Person'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Product Modal Component
const ProductModal = ({ show, onHide, onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    stock: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct(formData);
    setFormData({ name: '', category: '', price: 0, description: '', stock: 0 });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Product</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Grains, Spices, etc."
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Price per Unit (₹)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Product description..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </Form.Group>

          <Card className="bg-light">
            <Card.Header>
              <h6 className="mb-0">Stock Information</h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Initial Stock (Kg)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                />
                <Form.Text className="text-muted">
                  {Math.floor(formData.stock / 40)} Man + {formData.stock % 40} Kg
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="success" type="submit">Add Product</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Person Detail Modal Component
const PersonDetailModal = ({ show, onHide, person, sales, purchases, onEdit, onDelete }) => {
  if (!person) return null;

  // Get person's transaction history
  const personSales = sales.filter(sale => sale.personId === person.id);
  const personPurchases = purchases.filter(purchase => purchase.personId === person.id);
  const allTransactions = [
    ...personSales.map(s => ({ ...s, type: 'sale' })),
    ...personPurchases.map(p => ({ ...p, type: 'purchase' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalSales = personSales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0);
  const totalPurchases = personPurchases.reduce((sum, purchase) => sum + (purchase.finalAmount || 0), 0);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaEye className="me-2" />
          Person Details - {person.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Personal Information */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Personal Information</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Name:</strong> {person.name}
                </div>
                <div className="mb-3">
                  <strong>Type:</strong> 
                  <Badge bg={person.type === 'customer' ? 'success' : 'warning'} className="ms-2">
                    {person.type}
                  </Badge>
                </div>
                {person.phone && (
                  <div className="mb-3">
                    <FaPhone className="me-2 text-muted" />
                    <strong>Phone:</strong> {person.phone}
                  </div>
                )}
                {person.email && (
                  <div className="mb-3">
                    <FaEnvelope className="me-2 text-muted" />
                    <strong>Email:</strong> {person.email}
                  </div>
                )}
                {person.address && (
                  <div className="mb-3">
                    <FaMapMarkerAlt className="me-2 text-muted" />
                    <strong>Address:</strong> {person.address}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Financial Summary</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Current Balance:</strong>
                  <div className={`fs-4 fw-bold ${person.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    <FaRupeeSign className="me-1" />
                    {person.balance}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Bar Dana:</strong>
                  <div className="text-warning fw-bold fs-5">
                    <FaRupeeSign className="me-1" />
                    {person.barDana}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Total Sales:</strong>
                  <div className="text-success fw-bold">
                    <FaRupeeSign className="me-1" />
                    {totalSales}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Total Purchases:</strong>
                  <div className="text-info fw-bold">
                    <FaRupeeSign className="me-1" />
                    {totalPurchases}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Transaction History */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">Transaction History</h6>
          </Card.Header>
          <Card.Body>
            {allTransactions.length === 0 ? (
              <div className="text-center py-4">
                <FaHistory className="display-4 text-muted mb-3" />
                <h5 className="text-muted">No Transactions</h5>
                <p className="text-muted">This person has no transaction history yet</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Bar Dana</th>
                      <th>Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.slice(0, 10).map((transaction, idx) => (
                      <tr key={idx}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={transaction.type === 'sale' ? 'success' : 'info'}>
                            {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                          </Badge>
                        </td>
                        <td className="fw-bold">
                          <FaRupeeSign className="me-1" />
                          {transaction.finalAmount}
                        </td>
                        <td>
                          {transaction.barDanaProvided ? (
                            <Badge bg="warning">
                              <FaRupeeSign className="me-1" />
                              {transaction.barDanaAmount}
                            </Badge>
                          ) : 'None'}
                        </td>
                        <td>{transaction.items?.length || 0} items</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={onDelete}>
          <FaTrash className="me-2" />
          Delete
        </Button>
        <Button variant="outline-primary" onClick={onEdit}>
          <FaEdit className="me-2" />
          Edit
        </Button>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Quick Sale Modal Component
const QuickSaleModal = ({ show, onHide, persons, products, onQuickSale }) => {
  const [formData, setFormData] = useState({
    personId: '',
    productId: '',
    quantity: '',
    rate: '',
    barDanaProvided: false,
    barDanaAmount: 0
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.personId) newErrors.personId = 'Please select a customer';
    if (!formData.productId) newErrors.productId = 'Please select a product';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Please enter valid quantity';
    if (!formData.rate || formData.rate <= 0) newErrors.rate = 'Please enter valid rate';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check stock availability
    const selectedProduct = products.find(p => p.id == formData.productId);
    if (selectedProduct && (selectedProduct.variants?.[0]?.stock || 0) < parseFloat(formData.quantity)) {
      setErrors({ 
        quantity: `Insufficient stock! Available: ${selectedProduct.variants?.[0]?.stock || 0} kg` 
      });
      return;
    }

    onQuickSale({
      ...formData,
      quantity: parseFloat(formData.quantity),
      rate: parseFloat(formData.rate),
      barDanaAmount: formData.barDanaProvided ? parseFloat(formData.barDanaAmount) : 0
    });

    // Reset form
    setFormData({
      personId: '',
      productId: '',
      quantity: '',
      rate: '',
      barDanaProvided: false,
      barDanaAmount: 0
    });
    setErrors({});
    onHide();
  };

  const calculateTotal = () => {
    if (!formData.quantity || !formData.rate) return 0;
    return parseFloat(formData.quantity) * parseFloat(formData.rate);
  };

  const calculateFinalAmount = () => {
    const total = calculateTotal();
    return formData.barDanaProvided ? total - (parseFloat(formData.barDanaAmount) || 0) : total;
  };

  const selectedProduct = products.find(p => p.id == formData.productId);
  const selectedPerson = persons.find(p => p.id == formData.personId);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <FaShoppingCart className="me-2" />
          Quick Sale
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Customer *</Form.Label>
                <Form.Select 
                  value={formData.personId}
                  onChange={(e) => setFormData({...formData, personId: e.target.value})}
                  isInvalid={!!errors.personId}
                >
                  <option value="">Choose customer...</option>
                  {persons.filter(p => p.type === 'customer').map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name} (Balance: ₹{person.balance})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.personId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Product *</Form.Label>
                <Form.Select 
                  value={formData.productId}
                  onChange={(e) => {
                    setFormData({...formData, productId: e.target.value});
                    const product = products.find(p => p.id == e.target.value);
                    if (product) {
                      setFormData(prev => ({...prev, rate: product.price || ''}));
                    }
                  }}
                  isInvalid={!!errors.productId}
                >
                  <option value="">Choose product...</option>
                  {products
                    .filter(product => (product.variants?.[0]?.stock || 0) > 0)
                    .map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.variants?.[0]?.unit})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.productId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity (kg) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity}
                </Form.Control.Feedback>
                {selectedProduct && (
                  <Form.Text className="text-muted">
                    Available: {selectedProduct.variants?.[0]?.stock || 0} kg
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Rate (₹/kg) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Enter rate"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                  isInvalid={!!errors.rate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.rate}
                </Form.Control.Feedback>
                {selectedProduct && (
                  <Form.Text className="text-muted">
                    Product price: ₹{selectedProduct.price}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Form.Check
            type="checkbox"
            label="Bar Dana Provided"
            checked={formData.barDanaProvided}
            onChange={(e) => setFormData({...formData, barDanaProvided: e.target.checked})}
            className="mb-3"
          />

          {formData.barDanaProvided && (
            <Form.Group className="mb-3">
              <Form.Label>Bar Dana Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter bar dana amount"
                value={formData.barDanaAmount}
                onChange={(e) => setFormData({...formData, barDanaAmount: e.target.value})}
                max={calculateTotal()}
              />
              <Form.Text className="text-muted">
                Maximum: ₹{calculateTotal()}
              </Form.Text>
            </Form.Group>
          )}

          {/* Summary Card */}
          {(formData.quantity && formData.rate) && (
            <Card className="bg-light">
              <Card.Body>
                <h6 className="mb-3">Sale Summary</h6>
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Customer:</strong> {selectedPerson?.name || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Product:</strong> {selectedProduct?.name || 'N/A'}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {formData.quantity} kg
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Total Amount:</strong> 
                      <span className="fw-bold text-success ms-2">
                        <FaRupeeSign className="me-1" />
                        {calculateTotal()}
                      </span>
                    </div>
                    {formData.barDanaProvided && (
                      <div className="mb-2">
                        <strong>Bar Dana:</strong> 
                        <span className="fw-bold text-warning ms-2">
                          - <FaRupeeSign className="me-1" />
                          {formData.barDanaAmount || 0}
                        </span>
                      </div>
                    )}
                    <div>
                      <strong>Final Amount:</strong> 
                      <span className="fw-bold text-primary ms-2">
                        <FaRupeeSign className="me-1" />
                        {calculateFinalAmount()}
                      </span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Alert variant="info" className="small mt-3">
            <strong>Note:</strong> This sale will increase customer's balance and decrease product stock.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="success" type="submit">
            Complete Sale
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Quick Purchase Modal Component
const QuickPurchaseModal = ({ show, onHide, persons, products, onQuickPurchase }) => {
  const [formData, setFormData] = useState({
    personId: '',
    productId: '',
    quantity: '',
    rate: '',
    barDanaProvided: false,
    barDanaAmount: 0
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.personId) newErrors.personId = 'Please select a supplier';
    if (!formData.productId) newErrors.productId = 'Please select a product';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Please enter valid quantity';
    if (!formData.rate || formData.rate <= 0) newErrors.rate = 'Please enter valid rate';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onQuickPurchase({
      ...formData,
      quantity: parseFloat(formData.quantity),
      rate: parseFloat(formData.rate),
      barDanaAmount: formData.barDanaProvided ? parseFloat(formData.barDanaAmount) : 0
    });

    // Reset form
    setFormData({
      personId: '',
      productId: '',
      quantity: '',
      rate: '',
      barDanaProvided: false,
      barDanaAmount: 0
    });
    setErrors({});
    onHide();
  };

  const calculateTotal = () => {
    if (!formData.quantity || !formData.rate) return 0;
    return parseFloat(formData.quantity) * parseFloat(formData.rate);
  };

  const calculateFinalAmount = () => {
    const total = calculateTotal();
    return formData.barDanaProvided ? total - (parseFloat(formData.barDanaAmount) || 0) : total;
  };

  const selectedProduct = products.find(p => p.id == formData.productId);
  const selectedPerson = persons.find(p => p.id == formData.personId);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>
          <FaTruck className="me-2" />
          Quick Purchase
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Supplier *</Form.Label>
                <Form.Select 
                  value={formData.personId}
                  onChange={(e) => setFormData({...formData, personId: e.target.value})}
                  isInvalid={!!errors.personId}
                >
                  <option value="">Choose supplier...</option>
                  {persons.filter(p => p.type === 'supplier').map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name} (Balance: ₹{person.balance})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.personId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Product *</Form.Label>
                <Form.Select 
                  value={formData.productId}
                  onChange={(e) => {
                    setFormData({...formData, productId: e.target.value});
                    const product = products.find(p => p.id == e.target.value);
                    if (product) {
                      setFormData(prev => ({...prev, rate: product.price || ''}));
                    }
                  }}
                  isInvalid={!!errors.productId}
                >
                  <option value="">Choose product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Current: {product.variants?.[0]?.unit})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.productId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity (kg) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Rate (₹/kg) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Enter rate"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                  isInvalid={!!errors.rate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.rate}
                </Form.Control.Feedback>
                {selectedProduct && (
                  <Form.Text className="text-muted">
                    Product price: ₹{selectedProduct.price}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Form.Check
            type="checkbox"
            label="Bar Dana Provided to Supplier"
            checked={formData.barDanaProvided}
            onChange={(e) => setFormData({...formData, barDanaProvided: e.target.checked})}
            className="mb-3"
          />

          {formData.barDanaProvided && (
            <Form.Group className="mb-3">
              <Form.Label>Bar Dana Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter bar dana amount"
                value={formData.barDanaAmount}
                onChange={(e) => setFormData({...formData, barDanaAmount: e.target.value})}
                max={calculateTotal()}
              />
              <Form.Text className="text-muted">
                Maximum: ₹{calculateTotal()}
              </Form.Text>
            </Form.Group>
          )}

          {/* Summary Card */}
          {(formData.quantity && formData.rate) && (
            <Card className="bg-light">
              <Card.Body>
                <h6 className="mb-3">Purchase Summary</h6>
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Supplier:</strong> {selectedPerson?.name || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Product:</strong> {selectedProduct?.name || 'N/A'}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {formData.quantity} kg
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Total Amount:</strong> 
                      <span className="fw-bold text-success ms-2">
                        <FaRupeeSign className="me-1" />
                        {calculateTotal()}
                      </span>
                    </div>
                    {formData.barDanaProvided && (
                      <div className="mb-2">
                        <strong>Bar Dana:</strong> 
                        <span className="fw-bold text-warning ms-2">
                          - <FaRupeeSign className="me-1" />
                          {formData.barDanaAmount || 0}
                        </span>
                      </div>
                    )}
                    <div>
                      <strong>Final Amount:</strong> 
                      <span className="fw-bold text-primary ms-2">
                        <FaRupeeSign className="me-1" />
                        {calculateFinalAmount()}
                      </span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Alert variant="info" className="small mt-3">
            <strong>Note:</strong> This purchase will decrease supplier's balance and increase product stock.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="info" type="submit">
            Complete Purchase
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default KhataSystem;