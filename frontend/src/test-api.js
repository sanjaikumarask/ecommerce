import api from "./api";

// Fetch orders
export const testAPI = async () => {
  try {
    const res = await api.get("/orders/");
    console.log("Orders:", res.data);
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
  }
};
