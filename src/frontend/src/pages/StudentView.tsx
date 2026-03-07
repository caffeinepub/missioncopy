import ContentViewerModal from "@/components/ContentViewerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStorageClient } from "@/hooks/useStorageClient";
import { type ContentItem, SECTIONS } from "@/types/missioncopy";
import { getContent } from "@/utils/storage";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  Play,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface StudentViewProps {
  batch: string;
  onBack: () => void;
}

export default function StudentView({ batch, onBack }: StudentViewProps) {
  const storageClient = useStorageClient();
  const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0]);
  const [viewerItem, setViewerItem] = useState<ContentItem | null>(null);

  const allContent = getContent();
  const batchContent = allContent.filter((item) => item.batch === batch);
  const sectionContent = batchContent.filter(
    (item) => item.section === selectedSection,
  );

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="h-14 border-b border-border/40 bg-brand-surface/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4 md:px-6 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground hover:bg-brand-surface-2 w-8 h-8"
          data-ocid="student.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-red rounded-sm flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-display font-black">
              M
            </span>
          </div>
          <span className="font-display font-black text-base tracking-tight text-foreground hidden sm:block">
            MISSION<span className="text-brand-red">COPY</span>
          </span>
        </div>
      </header>

      {/* Batch Header */}
      <div className="bg-brand-surface/30 border-b border-border/30 px-4 md:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 bg-brand-red rounded-full" />
            <Badge
              variant="outline"
              className="border-brand-red/30 text-brand-red bg-brand-red/5 font-mono text-[10px]"
            >
              STUDENT ACCESS
            </Badge>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mt-2 tracking-tight">
            {batch}
          </h1>
          <p className="text-muted-foreground text-sm font-body mt-1">
            {batchContent.length} resources available across all sections
          </p>
        </motion.div>
      </div>

      {/* Section Tabs */}
      <Tabs
        value={selectedSection}
        onValueChange={setSelectedSection}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 md:px-8 pt-4 border-b border-border/20 pb-0">
          <TabsList className="bg-brand-surface-2/50 border border-border/30 rounded-md h-9 p-0.5 w-fit">
            {SECTIONS.map((section, idx) => (
              <TabsTrigger
                key={section}
                value={section}
                className="font-body text-xs font-medium h-8 px-4 rounded data-[state=active]:bg-brand-red data-[state=active]:text-white data-[state=active]:shadow-none"
                data-ocid={`student.section.tab.${idx + 1}`}
              >
                {section}
                {batchContent.filter((i) => i.section === section).length >
                  0 && (
                  <span
                    className={`ml-1.5 text-[10px] font-mono ${
                      selectedSection === section
                        ? "text-white/70"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {batchContent.filter((i) => i.section === section).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {SECTIONS.map((section) => (
          <TabsContent
            key={section}
            value={section}
            className="flex-1 px-4 md:px-8 py-6 mt-0"
          >
            {sectionContent.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
                data-ocid="student.content.empty_state"
              >
                <div className="w-14 h-14 rounded-full bg-brand-surface-2 border border-border/40 flex items-center justify-center mb-4">
                  {section === "Lecture" ? (
                    <Video className="w-6 h-6 text-muted-foreground/30" />
                  ) : section === "PDF" ? (
                    <FileText className="w-6 h-6 text-muted-foreground/30" />
                  ) : (
                    <Play className="w-6 h-6 text-muted-foreground/30" />
                  )}
                </div>
                <p className="text-muted-foreground font-body text-sm">
                  No {section} content available yet
                </p>
                <p className="text-muted-foreground/40 text-xs mt-1 font-body">
                  Check back later or contact your instructor
                </p>
              </motion.div>
            ) : (
              <div className="max-w-3xl">
                <p className="text-muted-foreground text-xs font-body uppercase tracking-widest mb-4">
                  {sectionContent.length}{" "}
                  {section === "PDF"
                    ? "documents"
                    : section === "Lecture"
                      ? "lectures"
                      : "sessions"}
                </p>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {sectionContent.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="flex items-center gap-3 bg-brand-surface border border-border/40 rounded-lg p-3.5 hover:border-border/60 hover:bg-brand-surface-2/30 transition-all group cursor-pointer"
                        onClick={() => setViewerItem(item)}
                        data-ocid={`student.content.item.${idx + 1}`}
                      >
                        {/* Index */}
                        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0 bg-background border border-border/30">
                          <span className="text-muted-foreground/50 text-[10px] font-mono">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>

                        {/* File type icon */}
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                            item.fileType === "video"
                              ? "bg-brand-red/10"
                              : "bg-blue-500/10"
                          }`}
                        >
                          {item.fileType === "video" ? (
                            <Video className="w-3.5 h-3.5 text-brand-red" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-body text-sm font-semibold truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-4 px-1.5 ${
                                item.fileType === "video"
                                  ? "border-brand-red/25 text-brand-red/70"
                                  : "border-blue-400/25 text-blue-400/70"
                              }`}
                            >
                              {item.fileType === "video" ? "VIDEO" : "PDF"}
                            </Badge>
                            <span className="text-muted-foreground/40 text-[10px] font-body flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {formatDate(item.uploadedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Play/View button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 rounded-full bg-brand-surface-2/0 group-hover:bg-brand-red/10 text-muted-foreground group-hover:text-brand-red transition-all shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewerItem(item);
                          }}
                          data-ocid="student.content.view_button"
                        >
                          {item.fileType === "video" ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Footer */}
      <footer className="border-t border-border/20 py-4 px-6">
        <p className="text-center text-muted-foreground/40 text-xs font-body">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red/50 hover:text-brand-red transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Content Viewer */}
      {viewerItem && (
        <ContentViewerModal
          item={viewerItem}
          storageClient={storageClient}
          onClose={() => setViewerItem(null)}
        />
      )}
    </div>
  );
}
