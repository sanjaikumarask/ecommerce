// src/services/cart.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Standardized addToCart: always use product_id, quantity, and user_id (guest or logged-in)
export const addToCart = async ({ product_id, quantity = 1, user_id }) => {
  if (!user_id) throw new Error("User ID or guest ID is required");

  const payload = {
    product_id,
    quantity,
    user_id,
  };

  const response = await axios.post(`${API_URL}/cart/add/`, payload);

  // Return standardized object for cart badge
  return {
    product_id: response.data.product_id,
    quantity: response.data.quantity || quantity,
    cart_id: response.data.id, // optional
  };
};

// Get cart items
export const getCart = async (user_id) => {
  if (!user_id) throw new Error("User ID or guest ID is required");

  const response = await axios.get(`${API_URL}/cart/`, {
    params: { user_id },
  });

  return response.data;
};
