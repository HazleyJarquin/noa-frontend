"use client";

import Image from "next/image";
import { useState } from "react";
import { Carousel } from "@mantine/carousel";
import { Group, UnstyledButton } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import type { EmblaCarouselType } from "embla-carousel";
import type { ProductImage } from "../../constants";

type ProductGalleryProps = {
  images: ProductImage[];
  // Badges over the main image (discount, stock)
  overlay?: React.ReactNode;
};

export const ProductGallery = ({ images, overlay }: ProductGalleryProps) => {
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
        {images.length > 0 ? (
          <Carousel
            withControls={false}
            withIndicators={false}
            getEmblaApi={setEmbla}
            onSlideChange={setActive}
          >
            {images.map((image, index) => (
              <Carousel.Slide key={image.url}>
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className="object-cover"
                  />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          <div className="flex aspect-square items-center justify-center bg-surface-container-low">
            <IconPhoto size={48} stroke={1.5} className="text-outline-variant" />
          </div>
        )}

        {overlay && (
          <Group justify="space-between" className="pointer-events-none absolute inset-x-3 top-3">
            {overlay}
          </Group>
        )}
      </div>

      {images.length > 1 && (
        <Group gap="xs" wrap="nowrap">
          {images.map((image, index) => (
            <UnstyledButton
              key={image.url}
              aria-label={`Ver imagen ${index + 1}`}
              onClick={() => embla?.scrollTo(index)}
              data-active={index === active || undefined}
              className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 border-transparent bg-surface-container-low data-active:border-primary"
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </UnstyledButton>
          ))}
        </Group>
      )}
    </div>
  );
};
