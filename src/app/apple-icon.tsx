import { renderBrandIcon } from "@/shared/lib/brand-icon";

// iOS "Add to Home Screen": iOS paints transparent areas black, so use a white background
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderBrandIcon({ size: size.width, background: "#FFFFFF", padding: 24 });
}
