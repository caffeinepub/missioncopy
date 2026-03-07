import { Button } from "@/components/ui/button";
import type { ContentItem } from "@/types/missioncopy";
import type { StorageClient } from "@/utils/StorageClient";
import { AlertCircle, FileText, Loader2, Video, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface ContentViewerModalProps {
  item: ContentItem;
  storageClient: StorageClient;
  onClose: () => void;
}

export default function ContentViewerModal({
  item,
  storageClient,
  onClose,
}: ContentViewerModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadUrl = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const directUrl = await storageClient.getDirectURL(item.blobHash);
        if (!cancelled) {
          setUrl(directUrl);
        }
      } catch (err) {
        console.error("Failed to load content URL:", err);
        if (!cancelled) {
          setError("Failed to load content. Please try again.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadUrl();

    return () => {
      cancelled = true;
    };
  }, [item.blobHash, storageClient]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
        data-ocid="content.viewer.modal"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 bg-brand-surface/80 border-b border-border/40 shrink-0">
          <div
            className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
              item.fileType === "video" ? "bg-brand-red/20" : "bg-blue-500/20"
            }`}
          >
            {item.fileType === "video" ? (
              <Video className="w-3.5 h-3.5 text-brand-red" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-display font-bold text-sm truncate">
              {item.title}
            </h3>
            <p className="text-muted-foreground text-[10px] font-body">
              {item.batch} · {item.section}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-brand-surface-2 shrink-0"
            data-ocid="content.viewer.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-auto">
          {isLoading ? (
            <div
              className="flex flex-col items-center gap-3"
              data-ocid="content.viewer.loading_state"
            >
              <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
              <p className="text-muted-foreground text-sm font-body">
                Loading content...
              </p>
            </div>
          ) : error ? (
            <div
              className="flex flex-col items-center gap-3 text-center max-w-sm"
              data-ocid="content.viewer.error_state"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-destructive font-body text-sm">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="border-border/50 text-muted-foreground font-body text-xs"
              >
                Close
              </Button>
            </div>
          ) : url ? (
            item.fileType === "video" ? (
              <div className="w-full max-w-4xl">
                <video
                  src={url}
                  controls
                  autoPlay={false}
                  className="w-full rounded-lg bg-black border border-border/30"
                  style={{ maxHeight: "calc(100vh - 160px)" }}
                  data-ocid="content.viewer.canvas_target"
                >
                  <track kind="captions" />
                  Your browser does not support HTML5 video.
                </video>
              </div>
            ) : (
              <div className="w-full max-w-5xl h-full">
                <iframe
                  src={url}
                  title={item.title}
                  className="w-full rounded-lg border border-border/30 bg-white"
                  style={{ height: "calc(100vh - 160px)" }}
                  data-ocid="content.viewer.canvas_target"
                />
              </div>
            )
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
