import React from "react";

const Footer = () => {
  return (
    <footer className="footer py-3">
      <div className="container text-center">
        <span>&copy; {new Date().getFullYear()} Inventory App. All Rights Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
