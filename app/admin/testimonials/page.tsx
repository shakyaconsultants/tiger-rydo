import { prisma } from "@/lib/prisma";
import { createTestimonial, deleteTestimonial } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function TestimonialsPage() {
  const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <AdminHeader title="Testimonials" />
      <form action={createTestimonial} className="mb-8 grid max-w-2xl gap-3 border bg-white p-4">
        <div><Label>Name</Label><Input name="name" required className="mt-1" /></div>
        <div><Label>Role</Label><Input name="role" className="mt-1" /></div>
        <div><Label>Quote</Label><Textarea name="quote" required className="mt-1" /></div>
        <Button type="submit">Add Testimonial</Button>
      </form>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-4 border bg-white p-3">
            <div>
              <p className="font-medium">{t.name}{t.role ? ` · ${t.role}` : ""}</p>
              <p className="text-sm text-gray-500">"{t.quote}"</p>
            </div>
            <form action={deleteTestimonial}>
              <input type="hidden" name="id" value={t.id} />
              <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
