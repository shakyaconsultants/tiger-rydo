import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AdminHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex items-center justify-between border-b pb-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
        <Button type="submit" variant="outline" size="sm">Sign out</Button>
      </form>
    </div>
  );
}
