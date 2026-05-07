CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Product" DROP COLUMN IF EXISTS "searchVector";

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(name, '') || ' ' ||
      coalesce("nameEn", '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce("descriptionEn", '') || ' ' ||
      coalesce(sku, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS product_search_vector_idx
  ON "Product" USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS product_name_trgm_idx
  ON "Product" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_name_en_trgm_idx
  ON "Product" USING GIN ("nameEn" gin_trgm_ops);
