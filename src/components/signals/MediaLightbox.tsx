import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, Volume2, VolumeX, Maximize, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  videoUrl?: string;
  title?: string;
  platform?: string;
  author?: string;
}

export function MediaLightbox({
  isOpen,
  onClose,
  imageUrl,
  videoUrl,
  title,
  platform,
  author,
}: MediaLightboxProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setVideoError(false);
    }
  }, [isOpen]);

  const handleVideoToggle = () => {
    const video = document.getElementById("lightbox-video") as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    const video = document.getElementById("lightbox-video") as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const hasVideo = videoUrl && !videoError;
  const mediaUrl = hasVideo ? videoUrl : imageUrl;

  if (!mediaUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/90 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  {title}
                </h3>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {platform && <span>{platform}</span>}
                {author && (
                  <>
                    <span>•</span>
                    <span>@{author}</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-background/50 hover:bg-background/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Media Content */}
        <div className="relative aspect-[16/10] bg-black flex items-center justify-center">
          {hasVideo ? (
            <>
              <video
                id="lightbox-video"
                src={videoUrl}
                poster={imageUrl}
                className="max-w-full max-h-full object-contain"
                loop
                muted={isMuted}
                playsInline
                onError={() => setVideoError(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVideoToggle}
                  className="h-16 w-16 rounded-full bg-background/80 hover:bg-background/90 hover:scale-110 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </div>

              {/* Video Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleVideoToggle}
                      className="h-8 w-8 rounded-full bg-background/50"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMuteToggle}
                      className="h-8 w-8 rounded-full bg-background/50"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Original
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <img
              src={imageUrl}
              alt={title || "Trend media"}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
