import { NextResponse } from "next/server";
import { getSchoolsByIds } from "@/lib/data";

export const dynamic = "force-dynamic";

const MAX_IDS = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS);
  if (!ids.length) return NextResponse.json({ schools: [] });
  const schools = await getSchoolsByIds(ids);
  return NextResponse.json({ schools });
}
