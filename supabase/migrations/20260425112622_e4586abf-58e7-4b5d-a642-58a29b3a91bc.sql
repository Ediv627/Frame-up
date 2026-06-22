DROP POLICY IF EXISTS "Product images publicly readable" ON storage.objects;

CREATE POLICY "Product image files are publicly readable"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'product-images'
  AND owner IS NULL
  AND name IS NOT NULL
);