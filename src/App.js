import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../src/components/pages/Dashboard";
import Products from "../src/components/pages/Products";
import AddProduct from "../src/components/pages/AddProduct";
import EditProduct from "../src/components/pages/EditProduct";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />

        <div className="main-area">
          <Header />

          {/* Page Content */}
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/edit-product/:id" element={<EditProduct />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
