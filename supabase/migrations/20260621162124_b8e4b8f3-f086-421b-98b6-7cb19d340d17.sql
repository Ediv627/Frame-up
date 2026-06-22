DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Visitors can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view active products and admins all" ON public.products;

CREATE POLICY "Visitors can view active products"
ON public.products
FOR SELECT
TO anon
USING (active = true);

CREATE POLICY "Users can view active products and admins all"
ON public.products
FOR SELECT
TO authenticated
USING (active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone can view active product images" ON public.product_images;
DROP POLICY IF EXISTS "Visitors can view active product images" ON public.product_images;
DROP POLICY IF EXISTS "Users can view active product images and admins all" ON public.product_images;

CREATE POLICY "Visitors can view active product images"
ON public.product_images
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_images.product_id
      AND p.active = true
  )
);

CREATE POLICY "Users can view active product images and admins all"
ON public.product_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_images.product_id
      AND p.active = true
  )
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Anyone can view active product size prices" ON public.product_size_prices;
DROP POLICY IF EXISTS "Visitors can view active product size prices" ON public.product_size_prices;
DROP POLICY IF EXISTS "Users can view active product size prices and admins all" ON public.product_size_prices;

CREATE POLICY "Visitors can view active product size prices"
ON public.product_size_prices
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_size_prices.product_id
      AND p.active = true
  )
);

CREATE POLICY "Users can view active product size prices and admins all"
ON public.product_size_prices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_size_prices.product_id
      AND p.active = true
  )
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Anyone can view active shipping rates" ON public.shipping_rates;
DROP POLICY IF EXISTS "Visitors can view active shipping rates" ON public.shipping_rates;
DROP POLICY IF EXISTS "Users can view active shipping rates and admins all" ON public.shipping_rates;

CREATE POLICY "Visitors can view active shipping rates"
ON public.shipping_rates
FOR SELECT
TO anon
USING (active = true);

CREATE POLICY "Users can view active shipping rates and admins all"
ON public.shipping_rates
FOR SELECT
TO authenticated
USING (active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));