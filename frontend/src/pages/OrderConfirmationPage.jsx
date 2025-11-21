import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderTracker from "../components/OrderTracker"; // <-- ADD THIS
import "./OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p>Your order has been successfully placed.</p>

        <div className="order-details">
          <h3>Order Details</h3>
          <div className="detail-row">
            <span>Order ID:</span>
            <span>#{orderId}</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span>Processing</span>
          </div>
        </div>

        {/* 🔥 LIVE ORDER TRACKER SECTION (WEBSOCKET) */}
        <div style={{ marginTop: "30px" }}>
          <h2>Live Order Updates</h2>
          <OrderTracker orderId={orderId} />
        </div>

        <div className="confirmation-actions">
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
