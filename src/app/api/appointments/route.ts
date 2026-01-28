import { NextRequest, NextResponse } from "next/server";
import { db, appointments, clients } from "@/lib/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// GET: 일정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const clientId = searchParams.get("clientId");

    let conditions = [];

    if (startDate) {
      conditions.push(gte(appointments.datetime, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(appointments.datetime, new Date(endDate)));
    }
    if (clientId) {
      conditions.push(eq(appointments.clientId, clientId));
    }

    const result = await db
      .select({
        id: appointments.id,
        clientId: appointments.clientId,
        clientName: clients.name,
        clientLocation: clients.location,
        clientStatus: clients.status,
        clientType: clients.type,
        datetime: appointments.datetime,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(appointments.datetime);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

// POST: 일정 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, datetime, duration, notes } = body;

    if (!clientId || !datetime) {
      return NextResponse.json(
        { error: "clientId and datetime are required" },
        { status: 400 }
      );
    }

    const result = await db.insert(appointments).values({
      clientId,
      datetime: new Date(datetime),
      duration: duration || 60,
      notes: notes || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
