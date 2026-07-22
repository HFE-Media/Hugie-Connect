import { LogOut } from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm" className={cn("min-h-10", className)}>
        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
        Logout
      </Button>
    </form>
  );
}
