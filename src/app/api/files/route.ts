import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/files — list the logged-in user's files
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ /api/files GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ files: data });
  } catch (err: any) {
    console.error("❌ /api/files GET crashed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch files" },
      { status: 500 }
    );
  }
}

// POST /api/files — create a new file record after upload
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file_name, file_url } = await req.json();

    const { data, error } = await supabaseAdmin
      .from("files")
      .insert({
        user_id: userId,
        file_name,
        file_url,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ /api/files POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ file: data });
  } catch (err: any) {
    console.error("❌ /api/files POST crashed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create file" },
      { status: 500 }
    );
  }
}