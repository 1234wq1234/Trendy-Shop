import { Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

async function safeFetch(input: string, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("API sunucusuna baglanilamadi. `npm run dev:server` calisiyor mu kontrol edin.");
  }
}

export async function apiGetProducts(params: { brand?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params.brand && params.brand !== "all") qs.set("brand", params.brand);
  if (params.search) qs.set("search", params.search);
  const response = await safeFetch(`${API_URL}/products?${qs.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Ürünler alınamadı");
  return (await response.json()) as Product[];
}

export async function apiRegister(payload: {
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone?: string;
  password: string;
  role?: "ADMIN" | "USER";
}) {
  const response = await safeFetch(`${API_URL}/auth/register`, { method: "POST", headers: getHeaders(), body: JSON.stringify(payload) });
  if (!response.ok) throw new Error("Kayıt başarısız");
  return response.json();
}

export async function apiLogin(payload: { email: string; password: string }) {
  const response = await safeFetch(`${API_URL}/auth/login`, { method: "POST", headers: getHeaders(), body: JSON.stringify(payload) });
  if (!response.ok) throw new Error("Giriş başarısız");
  return response.json();
}

export async function apiGetCart(token: string) {
  const response = await safeFetch(`${API_URL}/cart`, { headers: getHeaders(token), cache: "no-store" });
  if (!response.ok) throw new Error("Sepet alınamadı");
  return response.json();
}

export async function apiAddCart(token: string, productId: string, quantity = 1) {
  const response = await safeFetch(`${API_URL}/cart`, { method: "POST", headers: getHeaders(token), body: JSON.stringify({ productId, quantity }) });
  if (!response.ok) throw new Error("Sepete eklenemedi");
  return response.json();
}

export async function apiDeleteCartItem(token: string, itemId: string) {
  const response = await safeFetch(`${API_URL}/cart/${itemId}`, { method: "DELETE", headers: getHeaders(token) });
  if (!response.ok) throw new Error("Ürün silinemedi");
}

export async function apiUpdateCartItem(token: string, itemId: string, quantity: number) {
  const response = await safeFetch(`${API_URL}/cart/${itemId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ quantity })
  });
  if (!response.ok) throw new Error("Miktar güncellenemedi");
  return response.json();
}

export async function apiGetFavorites(token: string) {
  const response = await safeFetch(`${API_URL}/favorites`, { headers: getHeaders(token), cache: "no-store" });
  if (!response.ok) throw new Error("Favoriler alınamadı");
  return response.json();
}

export async function apiToggleFavorite(token: string, productId: string, isFav: boolean) {
  const url = `${API_URL}/favorites${isFav ? `/${productId}` : ""}`;
  const response = await safeFetch(url, {
    method: isFav ? "DELETE" : "POST",
    headers: getHeaders(token),
    ...(isFav ? {} : { body: JSON.stringify({ productId }) })
  });
  if (!response.ok) throw new Error("Favori güncellenemedi");
  return response.json().catch(() => ({}));
}

export type CheckoutPayload = {
  items: { productId: string; quantity: number }[];
  fullName: string;
  phone: string;
  contactEmail: string;
  addressLine1: string;
  addressLine2?: string;
  district: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  invoiceType: string;
  invoiceTitle: string;
  invoiceTaxId?: string;
  invoiceTaxOffice?: string;
  invoiceAddress?: string;
  invoiceSameAsDelivery: boolean;
  orderNote?: string;
};

export async function apiCreateOrder(token: string, payload: CheckoutPayload) {
  const response = await safeFetch(`${API_URL}/orders`, { method: "POST", headers: getHeaders(token), body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await getErrorMessage(response, "Sipariş oluşturulamadı"));
  return response.json();
}

export async function apiGetOrders(token: string) {
  const response = await safeFetch(`${API_URL}/orders`, { headers: getHeaders(token), cache: "no-store" });
  if (!response.ok) throw new Error("Siparişler alınamadı");
  return response.json();
}

export async function apiUpdateOrderStatus(token: string, orderId: string, status: "Hazırlanıyor" | "Kargoda" | "Tamamlandı") {
  const response = await safeFetch(`${API_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error(await getErrorMessage(response, "Sipariş durumu güncellenemedi"));
  return response.json();
}

export async function apiAdminCreateProduct(token: string, payload: Partial<Product>) {
  const response = await safeFetch(`${API_URL}/products`, { method: "POST", headers: getHeaders(token), body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await getErrorMessage(response, "Ürün eklenemedi"));
  return response.json();
}

export async function apiAdminUpdateProduct(token: string, id: string, payload: Partial<Product>) {
  const response = await safeFetch(`${API_URL}/products/${id}`, { method: "PUT", headers: getHeaders(token), body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(await getErrorMessage(response, "Ürün güncellenemedi"));
  return response.json();
}

export async function apiAdminDeleteProduct(token: string, id: string) {
  const response = await safeFetch(`${API_URL}/products/${id}`, { method: "DELETE", headers: getHeaders(token) });
  if (!response.ok) throw new Error(await getErrorMessage(response, "Ürün silinemedi"));
}
