import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/api"; // we'll add this to api
import "./CategoriesDropdown.css";

const CategoriesDropdown = ({ onSelect = () => {} }) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        // data maybe array or object depending on endpoint - normalize
        const cats = Array.isArray(data) ? data : (data.results || data.categories || []);
        setCategories(cats);
      } catch (err) {
        setCategories([]);
      }
    };
    load();
  }, []);

  return (
    <div className="categories-dropdown" onMouseLeave={() => setOpen(false)}>
      <button className="cat-btn" onMouseEnter={() => setOpen(true)} onClick={() => setOpen((s) => !s)}>
        Categories ▾
      </button>

      {open && categories.length > 0 && (
        <div className="cat-panel">
          <ul>
            {categories.map((c) => (
              <li key={c.id || c.slug || c.name}>
                <Link to={`/products?category=${c.slug || c.name}`} onClick={() => { onSelect(); setOpen(false); }}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoriesDropdown;
