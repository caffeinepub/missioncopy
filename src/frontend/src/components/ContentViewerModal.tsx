import { Button } from "@/components/ui/button";
import { FileText, Video, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface ContentViewerModalProps {
  title: string;
  batch: string;
  section: string;
  fileType: "video" | "pdf";
  fileUrl: string;
  onClose: () => void;
}

export default function ContentViewerModal({
  title,
  batch,
  section,
  fileType,
  fileUrl,
  onClose,
}: ContentViewerModalProps) {
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
              fileType === "video" ? "bg-brand-red/20" : "bg-blue-500/20"
            }`}
          >
            {fileType === "video" ? (
              <Video className="w-3.5 h-3.5 text-brand-red" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-display font-bold text-sm truncate">
              {title}
            </h3>
            <p className="text-muted-foreground text-[10px] font-body">
              {batch} · {section}
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
          {fileType === "video" ? (
            <div className="w-full max-w-4xl">
              <video
                src={fileUrl}
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
            <div className="w-full max-w-5xl h-full flex flex-col gap-3">
              <iframe
                src={fileUrl}
                title={title}
                className="w-full rounded-lg border border-border/30 bg-white"
                style={{ height: "calc(100vh - 200px)" }}
                data-ocid="content.viewer.canvas_target"
              />
              <div className="flex justify-center">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-red/70 hover:text-brand-red text-xs font-body flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  Open PDF in new tab
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
