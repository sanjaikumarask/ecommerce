import axios from "axios";

// BASE URL — MUST end with 1 slash only
const API_BASE_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:8000/")
    .replace(/\/+$/, "/");

const MEDIA_BASE_URL =
  (process.env.REACT_APP_MEDIA_URL || "http://localhost:8000/media/")
    .replace(/\/+$/, "/");

// AXIOS INSTANCE
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// AUTH TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ERROR HANDLER
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// MEDIA URL
export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return MEDIA_BASE_URL + path.replace(/^\//, "");
};

// GUEST ID
const getGuestId = () => {
  let id = localStorage.getItem("guest_id");
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("guest_id", id);
  }
  return id;
};

// PRODUCTS ---------------
export const getProducts = async (params = {}) => {
  const res = await api.get("api/products/products/", { params });
  const data = res.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;

  return [];
};

export const getProduct = async (id) => {
  const res = await api.get(`api/products/products/${id}/`);
  return res.data;
};

// CATEGORIES ---------------
export const getCategories = async () => {
  try {
    const res = await api.get("api/products/categories/");
    return res.data;
  } catch {
    console.warn("Categories endpoint missing. Deriving from products...");

    const products = await getProducts();
    const seen = {};
    const out = [];

    products.forEach((p) => {
      if (p.category && !seen[p.category.slug]) {
        seen[p.category.slug] = true;
        out.push(p.category);
      }
    });

    return out;
  }
};

// SEARCH -------------------
export const searchProducts = async (query) => {
  if (!query.trim()) return [];

  const res = await api.get("api/products/products/", {
    params: { search: query },
  });

  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;

  return [];
};

// CART --------------------
export const getCart = async () => {
  const guest_id = getGuestId();
  return (await api.get(`api/cart/?guest_id=${guest_id}`)).data;
};

export const addToCart = async ({ sku, qty }) => {
  const guest_id = getGuestId();
  return (await api.post("api/cart/add/", { sku, qty, guest_id })).data;
};

export const clearCart = async () => {
  const guest_id = getGuestId();
  return (await api.post("api/cart/clear/", { guest_id })).data;
};




// ORDERS -------------------
export const createOrder = async (data) =>
  (await api.post("api/orders/", data)).data;

export const getOrders = async () =>
  (await api.get("api/orders/")).data;

export const getOrder = async (id) =>
  (await api.get(`api/orders/${id}/`)).data;

// AUTH ---------------------
export const login = async (creds) =>
  (await api.post("api/token/", creds)).data;

export const refreshToken = async (refresh) =>
  (await api.post("api/token/refresh/", { refresh })).data;

export default api;
