import React from "react";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../services/api";
import fallbackImage from "../assets/products/fallback.jpg";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  if (!product) return null;

  // Normalize image
  const imageUrl = product.image_url
    ? getMediaUrl(product.image_url)
    : fallbackImage;

  const price = Number(product.price || product.amount || 0);

  return (
    <Link
      to={`/products/${product.id || product.pk}`}
      className="product-card"
    >
      <div className="product-card-image">
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => (e.target.src = fallbackImage)}
        />
      </div>

      <div className="product-card-info">
        <h3 className="product-name">{product.name}</h3>

        <p className="product-price">₹{price.toFixed(2)}</p>

        {product?.category?.name && (
          <span className="product-category">{product.category.name}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
