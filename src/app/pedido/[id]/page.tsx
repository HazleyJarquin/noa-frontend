import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader, Stack } from "@mantine/core";
import { PageHeader } from "@/shared/components/PageHeader";
import { OrderStatusView } from "@/features/checkout/components/OrderStatusView";
import type { OrderStatus } from "@/features/checkout/constants";
import { getOrderSummary, isUuid, syncOrderPayment } from "@/features/checkout/services/orders";

export const metadata: Metadata = {
  title: "Mi pedido | NOA Librería",
  // Personal page reached through an unguessable link
  robots: { index: false },
};

const OrderContent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  // Ask Poket for the real payment state; if Poket is down, show what we have
  await syncOrderPayment(id).catch((error) => console.error("[pedido] sync failed", error));

  const order = await getOrderSummary(id);
  if (!order) notFound();

  return (
    <OrderStatusView
      status={order.status as OrderStatus}
      number={order.number}
      customerName={order.customer_name}
      total={Number(order.total)}
      paymentUrl={order.payment_url}
      paymentExpiresAt={order.payment_expires_at}
      items={order.order_items}
    />
  );
};

export default function OrderPage({ params }: PageProps<"/pedido/[id]">) {
  return (
    <div className="min-h-screen w-full bg-surface flex flex-col gap-6 pb-10">
      <PageHeader subtitle="Mi pedido" backHref="/productos" />
      <div className="mx-auto w-full max-w-xl px-5">
        {/* Order data is per-visit and uncached: stream it inside Suspense */}
        <Suspense
          fallback={
            <Stack align="center" className="py-16">
              <Loader color="navy" />
            </Stack>
          }
        >
          <OrderContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
