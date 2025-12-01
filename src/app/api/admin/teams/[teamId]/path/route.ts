import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getTeamPath } from "@/lib/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { teamId: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (isNaN(teamId)) {
      return NextResponse.json(
        { success: false, error: "ID squadra non valido" },
        { status: 400 }
      );
    }

    const path = await getTeamPath(teamId);

    return NextResponse.json({
      success: true,
      data: path.map((p) => ({
        order: p.stageOrder,
        locationName: p.location.nameIt,
        locationCode: p.location.code,
        isStart: p.location.isStart,
        isEnd: p.location.isEnd,
      })),
    });
  } catch (error) {
    console.error("Error fetching team path:", error);
    return NextResponse.json(
      { success: false, error: "Errore nel recupero del percorso" },
      { status: 500 }
    );
  }
}
