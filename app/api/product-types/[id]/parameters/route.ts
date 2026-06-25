import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parameters = await prisma.parameterDefinition.findMany({ where: { productTypeId: id }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(parameters);
}
