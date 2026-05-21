ALTER TABLE "Product" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Saat ve Aksesuar';

UPDATE "Product"
SET "category" = 'Kozmetik'
WHERE LOWER(COALESCE("title", '') || ' ' || COALESCE("description", '')) LIKE ANY (ARRAY['%parfum%', '%rimel%', '%kirpik%', '%krem%']);

UPDATE "Product"
SET "category" = 'Giyim'
WHERE LOWER(COALESCE("title", '') || ' ' || COALESCE("description", '')) LIKE ANY (ARRAY['%ceket%', '%etek%', '%gomlek%', '%tisort%']);

UPDATE "Product"
SET "category" = 'Çanta ve Ayakkabı'
WHERE LOWER(COALESCE("title", '') || ' ' || COALESCE("description", '')) LIKE ANY (ARRAY['%canta%', '%sandalet%', '%ayakkabi%', '%sneaker%', '%bot%', '%topuklu%']);

UPDATE "Product"
SET "category" = 'Teknolojik'
WHERE LOWER(COALESCE("title", '') || ' ' || COALESCE("description", '')) LIKE '%bilgisayar%';

UPDATE "Product"
SET "category" = 'Ev Eşyası'
WHERE LOWER(COALESCE("title", '') || ' ' || COALESCE("description", '')) LIKE ANY (ARRAY['%kahve%', '%supurge%']);
