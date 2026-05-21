"use client";

import { useEffect, useState } from "react";
import { apiGetOrders } from "@/lib/api/client";
import { Order } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

export default function OrdersPage() {
  const { token } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiGetOrders(token).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [token]);

  if (!token) return <p>Siparişler için giriş yapın.</p>;
  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-blue-700">Sipariş Geçmişi ve Takip</h1>
      {!orders.length ? <div className="rounded-xl border bg-white p-6">Henüz sipariş yok.</div> : null}
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border bg-white p-4">
          <p className="font-semibold font-mono text-sm text-slate-600">{order.id}</p>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("tr-TR")}</p>
          <p className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{order.status}</p>
          <p className="mt-2 font-bold text-blue-700">Toplam: {order.totalPrice} TL</p>
          {(order.fullName || order.city) && (
            <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
              {order.fullName ? <p>Alıcı: {order.fullName}</p> : null}
              {order.city ? (
                <p>
                  Teslimat: {[order.addressLine1, order.district, order.city].filter(Boolean).join(", ")}
                  {order.postalCode ? ` · ${order.postalCode}` : ""}
                </p>
              ) : null}
              {order.paymentMethod ? <p>Ödeme: {order.paymentMethod}</p> : null}
              {order.orderNote ? <p className="mt-1 text-slate-500">Not: {order.orderNote}</p> : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
