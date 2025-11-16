import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import type { User } from "@/lib/userStore";

interface ProfileProps {
  currentUser?: User;
}

export const Profile = ({ currentUser }: ProfileProps) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();

  const profileUserId = userId || currentUser?.id;

  useEffect(() => {
    if (profileUserId) {
      fetchProfile();
      fetchPosts();
      fetchStats();
      checkFollowing();
    }
  }, [profileUserId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", profileUserId)
      .single();
    if (data) setUser(data as User);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        user:users!posts_user_id_fkey(*),
        likes(count),
        retweets(count)
      `)
      .eq("user_id", profileUserId)
      .is("reply_to", null)
      .order("created_at", { ascending: false });

    if (data) {
      const postsWithCounts = await Promise.all(
        data.map(async (post: any) => {
          const { count: repliesCount } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("reply_to", post.id);

          return {
            ...post,
            likes_count: post.likes?.[0]?.count || 0,
            retweets_count: post.retweets?.[0]?.count || 0,
            replies_count: repliesCount || 0,
            is_liked: false,
            is_retweeted: false,
          };
        })
      );
      setPosts(postsWithCounts);
    }
  };

  const fetchStats = async () => {
    const [{ count: followersCount }, { count: followingCount }, { count: postsCount }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileUserId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileUserId),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", profileUserId),
    ]);

    setStats({
      followers: followersCount || 0,
      following: followingCount || 0,
      posts: postsCount || 0,
    });
  };

  const checkFollowing = async () => {
    if (!currentUser || currentUser.id === profileUserId) return;

    const { data } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profileUserId)
      .single();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Please create an account first", variant: "destructive" });
      return;
    }

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", profileUserId);
      setIsFollowing(false);
      setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
    } else {
      await supabase
        .from("follows")
        .insert([{ follower_id: currentUser.id, following_id: profileUserId }]);
      setIsFollowing(true);
      setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
    }
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast({ title: "User ID copied to clipboard!" });
    }
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-border">
        <div className="h-48 bg-gradient-primary"></div>
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div
              className="w-32 h-32 rounded-full border-4 border-background flex items-center justify-center text-white text-4xl font-bold"
              style={{ background: user.avatar_color }}
            >
              {user.display_name[0].toUpperCase()}
            </div>
            {currentUser?.id !== user.id && (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/messages', { state: { selectedUser: user } })}
                  variant="outline"
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className="gap-2"
                >
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <h2 className="text-2xl font-bold">{user.display_name}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {user.bio && <p className="text-foreground">{user.bio}</p>}

            <Button
              variant="ghost"
              size="sm"
              onClick={copyUserId}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-4 h-4" />
              Copy User ID
            </Button>

            <div className="flex gap-4 text-sm">
              <span>
                <strong>{stats.following}</strong> Following
              </span>
              <span>
                <strong>{stats.followers}</strong> Followers
              </span>
              <span>
                <strong>{stats.posts}</strong> Posts
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onDelete={fetchPosts}
            onUpdate={fetchPosts}
          />
        ))}
      </div>
    </div>
  );
};
