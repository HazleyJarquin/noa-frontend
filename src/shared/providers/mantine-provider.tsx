"use client";

import "dayjs/locale/es";

import { MantineProvider as BaseMantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { NavigationProgress } from "@mantine/nprogress";
import { cssVariablesResolver, theme } from "@/shared/theme";

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="light"
    >
      <DatesProvider settings={{ locale: "es", firstDayOfWeek: 1 }}>
        <ModalsProvider>
          <NavigationProgress />
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </DatesProvider>
    </BaseMantineProvider>
  );
}
