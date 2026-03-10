import Image from "next/image";

type CachedImageProps = {
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
  sizes?: string;
  src: string | null | undefined;
};

export function CachedImage({
  alt,
  className,
  fallback,
  priority = false,
  sizes = "100vw",
  src,
}: CachedImageProps) {
  if (!src) {
    return fallback ?? null;
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill
      priority={priority}
      sizes={sizes}
      src={src}
    />
  );
}
