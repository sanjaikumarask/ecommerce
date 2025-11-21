// simple helper: try to read username from local storage first, or decode JWT (no verification)
export const getCurrentUserFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    const username = localStorage.getItem("username");
    if (username) return { username };
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { username: payload.username || payload.email || payload.sub || null };
  } catch (e) {
    return null;
  }
};
