import { Skeleton, Stack } from "@mantine/core";

// Shown while a product that wasn't prerendered loads
export default function ProductLoading() {
  return (
    <Stack gap="md" className="px-5 pt-4">
      <Skeleton height={12} width="40%" />
      <Skeleton className="aspect-square" radius="lg" />
      <Skeleton height={24} width="80%" />
      <Skeleton height={32} width="35%" />
      <Skeleton height={44} radius="md" />
      <Skeleton height={44} radius="md" />
    </Stack>
  );
}
