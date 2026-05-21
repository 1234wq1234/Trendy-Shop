"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiGetOrders, apiUpdateOrderStatus } from "@/lib/api/client";
import { Order } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

const statuses: Array<Order["status"]> = ["Hazırlanıyor", "Kargoda", "Tamamlandı"];

export default function AdminOrdersPage() {
  const { token, role } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await apiGetOrders(token);
      setOrders(list);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Siparişler alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  if (role !== "ADMIN") return <div className="rounded-xl border bg-white p-6">Bu sayfa sadece admin içindir.</div>;
  if (loading) return <div className="rounded-xl border bg-white p-6">Yükleniyor...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">Sipariş Durum Yönetimi</h1>
      {!orders.length ? <div className="rounded-xl border bg-white p-6">Sipariş bulunamadı.</div> : null}
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-slate-700">{order.id}</p>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("tr-TR")}</p>
                <p className="text-sm font-semibold text-blue-700">Toplam: {order.totalPrice} TL</p>
                {order.fullName || order.phone ? (
                  <p className="mt-2 text-sm text-slate-600">
                    {[order.fullName, order.phone].filter(Boolean).join(" · ")}
                    {order.contactEmail ? ` · ${order.contactEmail}` : ""}
                  </p>
                ) : null}
                {order.city ? (
                  <p className="text-sm text-slate-600">
                    Adres: {[order.addressLine1, order.district, order.city, order.postalCode].filter(Boolean).join(", ")}
                  </p>
                ) : null}
                {order.paymentMethod ? <p className="text-sm text-slate-600">Ödeme: {order.paymentMethod}</p> : null}
                {order.invoiceType ? (
                  <p className="text-sm text-slate-600">
                    Fatura: {order.invoiceType} — {order.invoiceTitle}
                    {order.invoiceTaxId ? ` (VN: ${order.invoiceTaxId})` : ""}
                  </p>
                ) : null}
                {order.orderNote ? <p className="text-sm text-slate-500">Not: {order.orderNote}</p> : null}
              </div>
              <select
                value={order.status}
                onChange={async (e) => {
                  const status = e.target.value as Order["status"];
                  try {
                    await apiUpdateOrderStatus(token!, order.id, status);
                    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
                    toast.success("Sipariş durumu güncellendi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Durum güncellenemedi");
                  }
                }}
                className="rounded-lg border p-2 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
