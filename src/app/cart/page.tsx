"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
import { apiDeleteCartItem, apiGetCart, apiUpdateCartItem } from "@/lib/api/client";
import { CartItem } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

export default function CartPage() {
  const { token, setCartCount } = useAppStore();
  const [items, setItems] = useState<CartItem[]>([]);

  const load = async () => {
    if (!token) return;
    try {
      const cart = await apiGetCart(token);
      const filtered = (cart.products || []).filter((item: CartItem) => item.product.image.startsWith("/images/"));
      setItems(filtered);
      setCartCount(filtered.reduce((acc: number, item: CartItem) => acc + item.quantity, 0));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sepet yüklenemedi");
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const remove = async (itemId: string) => {
    if (!token) return;
    const previous = items;
    const next = items.filter((x) => x.id !== itemId);
    setItems(next);
    setCartCount(next.reduce((acc, x) => acc + x.quantity, 0));
    try {
      await apiDeleteCartItem(token, itemId);
      toast.success("Ürün başarıyla silindi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
    } catch (error) {
      setItems(previous);
      setCartCount(previous.reduce((acc, x) => acc + x.quantity, 0));
      toast.error(error instanceof Error ? error.message : "Ürün silinemedi");
    }
  };

  const changeQty = async (item: CartItem, nextQty: number) => {
    if (!token) return;
    const previous = items;
    const next =
      nextQty < 1 ? items.filter((x) => x.id !== item.id) : items.map((x) => (x.id === item.id ? { ...x, quantity: nextQty } : x));
    setItems(next);
    setCartCount(next.reduce((acc, x) => acc + x.quantity, 0));
    try {
      if (nextQty < 1) {
        await apiDeleteCartItem(token, item.id);
      } else {
        await apiUpdateCartItem(token, item.id, nextQty);
      }
    } catch (error) {
      setItems(previous);
      setCartCount(previous.reduce((acc, x) => acc + x.quantity, 0));
      toast.error(error instanceof Error ? error.message : "Miktar güncellenemedi");
    }
  };

  if (!token) return <p>Sepeti görmek için giriş yapın.</p>;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="px-1">
          <h1 className="text-left text-2xl font-bold text-slate-900">Sepetim</h1>
          <p className="mt-1 text-left text-sm text-slate-500">Ürün miktarını anında düzenle ve siparişi tamamla.</p>
        </div>
        {!items.length ? <div className="rounded-xl border bg-white p-6">Sepetiniz boş.</div> : null}
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold text-slate-800">{item.product.title}</p>
              <p className="text-sm text-slate-500">{item.product.price} TL</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => changeQty(item, item.quantity - 1)} className="rounded-lg border p-2 hover:bg-slate-50"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button onClick={() => changeQty(item, item.quantity + 1)} className="rounded-lg border p-2 hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
              <button onClick={() => remove(item.id)} className="ml-2 rounded-lg border p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </section>

      <aside className="ml-auto w-full max-w-xs rounded-2xl border bg-white p-5 shadow-sm min-h-56">
        <h2 className="text-lg font-bold text-blue-700">Sipariş Özeti</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Ürün adedi</span><span>{items.reduce((acc, i) => acc + i.quantity, 0)}</span></div>
          <div className="flex justify-between font-semibold"><span>Toplam</span><span>{total.toFixed(2)} TL</span></div>
        </div>
        {!!items.length && <Link href="/checkout" className="mx-auto mt-5 block w-fit rounded-xl bg-blue-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700">Siparişe Geç</Link>}
      </aside>
    </div>
  );
}
