import "server-only";

import { after, connection } from "next/server";
import { dedupe, flag } from "flags/next";
import type { Identify } from "flags";
import { growthbookAdapter, type Attributes } from "@flags-sdk/growthbook";
import { configureCache } from "@growthbook/growthbook";
import { VISITOR_ID_COOKIE, VISITOR_ID_HEADER } from "./visitor-id";

// GrowthBook caches features for 60s and serves stale values while refreshing.
// Dev: no cache, so a toggle shows up on the next reload.
// Prod: 10s, so changes land quickly without fetching on every request.
// Must match the @growthbook/growthbook version used by @flags-sdk/growthbook (shared cache).
configureCache(
  process.env.NODE_ENV === "development"
    ? { disableCache: true }
    : { staleTTL: 10_000 },
);

// Runs once per request no matter how many flags are evaluated
const identify = dedupe((async ({ cookies, headers }) => ({
  id:
    cookies.get(VISITOR_ID_COOKIE)?.value ??
    headers.get(VISITOR_ID_HEADER) ??
    undefined,
})) satisfies Identify<Attributes>);

// Called when a visitor is assigned to an experiment variation.
// TODO: send to the analytics tool once there is one
growthbookAdapter.setTrackingCallback((experiment, result) => {
  after(() => {
    console.info("[growthbook] exposure", {
      experiment: experiment.key,
      variation: result.key,
    });
  });
});

// Always evaluate flags through this helper. GrowthBook calls `new Date()` before
// reading cookies, which cacheComponents rejects during prerender; `connection()`
// marks the evaluation as request-time first. Pass the returned promise to a
// component that resolves it inside <Suspense> so the rest of the page stays static.
export const resolveFlag = async <T>(evaluate: () => Promise<T>): Promise<T> => {
  await connection();
  return evaluate();
};

// ─── Flags ─────────────────────────────────────────────────────────────────
// `key` must match the feature key in GrowthBook. `defaultValue` is used when
// GrowthBook is unreachable or the feature doesn't exist yet.

export const productInfoTabsFlag = flag<boolean, Attributes>({
  key: "product-info-tabs",
  description:
    "Muestra las pestañas Descripción, Especificaciones y Políticas de Entrega en el detalle del producto",
  // Off until products have descriptions/specs and the store offers delivery
  defaultValue: false,
  identify,
  adapter: growthbookAdapter.feature<boolean>(),
});

export const schoolListUploadFlag = flag<boolean, Attributes>({
  key: "school-list-upload",
  description: 'Muestra la tarjeta "¿Tienes lista escolar?" en el carrito',
  defaultValue: true,
  identify,
  adapter: growthbookAdapter.feature<boolean>(),
});
