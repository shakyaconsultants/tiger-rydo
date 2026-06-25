import { changePassword } from "@/lib/actions";
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
