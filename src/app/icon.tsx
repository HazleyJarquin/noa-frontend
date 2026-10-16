import { renderBrandIcon } from "@/shared/lib/brand-icon";

// Favicon: Next adds the <link rel="icon"> tag to every page automatically
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return renderBrandIcon({ size: size.width });
}
