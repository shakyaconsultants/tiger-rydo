import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

export default async function AboutPage() {
  const sections = await prisma.pageSection.findMany({ where: { page: "about", enabled: true }, orderBy: { sortOrder: "asc" } });
  const intro = sections.find((s) => s.key === "intro");
  const mission = sections.find((s) => s.key === "mission");
  const introContent = parseJson<{ body?: string }>(intro?.content, {});
  const missionContent = parseJson<{ body?: string }>(mission?.content, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="brand-heading text-4xl">About TIGER RYDO</h1>
      <section className="mt-8 space-y-6 text-lg text-brand-muted">
        <p>{introContent.body || "Tiger builds intelligent electric vehicles for the city and beyond. Clean design. Intelligent performance. Zero compromise."}</p>
        {missionContent.body && <p>{missionContent.body}</p>}
      </section>
    </div>
  );
}
