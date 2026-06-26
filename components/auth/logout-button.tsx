import { LogOut } from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
        Logout
      </Button>
    </form>
  );
}
