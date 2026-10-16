import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel NOA",
  // Never show the admin panel in search engines
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen w-full bg-surface">{children}</div>;
}
