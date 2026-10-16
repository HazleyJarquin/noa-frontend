import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Renders the NOA isotype (public/brand/noa-isotipo.png) as a square icon.
// Used by app/icon.tsx (favicon) and app/apple-icon.tsx (iOS home screen).
export const renderBrandIcon = async ({
  size,
  background,
  padding = 0,
}: {
  size: number;
  background?: string;
  padding?: number;
}) => {
  const logo = await readFile(join(process.cwd(), "public/brand/noa-isotipo.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  const inner = size - padding * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: background ?? "transparent",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
        <img src={src} width={inner} height={inner} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
};
