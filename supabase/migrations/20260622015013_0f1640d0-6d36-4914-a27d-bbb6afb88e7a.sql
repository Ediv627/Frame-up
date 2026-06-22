
-- Revoke EXECUTE from public/anon on SECURITY DEFINER functions that should not be publicly callable.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.sync_product_base_price_from_sizes(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_product_stock() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_stock_on_cancel() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_product_size_price_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_self_role_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Keep tracking functions callable by guests (intended public API).
GRANT EXECUTE ON FUNCTION public.track_order(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_order_items(uuid, text) TO anon, authenticated;

-- has_role remains usable by authenticated users (e.g. for admin checks in RLS).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
