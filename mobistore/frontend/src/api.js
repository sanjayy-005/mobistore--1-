import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ms_token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default api;

export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n));

// Turn a DRF error response into a readable message.
export function errorText(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;
  if (!data) return err?.code === "ERR_NETWORK" ? "Can't reach the server. Is the Django backend running?" : fallback;
  if (typeof data === "string") return fallback;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  const msg = Array.isArray(first) ? first[0] : first;
  return typeof msg === "string" ? msg : fallback;
}

const BRAND_COLORS = {
  apple: "#8E8E93", samsung: "#1428A0", oneplus: "#EB0028", xiaomi: "#FF6900",
  vivo: "#415FFF", oppo: "#1D8A4E", realme: "#E8B800",
};

// Inline SVG phone used when a product has no photo yet.
export function placeholderImage(brandSlug = "", name = "") {
  const c = BRAND_COLORS[brandSlug] || "#3D4BFF";
  const label = name.replace(/&/g, "and").slice(0, 22);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 360'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c}'/><stop offset='1' stop-color='#0D1321'/></linearGradient></defs>
  <rect x='88' y='24' width='124' height='256' rx='22' fill='#10151f'/>
  <rect x='94' y='30' width='112' height='244' rx='17' fill='url(#g)'/>
  <rect x='132' y='36' width='36' height='8' rx='4' fill='#10151f'/>
  <circle cx='150' cy='150' r='30' fill='none' stroke='white' stroke-opacity='.35' stroke-width='3'/>
  <circle cx='150' cy='150' r='10' fill='white' fill-opacity='.35'/>
  <text x='150' y='318' font-family='Arial, sans-serif' font-size='15' font-weight='700' fill='#4b5565' text-anchor='middle'>${label}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
