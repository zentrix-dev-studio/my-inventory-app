import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaHome, FaBoxOpen, FaPlusCircle } from "react-icons/fa";

const Header = () => {
  return (
    <Navbar expand="lg" className="custom-navbar mb-4 d-flex align-items-center">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-title">Inventory App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/"><FaHome /> Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/products"><FaBoxOpen /> Products</Nav.Link>
            <Nav.Link as={Link} to="/add-product"><FaPlusCircle /> Add Product</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
