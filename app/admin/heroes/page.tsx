import { prisma } from "@/lib/prisma";
import { createHero, deleteHero } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function HeroesPage() {
  const heroes = await prisma.heroBanner.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <AdminHeader title="Hero Banners" />
      <form action={createHero} className="mb-8 grid max-w-2xl gap-3 border bg-white p-4">
        <div><Label>Title</Label><Input name="title" required className="mt-1" /></div>
        <div><Label>Subtitle</Label><Input name="subtitle" className="mt-1" /></div>
        <div><Label>Image URL</Label><Input name="imageUrl" required placeholder="/uploads/hero.jpg" className="mt-1" /></div>
        <Button type="submit">Add Hero</Button>
      </form>
      <ul className="space-y-2">
        {heroes.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-4 border bg-white p-3">
            <div>
              <p className="font-medium">{h.title}</p>
              <p className="text-sm text-gray-500">{h.subtitle || "No subtitle"} · {h.imageUrl}</p>
            </div>
            <form action={deleteHero}>
              <input type="hidden" name="id" value={h.id} />
              <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-transparent hover:text-red-700">Delete</Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
