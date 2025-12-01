import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar text-white p-3 vh-100" style={{ width: "220px" }}>
      <h3 className="text-center mb-5"></h3>
      <NavLink className="sidebar-link my-2" to="/">Dashboard</NavLink>
      <NavLink className="sidebar-link my-2" to="/products">Products</NavLink>
      <NavLink className="sidebar-link my-2" to="/khata">KhataSystem</NavLink>
    </div>
  );
};

export default Sidebar;
