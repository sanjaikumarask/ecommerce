import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();

  // If cart empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>You haven't added anything yet</p>
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart</h1>

        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.sku} className="cart-item">

              <img
                src={item.image_url || "https://via.placeholder.com/100"}
                alt={item.name}
                className="cart-item-image"
                onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
              />

              <div className="cart-item-info">
                <h3>{item.name || item.sku}</h3>
                <p className="cart-item-price">₹{Number(item.price).toFixed(2)}</p>
                <p className="cart-item-qty">Qty: {item.qty}</p>
              </div>

              <div className="cart-item-total">
                ₹{(item.qty * item.price).toFixed(2)}
              </div>

            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          <div className="cart-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (window.confirm("Clear cart?")) clearCart();
              }}
            >
              Clear Cart
            </button>

            <Link to="/checkout" className="btn btn-primary btn-checkout">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
