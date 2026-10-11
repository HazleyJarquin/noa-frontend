import { MantineProvider } from "./mantine-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>;
}
