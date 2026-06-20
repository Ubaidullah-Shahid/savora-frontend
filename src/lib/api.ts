import axios from "axios";

// ─── Axios instance — baseURL points to your Express backend ─────────────
const api = axios.create({
  baseURL: "https://savora-backend-production.up.railway.app",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = localStorage.getItem("savora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If token expired → clear and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
       if (typeof window === "undefined") return Promise.reject(err);
      localStorage.removeItem("savora_token");
      localStorage.removeItem("savora_role");
      localStorage.removeItem("savora_name");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Session helpers used across the whole app ────────────────────────────
export const session = {
  save: (token: string, user: { role: string; name: string }) => {
    if (typeof window === "undefined") return ;
    localStorage.setItem("savora_token", token);
    localStorage.setItem("savora_role",  user.role);
    localStorage.setItem("savora_name",  user.name);
  },
  clear: () => {
     if (typeof window === "undefined") return ;
    localStorage.removeItem("savora_token");
    localStorage.removeItem("savora_role");
    localStorage.removeItem("savora_name");
  },
   token:    (): string | null => typeof window === "undefined" ? null : localStorage.getItem("savora_token"),
  role:     (): string | null => typeof window === "undefined" ? null : localStorage.getItem("savora_role"),
  name:     (): string | null => typeof window === "undefined" ? null : localStorage.getItem("savora_name"),
  loggedIn: (): boolean       => typeof window === "undefined" ? false : !!localStorage.getItem("savora_token"),
};
