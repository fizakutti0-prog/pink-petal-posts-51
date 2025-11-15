import { Home, User as UserIcon, MessageCircle, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: UserIcon, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50 safe-area-bottom">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-none ${
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className={`w-6 h-6 ${location.pathname === item.path ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px]">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
};
