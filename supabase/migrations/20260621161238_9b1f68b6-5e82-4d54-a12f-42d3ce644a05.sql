REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- Rewrite SELECT policy to short-circuit for anon users (active products are public)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (
  active = true
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
);