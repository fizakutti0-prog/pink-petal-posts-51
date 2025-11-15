import { useState } from "react";
import { Heart, Repeat2, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ImageViewer } from "@/components/ImageViewer";
import { CreatePost } from "@/components/CreatePost";
import type { User } from "@/lib/userStore";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    image_url?: string;
    user: {
      id: string;
      username: string;
      display_name: string;
      avatar_color: string;
    };
    likes_count?: number;
    retweets_count?: number;
    replies_count?: number;
    is_liked?: boolean;
    is_retweeted?: boolean;
  };
  currentUser?: User;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export const PostCard = ({ post, currentUser, onDelete, onUpdate }: PostCardProps) => {
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [retweets, setRetweets] = useState(post.retweets_count || 0);
  const [replies, setReplies] = useState(post.replies_count || 0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isRetweeted, setIsRetweeted] = useState(post.is_retweeted || false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    if (!currentUser) {
      toast({ title: "Please create an account first", variant: "destructive" });
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("post_id", post.id);

      if (!error) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert([{ user_id: currentUser.id, post_id: post.id }]);

      if (!error) {
        setLikes(likes + 1);
        setIsLiked(true);
      }
    }
  };

  const handleRetweet = async () => {
    if (!currentUser) {
      toast({ title: "Please create an account first", variant: "destructive" });
      return;
    }

    if (isRetweeted) {
      const { error } = await supabase
        .from("retweets")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("post_id", post.id);

      if (!error) {
        setRetweets(retweets - 1);
        setIsRetweeted(false);
      }
    } else {
      const { error } = await supabase
        .from("retweets")
        .insert([{ user_id: currentUser.id, post_id: post.id }]);

      if (!error) {
        setRetweets(retweets + 1);
        setIsRetweeted(true);
      }
    }
  };

  const handleDelete = async () => {
    if (post.user.id !== currentUser?.id) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (!error) {
      toast({ title: "Post deleted" });
      onDelete?.();
    }
  };

  const handleReplyComplete = () => {
    setShowReplyForm(false);
    setReplies(replies + 1);
    onUpdate?.();
  };

  return (
    <Card className="p-4 hover:bg-secondary/30 transition-colors border-0 md:border rounded-none md:rounded-lg shadow-none">
      <div className="flex gap-3">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
          style={{ background: post.user.avatar_color }}
        >
          {post.user.display_name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-foreground">{post.user.display_name}</span>
            <span className="text-muted-foreground text-sm">@{post.user.username}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-foreground mb-3 whitespace-pre-wrap break-words">{post.content}</p>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post image"
              className="rounded-lg mb-3 max-h-96 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImageViewer(true)}
            />
          )}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{replies}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${
                isRetweeted
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              onClick={handleRetweet}
            >
              <Repeat2 className="w-4 h-4" />
              <span className="text-xs">{retweets}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${
                isLiked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{likes}</span>
            </Button>
            {post.user.id === currentUser?.id && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {showReplyForm && currentUser && (
        <div className="mt-2 pl-12 border-l-2 border-primary/20">
          <CreatePost
            user={currentUser}
            replyTo={post.id}
            onPostCreated={handleReplyComplete}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
      {post.image_url && (
        <ImageViewer
          imageUrl={post.image_url}
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </Card>
  );
};
