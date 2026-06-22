-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins insert categories" ON public.categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update categories" ON public.categories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete categories" ON public.categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Colors table
CREATE TABLE public.colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  hex TEXT NOT NULL DEFAULT '#000000',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view colors" ON public.colors FOR SELECT USING (true);
CREATE POLICY "Admins insert colors" ON public.colors FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update colors" ON public.colors FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete colors" ON public.colors FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_colors_updated_at BEFORE UPDATE ON public.colors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Admins insert materials" ON public.materials FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update materials" ON public.materials FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete materials" ON public.materials FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults
INSERT INTO public.categories (slug, name_ar, sort_order) VALUES
  ('wall', 'إطارات حائط', 10),
  ('tabletop', 'إطارات طاولة', 20),
  ('gallery', 'جاليري وول', 30),
  ('bedroom', 'غرفة النوم', 40),
  ('living', 'الصالون', 50),
  ('office', 'المكتب', 60);

INSERT INTO public.colors (slug, name_ar, hex, sort_order) VALUES
  ('black', 'أسود', '#0B0B0B', 10),
  ('white', 'أبيض', '#F8F5EE', 20),
  ('natural', 'خشب طبيعي', '#C9A77A', 30),
  ('brass', 'نحاسي', '#B5895A', 40),
  ('gold', 'ذهبي', '#D4AF37', 50),
  ('silver', 'فضي', '#C0C0C0', 60),
  ('walnut', 'جوزي غامق', '#5C3A1E', 70);

INSERT INTO public.materials (slug, name_ar, sort_order) VALUES
  ('wood', 'خشب', 10),
  ('metal', 'معدن', 20),
  ('composite', 'مركّب', 30),
  ('acrylic', 'أكريليك', 40),
  ('aluminum', 'ألومنيوم', 50);

-- Seed sample products
INSERT INTO public.products (slug, name, tagline, description, price, image_url, category, material, color, sizes, featured, badge, sort_order, active) VALUES
  ('classic-black-wood', 'إطار خشبي أسود كلاسيكي', 'لمسة أنيقة لأي صورة', 'إطار خشب طبيعي مدهون بلون أسود مطفي. مناسب للصور الفنية والعائلية.', 850, 'asset:frame-1', 'wall', 'wood', 'black', ARRAY['20x30','30x40','40x60'], true, 'الأكثر مبيعاً', 10, true),
  ('natural-oak-frame', 'إطار خشب البلوط الطبيعي', 'دفء الخشب الأصلي', 'خشب البلوط بلونه الطبيعي بدون دهان. ملمس ناعم ومظهر عصري.', 920, 'asset:frame-2', 'wall', 'wood', 'natural', ARRAY['20x30','30x40','50x70'], true, null, 20, true),
  ('brass-tabletop-mini', 'إطار طاولة نحاسي صغير', 'تفصيلة راقية للمكتب', 'إطار معدني بطلاء نحاسي لامع. مثالي للصور الصغيرة على المكتب أو الكونسول.', 480, 'asset:frame-3', 'tabletop', 'metal', 'brass', ARRAY['10x15','13x18'], false, 'جديد', 30, true),
  ('white-gallery-set', 'سيت جاليري أبيض', '6 إطارات لحائط متكامل', 'مجموعة من 6 إطارات بمقاسات مختلفة بلون أبيض كريمي. تأتي بنظام تعليق متناسق.', 2200, 'asset:frame-4', 'gallery', 'wood', 'white', ARRAY['سيت كامل'], true, 'وفّر 15%', 40, true),
  ('walnut-deep-frame', 'إطار جوز عميق', 'عمق وفخامة', 'إطار جوزي غامق بحواف عميقة 4 سم. يعطي تأثير ثلاثي الأبعاد للصورة.', 1100, 'asset:frame-5', 'wall', 'wood', 'walnut', ARRAY['30x40','40x60','60x90'], false, null, 50, true),
  ('gold-luxe-frame', 'إطار ذهبي فاخر', 'لمسة ملكية', 'إطار مزخرف بطلاء ذهبي. مستوحى من الإطارات الكلاسيكية الأوروبية.', 1450, 'asset:frame-6', 'wall', 'composite', 'gold', ARRAY['30x40','40x60'], true, 'إصدار محدود', 60, true);
