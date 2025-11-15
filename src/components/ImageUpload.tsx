import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onImageRemoved?: () => void;
}

export const ImageUpload = ({ onImageUploaded, currentImage, onImageRemoved }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    setUploading(false);

    if (error) {
      toast({ title: "Upload failed", variant: "destructive" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("post-images")
      .getPublicUrl(data.path);

    onImageUploaded(publicUrl);
  };

  return (
    <div className="flex items-center gap-2">
      {currentImage ? (
        <div className="relative">
          <img src={currentImage} alt="Upload preview" className="h-20 w-20 object-cover rounded-lg" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={onImageRemoved}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span>
              <Image className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Add Image"}
            </span>
          </Button>
        </label>
      )}
    </div>
  );
};
