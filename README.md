# Trendy Shop Production Setup

## 1) Environment

`.env` dosyasi olustur:

- `DATABASE_URL` (Neon PostgreSQL)
- `JWT_SECRET`
- `PORT=4000`
- `NEXT_PUBLIC_API_URL=http://localhost:4000`

## 2) Install

```bash
npm install
```

## 3) Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 4) Run

Tek komutta frontend + backend:
```bash
npm run dev:full
```

Ayrı ayrı çalıştırmak istersen:
```bash
npm run dev:server
npm run dev
```

## API

- `POST /auth/register`
- `POST /auth/login`
- `GET/POST/PUT/DELETE /products`
- `GET /products?brand=nike`
- `GET /products?search=keyword`
- `GET/POST /orders`
- `GET/POST/DELETE /cart`
- `GET/POST/DELETE /favorites`

## Notes

- Admin islemleri JWT + role (`ADMIN`) ile korunur.
- �r�n ekleme formunda `image` zorunludur.
- Loading ve empty state ekranlari eklendi.
- Responsive hamburger sidebar + marka slider + Swiper �r�n slider aktif.
