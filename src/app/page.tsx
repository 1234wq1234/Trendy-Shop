"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BrandSlider, ProductSlider } from "@/components/home/sliders";
import { getProductCategory } from "@/lib/product-filters";
import { apiAddCart, apiGetFavorites, apiGetProducts, apiToggleFavorite } from "@/lib/api/client";
import { Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

export default function HomePage() {
  const router = useRouter();
  const { search, selectedBrand, setSelectedBrand, selectedCategory, token, setCartCount, setFavoriteCount } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGetProducts({ brand: selectedBrand, search })
      .then((data) => {
        const onlyReal = data.filter((p) => p.image.startsWith("/images/"));
        setProducts(onlyReal);
      })
      .finally(() => setLoading(false));
  }, [selectedBrand, search]);

  useEffect(() => {
    if (!token) return;
    apiGetFavorites(token).then((list) => {
      const ids = list.map((f: { productId: string }) => f.productId);
      setFavoriteIds(ids);
      setFavoriteCount(ids.length);
    });
  }, [token, setFavoriteCount]);

  const handleFavorite = async (id: string) => {
    if (!token) return router.push("/login");
    const isFav = favoriteIds.includes(id);
    try {
      await apiToggleFavorite(token, id, isFav);
      setFavoriteIds((prev) => {
        const next = isFav ? prev.filter((x) => x !== id) : [...prev, id];
        setFavoriteCount(next.length);
        return next;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Favori işlemi başarısız");
    }
  };

  const handleAddCart = async (id: string) => {
    if (!token) {
      toast.error("Sepete eklemek için giriş yapın");
      router.push("/login");
      return;
    }
    try {
      await apiAddCart(token, id, 1);
      setCartCount((c) => c + 1);
      toast.success("Sepete başarıyla eklendi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sepete eklenemedi");
    }
  };

  const visibleProducts = products.filter((p) => (selectedCategory === "Tümü" ? true : getProductCategory(p) === selectedCategory));

  return (
    <section className="space-y-4">
      <BrandSlider selected={selectedBrand} onSelect={setSelectedBrand} />
      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center">Yükleniyor...</div>
      ) : visibleProducts.length ? (
        <ProductSlider
          products={visibleProducts}
          favoriteIds={favoriteIds}
          onFavorite={handleFavorite}
          onAddCart={handleAddCart}
          onProductClick={(id) => router.push(`/product/${id}`)}
        />
      ) : (
        <div className="rounded-xl border bg-white p-10 text-center">Ürün bulunamadı.</div>
      )}
    </section>
  );
}
