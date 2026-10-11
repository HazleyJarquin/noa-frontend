import Link from "next/link";
import { Card, Text, ThemeIcon } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";

type CategoryCardProps = {
  icon: Icon;
  label: string;
  href: string;
};

export const CategoryCard = ({
  icon: CategoryIcon,
  label,
  href,
}: CategoryCardProps) => {
  return (
    <Link href={href} className="block w-full rounded-2xl">
      <Card
        radius="lg"
        padding={0}
        className="h-27 flex flex-col items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant/30 transition-shadow hover:shadow-[0_4px_16px_rgba(19,20,81,0.08)]"
      >
        <ThemeIcon
          size={48}
          radius="100%"
          className="bg-surface-container-low text-primary"
        >
          <CategoryIcon size={24} stroke={1.75} />
        </ThemeIcon>

        <Text size="xs" fw={500} ta="center" lh={1.25} className="text-primary px-1">
          {label}
        </Text>
      </Card>
    </Link>
  );
};
