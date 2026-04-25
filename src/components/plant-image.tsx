"use client"

import Image from "next/image"
import { Leaf } from "lucide-react"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

interface Props {
  storagePath?: string | null
  alt: string
  className?: string
  iconSize?: number
  textSize?: "xs" | "sm" | "base"
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
}

/**
 * 植物写真の共通表示コンポーネント。
 * 写真未登録の場合は「準備中」プレースホルダーを表示する。
 */
export default function PlantImage({
  storagePath,
  alt,
  className = "",
  iconSize = 28,
  textSize = "xs",
  fill = false,
  width,
  height,
  sizes,
  priority = false,
}: Props) {
  if (storagePath) {
    const url = `${SUPABASE_URL}/storage/v1/object/public/plant-photos/${storagePath}`
    if (fill) {
      return (
        <Image
          src={url}
          alt={alt}
          fill
          className={`object-cover ${className}`}
          sizes={sizes}
          priority={priority}
        />
      )
    }
    return (
      <Image
        src={url}
        alt={alt}
        width={width || 64}
        height={height || 64}
        className={`object-cover ${className}`}
        priority={priority}
      />
    )
  }

  // 写真未登録：準備中プレースホルダー
  const textClass =
    textSize === "base"
      ? "text-base"
      : textSize === "sm"
        ? "text-sm"
        : "text-[10px]"
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-green-50 ${className}`}
    >
      <Leaf size={iconSize} className="text-green-300 mb-1" />
      <span className={`text-green-500/70 font-medium ${textClass}`}>
        準備中
      </span>
    </div>
  )
}
