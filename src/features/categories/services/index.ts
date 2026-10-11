"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/shared/lib/supabase/public";
import type { Category } from "../constants";

export const getCategories = async (): Promise<Category[]> => {
  cacheTag("categories");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order");

  if (error) {
    throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  }

  return data;
};
