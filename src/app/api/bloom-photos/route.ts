import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export async function GET() {
  // try-catch で囲んでエラー詳細を拾う
  try {
    const { data, error } = await supabase
      .from("plant_photos")
      .select("id, storage_path, plant_name, caption")
      .eq("caption", "開花")
      .not("storage_path", "is", null)
      .neq("storage_path", "")

    if (error) {
      console.error("Supabase Error Detail:", error); // ログに詳細を出す
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const photos = (data ?? []).map((p: any) => ({
      id: p.id,
      plant_name: p.plant_name,
      url: `${SUPABASE_URL}/storage/v1/object/public/plant-photos/${p.storage_path}`,
    }))

    return NextResponse.json({ photos })
  } catch (err) {
    console.error("System Error:", err);
    return NextResponse.json({ error: "予期せぬエラーが発生しました" }, { status: 500 })
  }
}
