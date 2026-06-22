import { supabase } from "@/integrations/supabase/client";

export type Category = { id: string; slug: string; name_ar: string; sort_order: number; image_url: string | null };
export type Color = { id: string; slug: string; name_ar: string; hex: string; sort_order: number };
export type Material = { id: string; slug: string; name_ar: string; sort_order: number };

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_ar, sort_order, image_url")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchColors(): Promise<Color[]> {
  const { data, error } = await supabase
    .from("colors")
    .select("id, slug, name_ar, hex, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Color[];
}

export async function fetchMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("id, slug, name_ar, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Material[];
}
