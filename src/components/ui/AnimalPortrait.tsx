import Image from "next/image";
import type { AnimalAsset } from "@/data/animals";

type AnimalPortraitProps = {
  asset: AnimalAsset;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** Subtle cursor-follow drift, in pixels. Disabled for reduced motion. */
  drift?: number;
  scale?: number;
};

/**
 * Every animal portrait in the product renders through this component so the
 * campaign language (pure white, multiply blend, no card chrome) stays intact.
 */
export function AnimalPortrait({
  asset,
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "(max-width: 768px) 90vw, 45vw",
  drift = 0,
  scale = 1,
}: AnimalPortraitProps) {
  return (
    <div className={`animal-frame ${className}`}>
      <Image
        src={asset.src}
        alt={asset.alt}
        width={1024}
        height={1024}
        priority={priority}
        sizes={sizes}
        draggable={false}
        className={`h-full w-full select-none object-contain ${imgClassName}`}
        style={{ transform: `scale(${scale})` }}
        data-drift={drift}
      />
    </div>
  );
}
