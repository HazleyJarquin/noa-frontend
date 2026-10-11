import { createTheme, Input, type CSSVariablesResolver } from "@mantine/core";
import { amber, crimson, emerald, indigo, link, navy, tokens } from "./colors";

export { tokens } from "./colors";
export { productVariants, type ProductVariant } from "./product-variants";

export const theme = createTheme({
  colors: {
    navy,
    indigo,
    emerald,
    amber,
    crimson,
    link,
    // Mantine uses red/green for form errors and default success states
    red: crimson,
    green: emerald,
  },
  primaryColor: "navy",
  primaryShade: 6,
  black: tokens.onSurface,
  white: tokens.surfaceContainerLowest,
  fontFamily:
    "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), ui-monospace, monospace",
  headings: {
    fontFamily:
      "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
  },
  defaultRadius: "md",
  components: {
    // Every input (TextInput, Select, DatePickerInput, PasswordInput…) renders Input,
    // so this radius applies to all of them
    Input: Input.extend({
      defaultProps: { radius: "lg" },
    }),
  },
});

const kebab = (key: string) =>
  key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [
      `--noa-${kebab(key)}`,
      value,
    ]),
  ),
  light: {
    "--mantine-color-body": tokens.surface,
    "--mantine-color-text": tokens.onSurface,
    "--mantine-color-default-border": tokens.outlineVariant,
    "--mantine-color-anchor": tokens.link,
  },
  dark: {},
});
