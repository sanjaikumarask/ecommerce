import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../services/api"; // helper we'll add to api updates
import "./SearchBar.css";

const SearchBar = () => {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const doSearch = async (term) => {
    if (!term || term.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchProducts(term);
      // normalize common shapes
      const hits = Array.isArray(results) ? results : (results.results || results.products || []);
      setSuggestions(hits.slice(0, 6));
      setOpen(true);
    } catch (err) {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const onChange = (e) => {
    const val = e.target.value;
    setQ(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 280);
  };

  const handleSelect = (p) => {
    setQ("");
    setSuggestions([]);
    setOpen(false);
    // route to product detail
    navigate(`/products/${p.id || p.pk || p.sku}`);
  };

  return (
    <div className="searchbar-wrapper">
      <div className="searchbar">
        <input
          type="search"
          placeholder="Search products..."
          value={q}
          onChange={onChange}
          onFocus={() => { if (suggestions.length) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((p) => (
            <div key={p.id || p.sku || p.pk} className="suggestion" onClick={() => handleSelect(p)}>
              <img src={p.image_url ? p.image_url : "https://via.placeholder.com/48"} alt={p.name} />
              <div className="meta">
                <div className="name">{p.name}</div>
                <div className="price">₹{Number(p.price || 0).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
