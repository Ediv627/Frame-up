import { supabase } from "@/integrations/supabase/client";

export type GovernorateShipping = {
  id?: string;
  name: string;
  fee: number;
  sortOrder?: number;
  active?: boolean;
};

export const EGYPT_GOVERNORATE_SHIPPING: GovernorateShipping[] = [
  { name: "القاهرة", fee: 60 },
  { name: "الجيزة", fee: 60 },
  { name: "القليوبية", fee: 70 },
  { name: "الإسكندرية", fee: 85 },
  { name: "البحيرة", fee: 90 },
  { name: "الدقهلية", fee: 90 },
  { name: "الغربية", fee: 90 },
  { name: "الشرقية", fee: 90 },
  { name: "المنوفية", fee: 90 },
  { name: "كفر الشيخ", fee: 95 },
  { name: "دمياط", fee: 95 },
  { name: "بورسعيد", fee: 95 },
  { name: "الإسماعيلية", fee: 95 },
  { name: "السويس", fee: 95 },
  { name: "الفيوم", fee: 100 },
  { name: "بني سويف", fee: 105 },
  { name: "المنيا", fee: 110 },
  { name: "أسيوط", fee: 115 },
  { name: "سوهاج", fee: 120 },
  { name: "قنا", fee: 125 },
  { name: "الأقصر", fee: 130 },
  { name: "أسوان", fee: 140 },
  { name: "البحر الأحمر", fee: 150 },
  { name: "مطروح", fee: 150 },
  { name: "الوادي الجديد", fee: 160 },
  { name: "شمال سيناء", fee: 160 },
  { name: "جنوب سيناء", fee: 160 },
];

export function getGovernorateShippingFee(governorate: string): number {
  return EGYPT_GOVERNORATE_SHIPPING.find((item) => item.name === governorate)?.fee ?? 0;
}

type ShippingRateRow = {
  id: string;
  governorate: string;
  fee: number;
  sort_order: number;
  active: boolean;
};

export async function fetchShippingRates(): Promise<GovernorateShipping[]> {
  const { data, error } = await (supabase as any)
    .from("shipping_rates")
    .select("id, governorate, fee, sort_order, active")
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("Failed to load shipping rates, using defaults", error);
    return EGYPT_GOVERNORATE_SHIPPING;
  }

  return ((data ?? []) as ShippingRateRow[]).map((row) => ({
    id: row.id,
    name: row.governorate,
    fee: Number(row.fee),
    sortOrder: row.sort_order,
    active: row.active,
  }));
}