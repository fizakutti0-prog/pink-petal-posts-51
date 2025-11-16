import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { createAnonymousUser, loginWithUserId } from "@/lib/userStore";
import type { User } from "@/lib/userStore";

interface IndexProps {
  onUserCreated: (user: User) => void;
  currentUser?: User;
}

const Index = ({ onUserCreated, currentUser }: IndexProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loginId, setLoginId] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(*),
        likes(count),
        retweets(count)
      `)
      .is("reply_to", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return;
    }

    const postsWithCounts = await Promise.all(
      (postsData || []).map(async (post) => {
        const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
        const retweetsCount = Array.isArray(post.retweets) ? post.retweets.length : 0;

        // Count replies
        const { count: repliesCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("reply_to", post.id);

        let isLiked = false;
        let isRetweeted = false;

        if (currentUser) {
          const { data: likeData } = await supabase
            .from("likes")
            .select("id")
            .eq("user_id", currentUser.id)
            .eq("post_id", post.id)
            .maybeSingle();

          const { data: retweetData } = await supabase
            .from("retweets")
            .select("id")
            .eq("user_id", currentUser.id)
            .eq("post_id", post.id)
            .maybeSingle();

          isLiked = !!likeData;
          isRetweeted = !!retweetData;
        }

        return {
          ...post,
          likes_count: likesCount,
          retweets_count: retweetsCount,
          replies_count: repliesCount || 0,
          is_liked: isLiked,
          is_retweeted: isRetweeted,
        };
      })
    );

    setPosts(postsWithCounts);
  };

  const handleCreateAccount = async () => {
    try {
      const newUser = await createAnonymousUser();
      onUserCreated(newUser);
      toast({
        title: "Account created!",
        description: `Your user ID is: ${newUser.id}. Save this to login again!`,
        duration: 8000,
      });
    } catch (error) {
      toast({ title: "Failed to create account", variant: "destructive" });
    }
  };

  const handleLogin = async () => {
    if (!loginId.trim()) {
      toast({ title: "Please enter a user ID", variant: "destructive" });
      return;
    }

    const user = await loginWithUserId(loginId.trim());
    if (user) {
      onUserCreated(user);
      toast({ title: "Logged in successfully!" });
    } else {
      toast({ title: "User not found", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!currentUser ? (
        <div className="container max-w-md mx-auto py-12 md:py-20 px-4">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="space-y-2 md:space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PinkBird
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">Join the conversation</p>
            </div>

            <Card className="p-4 md:p-6 space-y-4 border-border shadow-pink">
              <div className="space-y-3">
                <Button
                  onClick={handleCreateAccount}
                  className="w-full h-12 md:h-14 text-base md:text-lg bg-gradient-primary hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create New Account
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your unique ID will be generated for future logins
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Enter your User ID to login"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="h-12 md:h-14"
                />
                <Button onClick={handleLogin} variant="outline" className="w-full h-12 md:h-14" size="lg">
                  Login with User ID
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="hidden md:block border-b border-border p-4 sticky top-0 bg-background/80 backdrop-blur-lg z-10">
            <h1 className="text-2xl font-bold">Home</h1>
          </div>
          
          <div className="px-4 md:px-0 pt-4 md:pt-0">
            {replyingTo ? (
              <CreatePost
                user={currentUser}
                replyTo={replyingTo}
                onPostCreated={() => {
                  fetchPosts();
                  setReplyingTo(null);
                }}
                onCancel={() => setReplyingTo(null)}
              />
            ) : (
              <CreatePost user={currentUser} onPostCreated={fetchPosts} />
            )}
          </div>

          <div className="mt-2 md:mt-4">
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
      )}
    </div>
  );
};

export default Index;
