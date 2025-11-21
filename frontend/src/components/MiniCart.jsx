import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./MiniCart.css";

const MiniCart = ({ open, onClose }) => {
  const { cartItems, cartTotal, clearCart } = useCart();

  if (!open) return null;

  return (
    <div className="minicart-overlay" onClick={onClose}>
      <div className="minicart" onClick={(e) => e.stopPropagation()}>
        <div className="minicart-header">
          <h4>Your Cart</h4>
          <button className="close" onClick={onClose}>×</button>
        </div>

        <div className="minicart-body">
          {(!cartItems || cartItems.length === 0) ? (
            <div className="empty">Your cart is empty.</div>
          ) : (
            <>
              <ul className="minicart-list">
                {cartItems.map((it) => (
                  <li key={it.id} className="minicart-item">
                    <img src={it.image_url || "https://via.placeholder.com/60"} alt={it.name} />
                    <div className="meta">
                      <div className="name">{it.name}</div>
                      <div className="qty">Qty: {it.qty}</div>
                      <div className="price">₹{(it.price || 0).toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="minicart-summary">
                <div className="row">
                  <span>Subtotal</span>
                  <span>₹{Number(cartTotal || 0).toFixed(2)}</span>
                </div>

                <div className="actions">
                  <button className="btn btn-secondary" onClick={() => { if (window.confirm("Clear cart?")) clearCart(); }}>
                    Clear
                  </button>
                  <Link to="/cart" className="btn btn-primary" onClick={onClose}>
                    View Cart
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
