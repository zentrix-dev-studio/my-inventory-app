import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="bg-dark text-white p-3 vh-100" style={{ width: "220px" }}>
      <h3 className="text-center">Inventory</h3>
      <NavLink className="sidebar-link my-2" to="/">Dashboard</NavLink>
      <NavLink className="sidebar-link my-2" to="/products">Products</NavLink>
      <NavLink className="sidebar-link my-2" to="/add-product">Add Product</NavLink>
    </div>
  );
};

export default Sidebar;
