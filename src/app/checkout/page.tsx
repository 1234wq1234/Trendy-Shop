"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CreditCard, FileText, MapPin, MessageSquare, User } from "lucide-react";
import { apiCreateOrder, apiGetCart } from "@/lib/api/client";
import { CartItem } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

const paymentMethods = ["Kredi Kartı", "Kapıda Ödeme", "Havale/EFT"] as const;
const invoiceTypes = ["Bireysel", "Kurumsal"] as const;

const checkoutSchema = z
  .object({
    fullName: z.string().min(3, "Ad soyad en az 3 karakter olmalı"),
    phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
    contactEmail: z.string().email("Geçerli bir e-posta girin"),
    addressLine1: z.string().min(5, "Açık adres satırı gerekli"),
    addressLine2: z.string().optional(),
    district: z.string().min(2, "İlçe gerekli"),
    city: z.string().min(2, "Şehir gerekli"),
    postalCode: z
      .string()
      .min(5, "Posta kodu gerekli")
      .regex(/^[0-9]{5}$/, "5 haneli posta kodu girin"),
    paymentMethod: z.enum(paymentMethods),
    invoiceType: z.enum(invoiceTypes),
    invoiceTitle: z.string().min(2, "Fatura adı / ünvan gerekli"),
    invoiceTaxId: z.string().optional(),
    invoiceTaxOffice: z.string().optional(),
    invoiceAddress: z.string().optional(),
    invoiceSameAsDelivery: z.boolean(),
    orderNote: z.string().max(500, "En fazla 500 karakter").optional()
  })
  .superRefine((data, ctx) => {
    if (data.invoiceType === "Kurumsal") {
      if (!data.invoiceTaxId?.trim() || data.invoiceTaxId.trim().length < 10) {
        ctx.addIssue({ code: "custom", message: "Kurumsal fatura için geçerli vergi numarası gerekli", path: ["invoiceTaxId"] });
      }
      if (!data.invoiceTaxOffice?.trim() || data.invoiceTaxOffice.trim().length < 2) {
        ctx.addIssue({ code: "custom", message: "Vergi dairesi gerekli", path: ["invoiceTaxOffice"] });
      }
    }
    if (!data.invoiceSameAsDelivery) {
      if (!data.invoiceAddress?.trim() || data.invoiceAddress.trim().length < 5) {
        ctx.addIssue({ code: "custom", message: "Fatura adresi gerekli", path: ["invoiceAddress"] });
      }
    }
  });

type CheckoutForm = z.infer<typeof checkoutSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-600">{message}</p>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { token } = useAppStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "Kredi Kartı",
      invoiceType: "Bireysel",
      invoiceSameAsDelivery: true,
      addressLine2: "",
      invoiceTaxId: "",
      invoiceTaxOffice: "",
      invoiceAddress: "",
      orderNote: ""
    }
  });

  const sameAsDelivery = watch("invoiceSameAsDelivery");
  const invoiceType = watch("invoiceType");

  useEffect(() => {
    if (!token) return;
    apiGetCart(token).then((cart) => {
      const filtered = (cart.products || []).filter((i: CartItem) => i.product.image.startsWith("/images/"));
      setCartItems(filtered);
    });
  }, [token]);

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!token) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center">
        <p className="text-slate-700">Sipariş için giriş yapmalısınız.</p>
        <Link href="/login" className="mt-4 inline-block font-semibold text-blue-600 hover:underline">
          Giriş yap
        </Link>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center">
        <p className="text-slate-700">Sepetiniz boş.</p>
        <Link href="/cart" className="mt-4 inline-block font-semibold text-blue-600 hover:underline">
          Sepete dön
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    try {
      await apiCreateOrder(token, {
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        contactEmail: data.contactEmail.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2?.trim() || undefined,
        district: data.district.trim(),
        city: data.city.trim(),
        postalCode: data.postalCode.trim(),
        paymentMethod: data.paymentMethod,
        invoiceType: data.invoiceType,
        invoiceTitle: data.invoiceTitle.trim(),
        invoiceTaxId: data.invoiceTaxId?.trim() || undefined,
        invoiceTaxOffice: data.invoiceTaxOffice?.trim() || undefined,
        invoiceAddress: data.invoiceAddress?.trim() || undefined,
        invoiceSameAsDelivery: data.invoiceSameAsDelivery,
        orderNote: data.orderNote?.trim() || undefined
      });
      toast.success("Siparişiniz alındı", { duration: 2000 });
      router.push("/orders");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sipariş oluşturulamadı");
    } finally {
      setSubmitting(false);
    }
  };

  const sectionTitle = (icon: ReactNode, title: string) => (
    <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
      <span className="text-blue-600">{icon}</span>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
  );

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <section className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <div className="hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 p-8 text-white lg:block">
            <h2 className="text-2xl font-bold">Güvenli ödeme</h2>
            <p className="mt-3 text-sm text-blue-50">
              Teslimat ve fatura bilgileriniz sipariş kaydınızla birlikte saklanır. Kart bilgileriniz bu demo uygulamada toplanmaz; ödeme yönteminizi seçmeniz yeterlidir.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Sipariş Oluştur</h1>
          <p className="mt-1 text-sm text-slate-500">Aşağıdaki bölümleri doldurarak siparişinizi tamamlayın.</p>
        </div>

        <div>
          {sectionTitle(<User className="h-5 w-5" />, "Kişisel bilgiler")}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <input {...register("fullName")} placeholder="Ad Soyad *" className={inputClass} />
              <FieldError message={errors.fullName?.message} />
            </div>
            <div>
              <input {...register("phone")} placeholder="Telefon (05xx xxx xx xx) *" className={inputClass} />
              <FieldError message={errors.phone?.message} />
            </div>
            <div>
              <input {...register("contactEmail")} type="email" placeholder="İletişim e-postası *" className={inputClass} />
              <FieldError message={errors.contactEmail?.message} />
            </div>
          </div>
        </div>

        <div>
          {sectionTitle(<MapPin className="h-5 w-5" />, "Teslimat adresi")}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <input {...register("addressLine1")} placeholder="Adres satırı (mahalle, sokak, bina no) *" className={inputClass} />
              <FieldError message={errors.addressLine1?.message} />
            </div>
            <div className="sm:col-span-2">
              <input {...register("addressLine2")} placeholder="Adres satırı 2 (daire, kapı — isteğe bağlı)" className={inputClass} />
            </div>
            <div>
              <input {...register("district")} placeholder="İlçe *" className={inputClass} />
              <FieldError message={errors.district?.message} />
            </div>
            <div>
              <input {...register("city")} placeholder="Şehir *" className={inputClass} />
              <FieldError message={errors.city?.message} />
            </div>
            <div className="sm:col-span-2 sm:max-w-xs">
              <input {...register("postalCode")} placeholder="Posta kodu (5 hane) *" className={inputClass} maxLength={5} inputMode="numeric" />
              <FieldError message={errors.postalCode?.message} />
            </div>
          </div>
        </div>

        <div>
          {sectionTitle(<CreditCard className="h-5 w-5" />, "Ödeme")}
          <p className="mb-3 text-sm text-slate-500">Bu örnekte kart bilgisi alınmaz; yönteminizi seçin.</p>
          <select {...register("paymentMethod")} className={inputClass}>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <FieldError message={errors.paymentMethod?.message} />
        </div>

        <div>
          {sectionTitle(<FileText className="h-5 w-5" />, "Fatura bilgisi")}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Fatura tipi</label>
              <select {...register("invoiceType")} className={inputClass}>
                {invoiceTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Fatura adı / ünvan</label>
              <input {...register("invoiceTitle")} placeholder="Ad soyad veya şirket ünvanı *" className={inputClass} />
              <FieldError message={errors.invoiceTitle?.message} />
            </div>
            {invoiceType === "Kurumsal" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Vergi numarası</label>
                  <input {...register("invoiceTaxId")} placeholder="VKN *" className={inputClass} />
                  <FieldError message={errors.invoiceTaxId?.message} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Vergi dairesi</label>
                  <input {...register("invoiceTaxOffice")} placeholder="Vergi dairesi *" className={inputClass} />
                  <FieldError message={errors.invoiceTaxOffice?.message} />
                </div>
              </>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register("invoiceSameAsDelivery")} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Fatura adresi teslimat adresi ile aynı
          </label>
          {!sameAsDelivery && (
            <div className="mt-4">
              <textarea
                {...register("invoiceAddress")}
                rows={3}
                placeholder="Fatura adresi *"
                className={`${inputClass} resize-y`}
              />
              <FieldError message={errors.invoiceAddress?.message} />
            </div>
          )}
        </div>

        <div>
          {sectionTitle(<MessageSquare className="h-5 w-5" />, "Sipariş notu")}
          <textarea {...register("orderNote")} rows={3} placeholder="Kurye veya paket için notunuz (isteğe bağlı)" className={`${inputClass} resize-y`} />
          <FieldError message={errors.orderNote?.message} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Gönderiliyor..." : "Siparişi tamamla"}
        </button>
            <Link href="/cart" className="block text-center text-sm font-medium text-blue-600 hover:underline">
              Sepete dön
            </Link>
          </form>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
            <h3 className="font-semibold text-slate-800">Sipariş özeti</h3>
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between gap-2 text-slate-600">
                  <span className="truncate">{item.product.title}</span>
                  <span className="shrink-0">
                    ×{item.quantity} · {(item.product.price * item.quantity).toFixed(2)} TL
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-slate-200 pt-4 text-lg font-bold text-blue-700">Toplam: {total.toFixed(2)} TL</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
