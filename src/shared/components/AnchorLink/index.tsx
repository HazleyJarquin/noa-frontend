"use client";

import Link from "next/link";
import { Anchor, type AnchorProps } from "@mantine/core";

type AnchorLinkProps = AnchorProps & {
  href: string;
  children: React.ReactNode;
};

// Mantine Anchor rendered as a Next Link. Server Components can't pass
// component={Link} to Mantine (functions don't serialize), so they use this instead.
export const AnchorLink = ({ href, ...props }: AnchorLinkProps) => (
  <Anchor component={Link} href={href} {...props} />
);
