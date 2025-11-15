import { Home, User as UserIcon, MessageCircle, Bell, LogOut, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { User } from "@/lib/userStore";

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

export const Sidebar = ({ user, onLogout }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: UserIcon, label: "Profile", path: "/profile" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    toast({ title: "User ID copied!", description: "Save this to login again" });
  };

  return (
    <div className="hidden md:flex w-64 border-r border-border p-4 flex-col h-screen sticky top-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          PinkBird
        </h1>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-lg">{item.label}</span>
          </Button>
        ))}
      </nav>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center gap-3 p-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
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
          <p className="text-xs text-muted-foreground font-semibold px-2">Your User ID</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-xs font-mono"
            onClick={copyUserId}
          >
            <span className="truncate">{user.id.slice(0, 20)}...</span>
            <Copy className="w-3 h-3 ml-2 flex-shrink-0" />
          </Button>
          <p className="text-xs text-muted-foreground px-2">
            Save this to login on other devices
          </p>
        </div>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};
