import React, { useState, useEffect } from "react";
import { getProducts, getCategories } from "../services/api";
import ProductCard from "../components/ProductCard";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("");

  // -------------------------------------------------------
  // Load full product list + all categories
  // -------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const productData = await getProducts();
        const categoryData = await getCategories();

        // Normalize list
        const list =
          Array.isArray(productData)
            ? productData
            : productData.results
            ? productData.results
            : productData.products
            ? productData.products
            : [];

        setProducts(list);
        setFilteredProducts(list);
        setCategories(categoryData || []);
      } catch (err) {
        console.error("Products load error:", err);
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // -------------------------------------------------------
  // Filtering + Search + Sorting
  // -------------------------------------------------------
  useEffect(() => {
    let list = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter((p) => p.category?.slug === selectedCategory);
    }

    // Sorting
    if (sortOption) {
      list.sort((a, b) => {
        const pa = parseFloat(a.price || 0);
        const pb = parseFloat(b.price || 0);

        switch (sortOption) {
          case "price-low":
            return pa - pb;
          case "price-high":
            return pb - pa;
          case "name-asc":
            return (a.name || "").localeCompare(b.name || "");
          case "name-desc":
            return (b.name || "").localeCompare(a.name || "");
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(list);
  }, [products, searchTerm, selectedCategory, sortOption]);

  if (loading)
    return (
      <div className="products-page">
        <div className="loading">Loading products...</div>
      </div>
    );

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Products</h1>

        <div className="filters">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {/* Category dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select"
          >
            <option value="">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
      </div>

      {/* Product cards */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <h2>No products found</h2>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
