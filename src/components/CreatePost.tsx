import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import type { User } from "@/lib/userStore";

interface CreatePostProps {
  user: User;
  onPostCreated?: () => void;
  replyTo?: string;
  onCancel?: () => void;
}

export const CreatePost = ({ user, onPostCreated, replyTo, onCancel }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const handlePost = async () => {
    if (!content.trim()) return;
    if (content.length > 280) {
      toast({ title: "Post is too long! Max 280 characters", variant: "destructive" });
      return;
    }

    setIsPosting(true);

    const { error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        content: content.trim(),
        reply_to: replyTo,
        image_url: imageUrl || null,
      },
    ]);

    setIsPosting(false);

    if (error) {
      toast({ title: "Failed to post", variant: "destructive" });
      return;
    }

    setContent("");
    setImageUrl("");
    toast({ title: replyTo ? "Reply posted!" : "Posted!" });
    onPostCreated?.();
  };

  return (
    <Card className="p-4 border-border rounded-none md:rounded-lg">
      <div className="flex gap-3">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
          style={{ background: user.avatar_color }}
        >
          {user.display_name[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <Textarea
            placeholder={replyTo ? "Post your reply..." : "What's happening?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] border-0 focus-visible:ring-0 text-base resize-none"
            maxLength={280}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <ImageUpload
                onImageUploaded={setImageUrl}
                currentImage={imageUrl}
                onImageRemoved={() => setImageUrl("")}
              />
              <span className="text-sm text-muted-foreground">{content.length}/280</span>
            </div>
            <div className="flex gap-2">
              {replyTo && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={handlePost}
                disabled={!content.trim() || isPosting}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isPosting ? "Posting..." : replyTo ? "Reply" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
