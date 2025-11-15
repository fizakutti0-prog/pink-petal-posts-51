import { Menu, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { User } from "@/lib/userStore";

interface MobileHeaderProps {
  user: User;
  onLogout: () => void;
}

export const MobileHeader = ({ user, onLogout }: MobileHeaderProps) => {
  const { toast } = useToast();

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    toast({ title: "User ID copied!", description: "Save this to login again" });
  };

  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border md:hidden z-40">
      <div className="flex items-center justify-between p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  PinkBird
                </h1>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: user.avatar_color }}
                >
                  {user.display_name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{user.display_name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">Your User ID</p>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                    {user.id}
                  </div>
                  <Button size="icon" variant="outline" onClick={copyUserId}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save this ID to login on other devices
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          PinkBird
        </h1>

        <ThemeToggle />
      </div>
    </div>
  );
};
