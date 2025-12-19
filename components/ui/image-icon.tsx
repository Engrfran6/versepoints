"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function ImageIcon({ src, alt, size = 16, className }: ImageIconProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}
