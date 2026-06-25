import { prisma } from "@/lib/prisma";
import { savePageSection } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { parseJson } from "@/lib/utils";

export default async function PagesAdmin() {
  const sections = await prisma.pageSection.findMany({ where: { page: "about" } });
  const intro = sections.find((s) => s.key === "intro");
  const mission = sections.find((s) => s.key === "mission");

  const blocks = [
    { key: "intro", title: "About Intro", section: intro },
    { key: "mission", title: "About Mission", section: mission },
  ];

  return (
    <div>
      <AdminHeader title="Page Content" />
      {blocks.map(({ key, title, section }) => (
        <form key={key} action={savePageSection} className="mb-6 max-w-2xl space-y-3 border bg-white p-4">
          <input type="hidden" name="page" value="about" />
          <input type="hidden" name="key" value={key} />
          <Label>{title}</Label>
          <Textarea name="body" defaultValue={parseJson<{ body?: string }>(section?.content, {}).body || ""} rows={5} />
          <Button type="submit">Save</Button>
        </form>
      ))}
    </div>
  );
}