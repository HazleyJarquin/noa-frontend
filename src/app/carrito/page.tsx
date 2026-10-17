import type { Metadata } from "next";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import { Text } from "@mantine/core";
import { CartView } from "@/features/cart/components";
import { getFeaturedProducts } from "@/features/products/services";
import { resolveFlag, schoolListUploadFlag } from "@/shared/flags";
import { getCurrentYear } from "@/shared/lib/current-year";

export const metadata: Metadata = {
  title: "Mi carrito | NOA Librería",
  // The cart is personal: keep it out of search results
  robots: { index: false },
};

export default async function CartPage() {
  const [suggestions, year] = await Promise.all([
    getFeaturedProducts(),
    getCurrentYear(),
  ]);

  return (
    <div className="min-h-screen w-full bg-surface flex flex-col gap-6 pb-32">
      <DesktopHeader />
      {/* Flags read cookies (dynamic): pass the promise and resolve it inside Suspense,
          so the rest of the page stays prerendered */}
      <CartView
        suggestions={suggestions}
        showSchoolList={resolveFlag(schoolListUploadFlag)}
      />

      <Text fz={10} c="dimmed" ta="center" className="px-5">
        © {year} NOA Librería Nicaragua. Todos los derechos reservados.
      </Text>
    </div>
  );
}
