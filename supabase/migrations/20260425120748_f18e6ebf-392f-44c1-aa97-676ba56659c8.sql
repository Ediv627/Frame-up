CREATE TABLE public.shipping_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate TEXT NOT NULL UNIQUE,
  fee NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shipping rates"
ON public.shipping_rates
FOR SELECT
USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert shipping rates"
ON public.shipping_rates
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update shipping rates"
ON public.shipping_rates
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete shipping rates"
ON public.shipping_rates
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_shipping_rates_updated_at
BEFORE UPDATE ON public.shipping_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.shipping_rates (governorate, fee, sort_order) VALUES
('القاهرة', 60, 1),
('الجيزة', 60, 2),
('القليوبية', 70, 3),
('الإسكندرية', 85, 4),
('البحيرة', 90, 5),
('الدقهلية', 90, 6),
('الغربية', 90, 7),
('الشرقية', 90, 8),
('المنوفية', 90, 9),
('كفر الشيخ', 95, 10),
('دمياط', 95, 11),
('بورسعيد', 95, 12),
('الإسماعيلية', 95, 13),
('السويس', 95, 14),
('الفيوم', 100, 15),
('بني سويف', 105, 16),
('المنيا', 110, 17),
('أسيوط', 115, 18),
('سوهاج', 120, 19),
('قنا', 125, 20),
('الأقصر', 130, 21),
('أسوان', 140, 22),
('البحر الأحمر', 150, 23),
('مطروح', 150, 24),
('الوادي الجديد', 160, 25),
('شمال سيناء', 160, 26),
('جنوب سيناء', 160, 27);