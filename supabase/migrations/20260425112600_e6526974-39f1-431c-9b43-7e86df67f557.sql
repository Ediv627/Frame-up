CREATE TABLE IF NOT EXISTS public.product_size_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  price numeric NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, size)
);

ALTER TABLE public.product_size_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active product size prices"
ON public.product_size_prices
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_size_prices.product_id
      AND (p.active = true OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Admins insert product size prices"
ON public.product_size_prices
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update product size prices"
ON public.product_size_prices
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete product size prices"
ON public.product_size_prices
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_product_size_prices_product_id
ON public.product_size_prices(product_id, sort_order);

CREATE TRIGGER update_product_size_prices_updated_at
BEFORE UPDATE ON public.product_size_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.product_size_prices (product_id, size, price, sort_order)
SELECT p.id, s.size, p.price, s.ordinality - 1
FROM public.products p
CROSS JOIN LATERAL unnest(
  CASE WHEN cardinality(p.sizes) > 0 THEN p.sizes ELSE ARRAY['افتراضي']::text[] END
) WITH ORDINALITY AS s(size, ordinality)
ON CONFLICT (product_id, size) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_product_base_price_from_sizes(_product_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products p
  SET price = COALESCE((
    SELECT MIN(psp.price)
    FROM public.product_size_prices psp
    WHERE psp.product_id = _product_id
  ), p.price)
  WHERE p.id = _product_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_product_size_price_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_product_id uuid;
BEGIN
  affected_product_id := COALESCE(NEW.product_id, OLD.product_id);
  PERFORM public.sync_product_base_price_from_sizes(affected_product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER sync_product_price_after_size_insert
AFTER INSERT ON public.product_size_prices
FOR EACH ROW
EXECUTE FUNCTION public.handle_product_size_price_change();

CREATE TRIGGER sync_product_price_after_size_update
AFTER UPDATE ON public.product_size_prices
FOR EACH ROW
EXECUTE FUNCTION public.handle_product_size_price_change();

CREATE TRIGGER sync_product_price_after_size_delete
AFTER DELETE ON public.product_size_prices
FOR EACH ROW
EXECUTE FUNCTION public.handle_product_size_price_change();

SELECT public.sync_product_base_price_from_sizes(id)
FROM public.products;