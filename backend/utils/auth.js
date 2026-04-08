// src/utils/auth.js
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};

export const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export const startAutoLogout = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const expiry = getTokenExpiry(token);
  if (!expiry) return logout();

  const remaining = expiry - Date.now();

  if (remaining <= 0) {
    logout();
  } else {
    setTimeout(logout, remaining);
  }
};
