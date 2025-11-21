import React, { useEffect, useState } from "react";
import { getProducts, getCategories, getMediaUrl } from "../services/api";
import { Link } from "react-router-dom";
import fallbackImage from "../assets/products/fallback.jpg";
import HomeCarousel from "../components/HomeCarousel";
import "./HomePage.css";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const productData = await getProducts();
        const categoryData = await getCategories();

        const list = Array.isArray(productData)
          ? productData
          : productData.results || productData.products || [];

        setProducts(list.slice(0, 2)); // ⭐ SHOW ONLY 2 FEATURED PRODUCTS
        setCategories(categoryData || []);
      } catch (err) {
        console.error("HomePage load error:", err);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="home-page loading">
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="home-page">

      {/* -------------------- CAROUSEL -------------------- */}
      <section className="carousel-section">
        <HomeCarousel />
      </section>

      {/* -------------------- FEATURED PRODUCTS -------------------- */}
      <section className="featured">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="view-all">View All</Link>
        </div>

        <div className="products-grid featured-two">
          {products.map((product) => {
            const img = product.image_url
              ? getMediaUrl(product.image_url)
              : fallbackImage;

            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="product-card"
              >
                <img
                  src={img}
                  alt={product.name}
                  onError={(e) => (e.target.src = fallbackImage)}
                />
                <h3>{product.name}</h3>
                <p>₹{Number(product.price || 0).toFixed(2)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* -------------------- CATEGORIES -------------------- */}
      <section className="categories">
        <div className="section-header">
          <h2>Shop by Category</h2>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="category-card"
            >
              <h3>{cat.name}</h3>
              <p>Explore items</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
