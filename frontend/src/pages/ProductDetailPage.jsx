import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProduct, getMediaUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import fallbackImage from "../assets/products/fallback.jpg";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);
        if (!data || typeof data !== "object") {
          throw new Error("Invalid product response");
        }
        setProduct(data);
      } catch (err) {
        console.error("Product fetch failed:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      sku: product.sku || product.id, // RedisCart requires SKU
      qty: quantity,
    });

    alert("Product added to cart!");
  };

  if (loading) {
    return <div className="product-detail loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="product-detail">Product not found</div>;
  }

  const imageUrl =
    (product.image_url && getMediaUrl(product.image_url)) || fallbackImage;

  const price = Number(product.price || product.amount || 0);

  return (
    <div className="product-detail">
      <div className="product-detail-container">

        {/* IMAGE SECTION */}
        <div className="product-image-section">
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image-large"
            onError={(e) => (e.target.src = fallbackImage)}
          />
        </div>

        {/* INFO SECTION */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          <p className="product-price">₹{price.toFixed(2)}</p>

          <p className="product-category">
            Category: {product.category?.name || "Uncategorized"}
          </p>

          <p className="product-sku">SKU: {product.sku || product.id}</p>

          {/* DESCRIPTION */}
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || "No description available."}</p>
          </div>

          {/* ACTIONS */}
          <div className="product-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(!val || val < 1 ? 1 : val);
                }}
              />
            </div>

            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
