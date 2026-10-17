"use client";

// Client Component: Mantine compound parts (Tabs.List, Table.Tr) don't exist on server references
import { Paper, SimpleGrid, Stack, Table, Tabs, Text, ThemeIcon } from "@mantine/core";
import {
  DELIVERY_POLICIES,
  getHighlightIcon,
  type ProductDetail,
} from "../../constants";

type ProductInfoTabsProps = {
  product: ProductDetail;
};

export const ProductInfoTabs = ({ product }: ProductInfoTabsProps) => {
  return (
    <Tabs
      defaultValue="descripcion"
      color="navy.9"
      classNames={{
        list: "flex-nowrap before:border-outline-variant/30",
        tab: "px-2 text-[13px] font-semibold text-on-surface/60 data-active:text-primary",
        tabLabel: "whitespace-normal text-center leading-tight",
        panel: "pt-4",
      }}
    >
      <Tabs.List grow>
        <Tabs.Tab value="descripcion">Descripción</Tabs.Tab>
        <Tabs.Tab value="especificaciones">Especificaciones</Tabs.Tab>
        <Tabs.Tab value="entrega">Retiro y políticas</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="descripcion">
        <Stack gap="md">
          {product.description.map((paragraph) => (
            <Text key={paragraph} size="sm" lh={1.6} className="text-on-surface">
              {paragraph}
            </Text>
          ))}

          {product.highlights.length > 0 && (
            <SimpleGrid cols={2} spacing="sm">
              {product.highlights.map((highlight) => {
                const HighlightIcon = getHighlightIcon(highlight.icon);
                return (
                  <Paper
                    key={highlight.title}
                    radius="md"
                    p="sm"
                    className="border border-outline-variant/30 bg-surface-container-lowest"
                  >
                    <ThemeIcon variant="transparent" size="sm" className="text-primary">
                      <HighlightIcon size={18} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} className="mt-1 text-primary">
                      {highlight.title}
                    </Text>
                    <Text fz={11} c="dimmed" lh={1.4}>
                      {highlight.text}
                    </Text>
                  </Paper>
                );
              })}
            </SimpleGrid>
          )}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="especificaciones">
        {product.specifications.length > 0 ? (
          <Table
            withRowBorders
            verticalSpacing="xs"
            classNames={{ tr: "border-outline-variant/30" }}
          >
            <Table.Tbody>
              {product.specifications.map((spec) => (
                <Table.Tr key={spec.label}>
                  <Table.Th className="w-2/5 text-xs font-semibold text-on-surface/70">
                    {spec.label}
                  </Table.Th>
                  <Table.Td className="text-sm text-on-surface">{spec.value}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text size="sm" c="dimmed">
            Sin especificaciones por ahora.
          </Text>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="entrega">
        <Stack gap="sm">
          {DELIVERY_POLICIES.map((policy) => (
            <div key={policy.title}>
              <Text size="sm" fw={600} className="text-primary">
                {policy.title}
              </Text>
              <Text size="sm" lh={1.5} className="text-on-surface">
                {policy.text}
              </Text>
            </div>
          ))}
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
};
