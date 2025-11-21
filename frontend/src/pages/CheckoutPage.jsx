import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createOrder } from "../services/api";

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalid";

    if (!formData.phone.trim()) newErrors.phone = "Phone required";
    if (!formData.address.trim()) newErrors.address = "Address required";
    if (!formData.city.trim()) newErrors.city = "City required";
    if (!formData.state.trim()) newErrors.state = "State required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // 1️⃣ Create order in Django
      const orderData = {
        items: cartItems.map((item) => ({
          product_id: Number(item.product_id || item.id),
          qty: Number(item.qty),
          price: Number(item.price).toFixed(2),
        })),
        total_amount: Number(cartTotal).toFixed(2),
        customer_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          shipping_address: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
          },
        },
      };

      const order = await createOrder(orderData);

      // 2️⃣ FIXED: SAFE API URL
      const API = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(
        /\/$/,
        ""
      );

      // 3️⃣ Generate Razorpay order
      const payRes = await axios.post(`${API}/api/payments/create-order/`, {
        order_id: order.id,
      });

      // 4️⃣ Razorpay Options
      const options = {
        key: payRes.data.key,
        amount: payRes.data.amount * 100,
        currency: "INR",
        name: "MyStore",
        description: `Order #${order.id}`,
        order_id: payRes.data.order_id,

        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },

        theme: { color: "#3399cc" },

        handler: function () {
          clearCart();
          navigate(`/order-confirmation/${order.id}`);
        },
      };

      if (!window.Razorpay) {
        alert("Payment SDK not loaded");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Payment could not start. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <div className="checkout-form">
          <h2>Shipping Information</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? "error" : ""}
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? "error" : ""}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "error" : ""}
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? "error" : ""}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? "error" : ""}
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={errors.state ? "error" : ""}
                />
              </div>

              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className={errors.zipCode ? "error" : ""}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay ₹${cartTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.product_id || item.id} className="summary-item">
                <img
                  src={item.image_url || require("../assets/products/fallback.jpg")}
                  alt={item.name}
                  className="summary-item-image"
                />
                <div>
                  <h4>{item.name}</h4>
                  <p>Qty: {item.qty}</p>
                  <p className="price">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
