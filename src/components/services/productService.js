import { v4 as uuidv4 } from "uuid";

let products = [
  { id: uuidv4(), name: "Product A", price: 100, quantity: 10 },
  { id: uuidv4(), name: "Product B", price: 200, quantity: 5 },
];

export const getProducts = () => products;

export const getProductById = (id) => products.find(p => p.id === id);

export const addProduct = (product) => {
  product.id = uuidv4();
  products.push(product);
};

export const updateProduct = (id, updatedProduct) => {
  products = products.map(p => (p.id === id ? updatedProduct : p));
};

export const deleteProduct = (id) => {
  products = products.filter(p => p.id !== id);
};
