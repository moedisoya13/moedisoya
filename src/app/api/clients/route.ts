import { NextRequest, NextResponse } from "next/server";
import { db, clients } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";

// GET: 내담자 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let conditions = [];
    if (location && location !== "전체") {
      conditions.push(eq(clients.location, location));
    }
    if (status && status !== "전체") {
      conditions.push(eq(clients.status, status));
    }
    if (type && type !== "전체") {
      conditions.push(eq(clients.type, type));
    }

    const result = await db
      .select()
      .from(clients)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(clients.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST: 내담자 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, notes, location, status, type } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await db.insert(clients).values({
      name,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      location: location || "정발",
      status: status || "신규",
      type: type || "-",
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
