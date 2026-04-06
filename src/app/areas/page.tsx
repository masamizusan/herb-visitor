"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, Leaf, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Plant } from "@/types/database"

const AREAS = "ABCDEFGHIJKLMNOPQRSTUVW".split("")

const AREA_NAMES: Record<string, string> = {
  A: "エリアA",
  B: "エリアB",
  C: "エリアC",
  D: "エリアD",
  E: "エリアE",
  F: "エリアF",
  G: "エリアG",
  H: "エリアH",
  I: "エリアI",
  J: "エリアJ",
  K: "エリアK",
  L: "エリアL",
  M: "エリアM",
  N: "エリアN",
  O: "エリアO",
  P: "エリアP",
  Q: "エリアQ",
  R: "エリアR",
  S: "エリアS",
  T: "エリアT",
  U: "エリアU",
  V: "エリアV",
  W: "エリアW",
}

export default function AreasPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("plants")
        .select("*")
        .eq("is_planted", true)

      if (data) setPlants(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const areaCounts = plants.reduce(
    (acc, p) => {
      acc[p.area] = (acc[p.area] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const areaCategories = plants.reduce(
    (acc, p) => {
      if (!acc[p.area]) acc[p.area] = new Set()
      if (p.category) acc[p.area].add(p.category)
      return acc
    },
    {} as Record<string, Set<string>>
  )

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="hero-gradient px-5 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} className="text-white" />
          <h1 className="text-xl font-bold text-white">エリアマップ</h1>
        </div>
        <p className="text-white/80 text-sm">
          全{AREAS.length}エリアのハーブ園をご案内します
        </p>
      </div>

      {/* Area Grid */}
      <div className="px-4 py-5 space-y-3">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-green-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-green-100 rounded w-1/3" />
                    <div className="h-3 bg-green-50 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))
          : AREAS.map((area) => {
              const count = areaCounts[area] || 0
              const cats = areaCategories[area]
                ? Array.from(areaCategories[area]).slice(0, 3)
                : []

              return (
                <Link
                  key={area}
                  href={`/areas/${area}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm card-hover"
                >
                  <div
                    className={`area-${area.toLowerCase()} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-2xl font-bold text-herb-text">
                      {area}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-sm">
                        {AREA_NAMES[area]}
                      </h2>
                      <ChevronRight
                        size={16}
                        className="text-herb-text-secondary/50"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Leaf size={12} className="text-green-400" />
                      <span className="text-xs text-herb-text-secondary">
                        {count}種のハーブ
                      </span>
                    </div>
                    {cats.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cats.map((cat) => (
                          <span
                            key={cat}
                            className="bg-green-50 text-green-600 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
      </div>
    </div>
  )
}
