import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import Index from "./pages/Index";
import { Profile } from "./pages/Profile";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { getCurrentUser, logoutUser } from "@/lib/userStore";
import type { User } from "@/lib/userStore";

const queryClient = new QueryClient();

const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  if (!user) {
    return <Index onUserCreated={setUser} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <MobileHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Index onUserCreated={setUser} currentUser={user} />} />
            <Route path="/profile" element={<Profile currentUser={user} />} />
            <Route path="/profile/:userId" element={<Profile currentUser={user} />} />
            <Route path="/messages" element={<Messages currentUser={user} />} />
            <Route path="/notifications" element={<Notifications currentUser={user} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
