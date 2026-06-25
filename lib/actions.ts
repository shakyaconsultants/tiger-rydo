"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, generateOrderNumber } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

async function requireDealer() {
  const session = await auth();
  if (session?.user?.role !== "DEALER") throw new Error("Unauthorized");
  return session!;
}

async function saveUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: String(formData.get("siteName") || ""),
      tagline: String(formData.get("tagline") || ""),
      phone: String(formData.get("phone") || ""),
      customerWhatsapp: String(formData.get("customerWhatsapp") || ""),
      dealershipWhatsapp: String(formData.get("dealershipWhatsapp") || ""),
      customerWhatsappMsg: String(formData.get("customerWhatsappMsg") || ""),
      dealershipWhatsappMsg: String(formData.get("dealershipWhatsappMsg") || ""),
      address: String(formData.get("address") || "") || null,
      footerText: String(formData.get("footerText") || "") || null,
    },
    create: { id: "default" },
  });
  revalidatePath("/");
}

export async function createProductType(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name"));
  await prisma.productType.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/product-types");
}

export async function createParameter(formData: FormData) {
  await requireAdmin();
  const productTypeId = String(formData.get("productTypeId"));
  const name = String(formData.get("name"));
  await prisma.parameterDefinition.create({
    data: {
      productTypeId,
      name,
      slug: slugify(name),
      fieldType: String(formData.get("fieldType")) as never,
      required: formData.get("required") === "on",
      options: String(formData.get("options") || "") || null,
    },
  });
  revalidatePath(`/admin/product-types/${productTypeId}/parameters`);
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const productTypeId = String(formData.get("productTypeId"));
  const name = String(formData.get("name"));
  const slug = slugify(String(formData.get("slug") || name));
  const product = id
    ? await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          productTypeId,
          published: formData.get("published") === "on",
          featured: formData.get("featured") === "on",
        },
      })
    : await prisma.product.create({
        data: { name, slug, productTypeId, published: formData.get("published") === "on", featured: formData.get("featured") === "on" },
      });

  const params = await prisma.parameterDefinition.findMany({ where: { productTypeId } });
  for (const p of params) {
    const raw = formData.get(p.slug);
    let value = raw == null ? "" : String(raw);
    const file = formData.get(`${p.slug}_file`);
    if (file instanceof File && file.size > 0) value = await saveUpload(file);
    await prisma.parameterValue.upsert({
      where: { productId_parameterId: { productId: product.id, parameterId: p.id } },
      update: { value },
      create: { productId: product.id, parameterId: p.id, value },
    });
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function createDealer(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash: hash, name: String(formData.get("name")), role: "DEALER", phone: String(formData.get("phone") || "") || null },
  });
  revalidatePath("/admin/dealers");
}

export async function resetDealerPassword(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const hash = await bcrypt.hash(String(formData.get("password")), 10);
  await prisma.user.update({ where: { id }, data: { passwordHash: hash } });
  revalidatePath("/admin/dealers");
}

export async function saveFormField(formData: FormData) {
  await requireAdmin();
  const template = await prisma.formTemplate.findFirst({ where: { active: true } });
  if (!template) return;
  const name = String(formData.get("name"));
  await prisma.formFieldDefinition.create({
    data: {
      formTemplateId: template.id,
      name,
      slug: slugify(name),
      fieldType: String(formData.get("fieldType")) as never,
      required: formData.get("required") === "on",
      options: String(formData.get("options") || "") || null,
    },
  });
  revalidatePath("/admin/form-builder");
}

export async function submitDealerOrder(formData: FormData) {
  const session = await requireDealer();
  const template = await prisma.formTemplate.findFirst({ where: { active: true }, include: { fields: true } });
  if (!template) throw new Error("No form template");
  const data: Record<string, string> = {};
  for (const field of template.fields) {
    const raw = formData.get(field.slug);
    data[field.name] = raw == null ? "" : String(raw);
  }
  const order = await prisma.dealerOrder.create({
    data: {
      orderNumber: generateOrderNumber(),
      dealerId: session.user!.id,
      formTemplateId: template.id,
      formData: JSON.stringify(data),
    },
  });
  redirect(`/dealer/orders?success=${order.orderNumber}`);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  await prisma.dealerOrder.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status")) as never, adminNotes: String(formData.get("adminNotes") || "") || null },
  });
  revalidatePath("/admin/orders");
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found");
  const current = String(formData.get("currentPassword"));
  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) throw new Error("Current password incorrect");
  const hash = await bcrypt.hash(String(formData.get("newPassword")), 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  redirect("/dealer");
}

export async function savePageSection(formData: FormData) {
  await requireAdmin();
  const page = String(formData.get("page"));
  const key = String(formData.get("key"));
  const body = String(formData.get("body"));
  await prisma.pageSection.upsert({
    where: { page_key: { page, key } },
    update: { title: String(formData.get("title") || ""), content: JSON.stringify({ body }) },
    create: { page, key, title: String(formData.get("title") || ""), content: JSON.stringify({ body }) },
  });
  revalidatePath("/about");
  revalidatePath("/admin/pages");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteHero(formData: FormData) {
  await requireAdmin();
  await prisma.heroBanner.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/");
  revalidatePath("/admin/heroes");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function createHero(formData: FormData) {
  await requireAdmin();
  await prisma.heroBanner.create({
    data: {
      title: String(formData.get("title")),
      subtitle: String(formData.get("subtitle") || "") || null,
      imageUrl: String(formData.get("imageUrl")),
      ctaText: String(formData.get("ctaText") || "") || null,
      ctaLink: String(formData.get("ctaLink") || "") || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/heroes");
}

export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  await prisma.testimonial.create({
    data: {
      name: String(formData.get("name")),
      role: String(formData.get("role") || "") || null,
      quote: String(formData.get("quote")),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}
