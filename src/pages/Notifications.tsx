import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@/lib/userStore";

interface NotificationsProps {
  currentUser: User;
}

export const Notifications = ({ currentUser }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*, users!notifications_related_user_id_fkey(*)")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (data) setNotifications(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold p-4 border-b border-border">Notifications</h1>
      <div className="divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">No notifications yet</p>
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className="p-4 hover:bg-secondary/50 transition-colors border-0 border-b border-border rounded-none">
              <div className="flex gap-3">
                {notif.users && (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: notif.users.avatar_color }}
                  >
                    {notif.users.display_name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-foreground">{notif.content}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
