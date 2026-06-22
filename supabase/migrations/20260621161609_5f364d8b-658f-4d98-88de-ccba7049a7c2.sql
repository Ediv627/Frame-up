DROP POLICY IF EXISTS "Anyone can view active product images" ON public.product_images;
CREATE POLICY "Anyone can view active product images"
ON public.product_images FOR SELECT
USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND p.active = true)
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
);

DROP POLICY IF EXISTS "Anyone can view active product size prices" ON public.product_size_prices;
CREATE POLICY "Anyone can view active product size prices"
ON public.product_size_prices FOR SELECT
USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_size_prices.product_id AND p.active = true)
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
);

DROP POLICY IF EXISTS "Anyone can view active shipping rates" ON public.shipping_rates;
CREATE POLICY "Anyone can view active shipping rates"
ON public.shipping_rates FOR SELECT
USING (
  active = true
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
);