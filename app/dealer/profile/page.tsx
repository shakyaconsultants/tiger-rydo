import { auth } from "@/lib/auth";
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
