"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiAddCart, apiGetFavorites, apiToggleFavorite } from "@/lib/api/client";
import { ProductSlider } from "@/components/home/sliders";
import { Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

export default function FavoritesPage() {
  const { token, setCartCount, setFavoriteCount } = useAppStore();
  const router = useRouter();
  const [items, setItems] = useState<{ product: Product; productId: string }[]>([]);

  const load = async () => {
    if (!token) return;
    try {
      const list = await apiGetFavorites(token);
      const filtered = list.filter((x: { product: Product }) => x.product.image.startsWith("/images/"));
      setItems(filtered);
      setFavoriteCount(filtered.length);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Favoriler yüklenemedi");
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  if (!token) return <p>Favoriler için giriş yapın.</p>;
  const favoriteProducts = items.map((x) => x.product);
  const favoriteIds = items.map((x) => x.productId);

  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">Favoriler</h1>
      {!items.length ? <div className="rounded-xl border bg-white p-6">Favori ürün bulunmuyor.</div> : null}
      {!!items.length && (
        <ProductSlider
          products={favoriteProducts}
          favoriteIds={favoriteIds}
          onProductClick={(id) => router.push(`/product/${id}`)}
          onFavorite={async (id) => {
            try {
              await apiToggleFavorite(token, id, true);
              load();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Favori güncellenemedi");
            }
          }}
          onAddCart={async (id) => {
            try {
              await apiAddCart(token, id, 1);
              setCartCount((c) => c + 1);
              toast.success("Sepete başarıyla eklendi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Sepete eklenemedi");
            }
          }}
        />
      )}
    </div>
  );
}
