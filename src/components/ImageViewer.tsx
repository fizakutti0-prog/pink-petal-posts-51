import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ imageUrl, isOpen, onClose }: ImageViewerProps) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-50 bg-black/50 hover:bg-black/70 text-white"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5" />
          </Button>
          <img
            src={imageUrl}
            alt="Full size"
            className="max-w-full max-h-[95vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
