import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

files = {
"app/admin/form-builder/page.tsx": '''import { prisma } from "@/lib/prisma";
import { saveFormField } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const fieldTypes = ["TEXT","NUMBER","TEXTAREA","SELECT","BOOLEAN"];

export default async function FormBuilderPage() {
  const template = await prisma.formTemplate.findFirst({ where: { active: true }, include: { fields: { orderBy: { sortOrder: "asc" } } } });
  return (
    <div>
      <AdminHeader title="Dealer Order Form Builder" />
      <p className="mb-4 text-sm text-gray-600">Define the fields dealers fill when placing orders.</p>
      <form action={saveFormField} className="mb-8 grid max-w-2xl gap-3 border bg-white p-4">
        <div><Label>Field Name</Label><Input name="name" required className="mt-1" /></div>
        <div><Label>Field Type</Label><select name="fieldType" className="mt-1 h-10 w-full border px-3">{fieldTypes.map((f) => <option key={f}>{f}</option>)}</select></div>
        <div><Label>Options (comma-separated for SELECT)</Label><Input name="options" className="mt-1" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="required" /> Required</label>
        <Button type="submit">Add Field</Button>
      </form>
      <ul className="space-y-2">{template?.fields.map((f) => <li key={f.id} className="border bg-white p-3 text-sm">{f.name} · {f.fieldType}</li>)}</ul>
    </div>
  );
}
''',

"app/admin/dealers/page.tsx": '''import { prisma } from "@/lib/prisma";
import { createDealer, resetDealerPassword } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function DealersPage() {
  const dealers = await prisma.user.findMany({ where: { role: "DEALER" }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <AdminHeader title="Dealers" />
      <form action={createDealer} className="mb-8 grid max-w-md gap-3 border bg-white p-4">
        <div><Label>Name</Label><Input name="name" required className="mt-1" /></div>
        <div><Label>Email</Label><Input name="email" type="email" required className="mt-1" /></div>
        <div><Label>Phone</Label><Input name="phone" className="mt-1" /></div>
        <div><Label>Temp Password</Label><Input name="password" type="password" required className="mt-1" /></div>
        <Button type="submit">Create Dealer</Button>
      </form>
      <div className="space-y-4">
        {dealers.map((d) => (
          <div key={d.id} className="border bg-white p-4">
            <p className="font-medium">{d.name}</p>
            <p className="text-sm text-gray-500">{d.email}{d.phone ? ` · ${d.phone}` : ""}</p>
            <form action={resetDealerPassword} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={d.id} />
              <Input name="password" type="password" placeholder="New password" required className="max-w-xs" />
              <Button type="submit" size="sm" variant="outline">Reset Password</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
''',

"app/admin/orders/page.tsx": '''import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseJson } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await prisma.dealerOrder.findMany({ include: { dealer: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <AdminHeader title="Dealer Orders" />
      <div className="space-y-4">
        {orders.map((o) => {
          const data = parseJson<Record<string, string>>(o.formData, {});
          return (
            <div key={o.id} className="border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-gray-500">{o.dealer.name} · {new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <dl className="mt-3 grid gap-1 text-sm md:grid-cols-2">{Object.entries(data).map(([k, v]) => <div key={k}><span className="text-gray-500">{k}:</span> {v}</div>)}</dl>
              <form action={updateOrderStatus} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="h-10 border px-3 text-sm">
                  {["PENDING","CONFIRMED","DISPATCHED","DELIVERED","CANCELLED"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <Input name="adminNotes" defaultValue={o.adminNotes || ""} placeholder="Admin notes" className="max-w-xs" />
                <Button type="submit" size="sm">Update</Button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
''',

"app/admin/pages/page.tsx": '''import { prisma } from "@/lib/prisma";
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
  return (
    <div>
      <AdminHeader title="Page Content" />
      {[["intro", "About Intro", intro], ["mission", "About Mission", mission]].map(([key, title, section]) => (
        <form key={String(key)} action={savePageSection} className="mb-6 max-w-2xl space-y-3 border bg-white p-4">
          <input type="hidden" name="page" value="about" />
          <input type="hidden" name="key" value={String(key)} />
          <Label>{title}</Label>
          <Textarea name="body" defaultValue={parseJson<{ body?: string }>(section?.content, {}).body || ""} rows={5} />
          <Button type="submit">Save</Button>
        </form>
      ))}
    </div>
  );
}
''',

"app/admin/heroes/page.tsx": '''import { prisma } from "@/lib/prisma";
import { createHero } from "@/lib/actions";
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
      <ul className="space-y-2">{heroes.map((h) => <li key={h.id} className="border bg-white p-3">{h.title}</li>)}</ul>
    </div>
  );
}
''',

"app/admin/testimonials/page.tsx": '''import { prisma } from "@/lib/prisma";
import { createTestimonial } from "@/lib/actions";
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
      <ul className="space-y-2">{items.map((t) => <li key={t.id} className="border bg-white p-3">{t.name}: {t.quote.slice(0, 80)}...</li>)}</ul>
    </div>
  );
}
''',

"app/dealer/orders/page.tsx": '''import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

export default async function DealerOrdersPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const session = await auth();
  const { success } = await searchParams;
  const orders = await prisma.dealerOrder.findMany({ where: { dealerId: session!.user!.id }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Order History</h1>
      {success && <p className="mt-4 border border-green-200 bg-green-50 p-3 text-sm text-green-800">Order {success} submitted successfully.</p>}
      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border bg-white p-4">
            <div className="flex justify-between"><p className="font-medium">{o.orderNumber}</p><span className="text-sm">{o.status}</span></div>
            <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
            <dl className="mt-2 grid gap-1 text-sm">{Object.entries(parseJson<Record<string,string>>(o.formData, {})).map(([k,v]) => <div key={k}>{k}: {v}</div>)}</dl>
          </div>
        ))}
      </div>
    </div>
  );
}
''',

"app/dealer/orders/new/page.tsx": '''import { prisma } from "@/lib/prisma";
import { submitDealerOrder } from "@/lib/actions";
import { DynamicFormFields } from "@/lib/dynamic-form";
import { Button } from "@/components/ui/button";

export default async function NewOrderPage() {
  const template = await prisma.formTemplate.findFirst({ where: { active: true }, include: { fields: { orderBy: { sortOrder: "asc" } } } });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Place Order</h1>
      {!template?.fields.length ? <p className="mt-4 text-gray-600">Order form not configured yet. Contact admin.</p> : (
        <form action={submitDealerOrder} className="mt-6 max-w-xl space-y-4 border bg-white p-6">
          <DynamicFormFields fields={template.fields} />
          <Button type="submit">Submit Order</Button>
        </form>
      )}
    </div>
  );
}
''',

"app/dealer/change-password/page.tsx": '''import { changePassword } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ChangePasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Change Password</h1>
      <form action={changePassword} className="mt-6 max-w-md space-y-4 border bg-white p-6">
        <div><Label>Current Password</Label><Input name="currentPassword" type="password" required className="mt-1" /></div>
        <div><Label>New Password</Label><Input name="newPassword" type="password" required className="mt-1" /></div>
        <Button type="submit">Update Password</Button>
      </form>
    </div>
  );
}
''',

"app/dealer/profile/page.tsx": '''import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user!.id } });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Profile</h1>
      <dl className="mt-6 space-y-3 border bg-white p-6 text-sm">
        <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{user?.name}</dd></div>
        <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
        <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{user?.phone || "—"}</dd></div>
      </dl>
    </div>
  );
}
''',
}

for rel, content in files.items():
    w(rel, content)

print("bootstrap11 done")