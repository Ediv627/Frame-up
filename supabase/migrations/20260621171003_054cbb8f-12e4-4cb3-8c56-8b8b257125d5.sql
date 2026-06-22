
CREATE OR REPLACE FUNCTION public.track_order(_order_id uuid, _phone text)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  status order_status,
  total numeric,
  shipping numeric,
  subtotal numeric,
  customer_name text,
  city text,
  address text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.created_at, o.status, o.total, o.shipping, o.subtotal,
         o.customer_name, o.city, o.address
  FROM public.orders o
  WHERE o.id = _order_id
    AND regexp_replace(o.customer_phone, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.track_order_items(_order_id uuid, _phone text)
RETURNS TABLE (
  product_name text,
  size text,
  quantity integer,
  unit_price numeric,
  line_total numeric,
  product_image text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oi.product_name, oi.size, oi.quantity, oi.unit_price, oi.line_total, oi.product_image
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE o.id = _order_id
    AND regexp_replace(o.customer_phone, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g');
$$;

GRANT EXECUTE ON FUNCTION public.track_order(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_order_items(uuid, text) TO anon, authenticated;
