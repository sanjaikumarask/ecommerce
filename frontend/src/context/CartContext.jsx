import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  clearCart as apiClearCart,
} from "../services/api";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.items };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // -------------------------------
  // LOAD CART
  // -------------------------------
  const loadCart = async () => {
    try {
      const data = await getCart();  

      if (!data || typeof data !== "object") {
        dispatch({ type: "SET_CART", items: [] });
        return;
      }

      const items = Object.values(data).map((item) => ({
        id: item.product_id,           // ⭐ REAL PRODUCT ID
        product_id: item.product_id,   // ⭐ REQUIRED BY CheckoutPage
        sku: item.sku,
        name: item.name || "Unknown",
        price: Number(item.price || 0),
        qty: Number(item.qty || 0),
        image_url: item.image_url || null,
      }));

      dispatch({ type: "SET_CART", items });
    } catch (err) {
      console.error("Cart load failed:", err);
      dispatch({ type: "SET_CART", items: [] });
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // -------------------------------
  // ADD TO CART
  // -------------------------------
  const addToCart = async ({ sku, qty = 1 }) => {
    try {
      await apiAddToCart({ sku, qty });
      await loadCart();
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  // -------------------------------
  // CLEAR CART
  // -------------------------------
  const clearCart = async () => {
    try {
      await apiClearCart();
      await loadCart();
    } catch (err) {
      console.error("Clear cart failed:", err);
    }
  };

  const cartCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = state.items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: state.items,
        cartCount,
        cartTotal,
        addToCart,
        clearCart,
        reloadCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
