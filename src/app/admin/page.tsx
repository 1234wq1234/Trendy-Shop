"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { apiAdminCreateProduct, apiAdminDeleteProduct, apiAdminUpdateProduct, apiGetProducts } from "@/lib/api/client";
import { Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

type ProductForm = {
  title: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  size?: string;
  color?: string;
  brand: string;
};

export default function AdminPage() {
  const { role, token } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm<ProductForm>();

  const loadProducts = async () => {
    setLoading(true);
    const data = await apiGetProducts({});
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (role !== "ADMIN") return <div className="rounded-xl border bg-white p-6">Bu sayfayı sadece admin görebilir.</div>;

  const addProduct = async (data: ProductForm) => {
    if (!token) return;
    try {
      const safeData: ProductForm = {
        ...data,
        price: Number.isFinite(data.price) ? data.price : 0
      };
      await apiAdminCreateProduct(token, safeData);
      toast.success("Ürün eklendi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
      reset();
      loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ürün eklenemedi");
    }
  };

  const removeProduct = async (id: string) => {
    if (!token) return;
    await apiAdminDeleteProduct(token, id);
    toast.success("Ürün başarıyla silindi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
    loadProducts();
  };

  const updateField = async (id: string, field: keyof ProductForm, value: string) => {
    if (!token) return;
    const parsed = field === "price" ? Number(value || 0) : value;
    await apiAdminUpdateProduct(token, id, { [field]: parsed } as Partial<Product>);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Admin Panel</h1>
      <form onSubmit={handleSubmit(addProduct)} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-2">
        <input {...register("title")} placeholder="Ürün adı" className="rounded border p-2" />
        <input {...register("price", { valueAsNumber: true })} placeholder="Fiyat" className="rounded border p-2" />
        <input {...register("image", { required: true })} placeholder="Image URL (zorunlu)" className="rounded border p-2" />
        <input {...register("brand")} placeholder="Brand" className="rounded border p-2" />
        <input {...register("category")} placeholder="Kategori (boşsa otomatik)" className="rounded border p-2" />
        <input {...register("size")} placeholder="Size" className="rounded border p-2" />
        <input {...register("color")} placeholder="Color" className="rounded border p-2" />
        <input {...register("description")} placeholder="Description" className="rounded border p-2 md:col-span-2" />
        <button className="rounded bg-blue-600 py-2 font-semibold text-white">Ürün Ekle</button>
      </form>

      {loading ? <div className="rounded-xl border bg-white p-6">Yükleniyor...</div> : null}
      {!loading && !products.length ? <div className="rounded-xl border bg-white p-6">Ürün yok.</div> : null}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 text-left">Title</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Image</th><th className="p-3 text-left">Brand</th><th className="p-3 text-left">Category</th><th className="p-3 text-left">Size</th><th className="p-3 text-left">Color</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-slate-50">
                <td className="p-3"><input defaultValue={p.title} onBlur={(e) => updateField(p.id, "title", e.target.value)} className="rounded border p-1" /></td>
                <td className="p-3"><input defaultValue={p.price} onBlur={(e) => updateField(p.id, "price", e.target.value)} className="w-24 rounded border p-1" /></td>
                <td className="p-3"><input defaultValue={p.image} onBlur={(e) => updateField(p.id, "image", e.target.value)} className="w-44 rounded border p-1" /></td>
                <td className="p-3"><input defaultValue={p.brand} onBlur={(e) => updateField(p.id, "brand", e.target.value)} className="rounded border p-1" /></td>
                <td className="p-3"><input defaultValue={p.category || ""} onBlur={(e) => updateField(p.id, "category", e.target.value)} className="rounded border p-1" /></td>
                <td className="p-3"><input defaultValue={p.size || ""} onBlur={(e) => updateField(p.id, "size", e.target.value)} className="rounded border p-1" /></td>
                <td className="p-3"><input defaultValue={p.color || ""} onBlur={(e) => updateField(p.id, "color", e.target.value)} className="rounded border p-1" /></td>
                <td className="p-3"><input defaultValue={p.description || ""} onBlur={(e) => updateField(p.id, "description", e.target.value)} className="w-52 rounded border p-1" /></td>
                <td className="p-3"><button onClick={() => removeProduct(p.id)} className="rounded border px-3 py-1 hover:bg-red-50">Sil</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
