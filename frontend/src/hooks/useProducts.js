import { useEffect, useState } from "react";
import api from "../services/api";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/products/")
      .then(res => setProducts(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
