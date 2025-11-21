import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import fallbackImg from "../assets/products/fallback.jpg";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="products">
      {products.map((product) => {
        const imageUrl = product.image
          ? `${process.env.REACT_APP_MEDIA_URL}${product.image}`
          : fallbackImg;

        return (
          <div key={product.id} className="product-card">
            <img src={imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>{product.category?.name}</p>
          </div>
        );
      })}
    </div>
  );
}
