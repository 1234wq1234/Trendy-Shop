export type Role = "ADMIN" | "USER";

export interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  brand: string;
  size?: string;
  color?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "Hazırlanıyor" | "Kargoda" | "Tamamlandı";
  totalPrice: number;
  products: { id: string; productId: string; quantity: number; product: Product }[];
  fullName?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  district?: string | null;
  city?: string | null;
  postalCode?: string | null;
  paymentMethod?: string | null;
  invoiceType?: string | null;
  invoiceTitle?: string | null;
  invoiceTaxId?: string | null;
  invoiceTaxOffice?: string | null;
  invoiceAddress?: string | null;
  invoiceSameAsDelivery?: boolean | null;
  orderNote?: string | null;
}
