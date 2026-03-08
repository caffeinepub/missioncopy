import ContentViewerModal from "@/components/ContentViewerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStorageClient } from "@/hooks/useStorageClient";
import { BATCHES, type ContentItem, SECTIONS } from "@/types/missioncopy";
import {
  getLocalManifestHash,
  getLocalManifestItems,
  saveLocalManifestHash,
  saveLocalManifestItems,
  uploadFile as uploadFileToStorage,
  uploadManifest,
} from "@/utils/storage";
import {
  Calendar,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  LogOut,
  Play,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onLogout: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const storageClient = useStorageClient();
  const [selectedBatch, setSelectedBatch] = useState<string>(BATCHES[0]);
  const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0]);
  const [contentItems, setContentItems] = useState<ContentItem[]>(() =>
    getLocalManifestItems(),
  );
  const [manifestHash, setManifestHash] = useState<string | null>(() =>
    getLocalManifestHash(),
  );

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading-file" | "uploading-manifest" | "done"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content viewer
  const [viewerItem, setViewerItem] = useState<{
    item: ContentItem;
    url: string;
  } | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy link state
  const [copiedBatch, setCopiedBatch] = useState<string | null>(null);

  const filteredContent = contentItems.filter(
    (item) => item.batch === selectedBatch && item.section === selectedSection,
  );

  const getStudentLink = (batch?: string) => {
    if (!manifestHash) return "";
    const base = window.location.origin;
    const params = new URLSearchParams({ manifest: manifestHash });
    if (batch) params.set("batch", batch);
    return `${base}/?${params.toString()}`;
  };

  const handleCopyBatchLink = async (batch: string) => {
    const link = getStudentLink(batch);
    if (!link) {
      toast.error("No manifest yet. Upload content first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiedBatch(batch);
      toast.success(`Link for ${batch} copied!`);
      setTimeout(() => setCopiedBatch(null), 2500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.(mp4|pdf)$/i, ""));
      }
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".mp4") || file.name.endsWith(".pdf"))) {
        setUploadFile(file);
        if (!uploadTitle) {
          setUploadTitle(file.name.replace(/\.(mp4|pdf)$/i, ""));
        }
      } else {
        toast.error("Only MP4 and PDF files are supported");
      }
    },
    [uploadTitle],
  );

  const handleUpload = async () => {
    if (!uploadTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("uploading-file");

    const isVideo =
      uploadFile.name.toLowerCase().endsWith(".mp4") ||
      uploadFile.type.startsWith("video/");

    try {
      // 1. Upload the file bytes to blob storage
      const fileHash = await uploadFileToStorage(
        storageClient,
        uploadFile,
        (pct) => {
          setUploadProgress(Math.round(pct * 0.8)); // 0-80% for file upload
        },
      );

      setUploadStatus("uploading-manifest");
      setUploadProgress(85);

      const newItem: ContentItem = {
        id: generateId(),
        batch: selectedBatch,
        section: selectedSection,
        title: uploadTitle.trim(),
        fileType: isVideo ? "video" : "pdf",
        fileHash,
        uploadedAt: Date.now(),
      };

      const updatedItems = [...contentItems, newItem];

      // 2. Upload the manifest
      const newManifestHash = await uploadManifest(storageClient, updatedItems);

      setUploadProgress(100);

      // 3. Save locally
      saveLocalManifestItems(updatedItems);
      saveLocalManifestHash(newManifestHash);
      setContentItems(updatedItems);
      setManifestHash(newManifestHash);
      setUploadStatus("done");

      setTimeout(() => {
        setIsUploading(false);
        setUploadOpen(false);
        setUploadTitle("");
        setUploadFile(null);
        setUploadProgress(0);
        setUploadStatus("idle");
      }, 600);

      toast.success("Content uploaded — students can see it now!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please check your connection and try again.");
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus("idle");
    }
  };

  const handleOpenViewer = async (item: ContentItem) => {
    setViewerLoading(true);
    try {
      const url = await storageClient.getDirectURL(item.fileHash);
      setViewerItem({ item, url });
    } catch (err) {
      console.error(err);
      toast.error("Could not load file. Please try again.");
    } finally {
      setViewerLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const updatedItems = contentItems.filter((i) => i.id !== id);
      const newManifestHash = await uploadManifest(storageClient, updatedItems);
      saveLocalManifestItems(updatedItems);
      saveLocalManifestHash(newManifestHash);
      setContentItems(updatedItems);
      setManifestHash(newManifestHash);
      setDeleteId(null);
      toast.success("Content deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete content.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const uploadStatusText = () => {
    if (uploadStatus === "uploading-file") {
      return uploadProgress < 80 ? "Uploading file to CDN..." : "Processing...";
    }
    if (uploadStatus === "uploading-manifest")
      return "Updating content list...";
    if (uploadStatus === "done") return "Done!";
    return "";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border/40 bg-brand-surface/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4 md:px-6 gap-4">
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

        <Separator
          orientation="vertical"
          className="h-5 bg-border/40 hidden sm:block"
        />

        <Badge
          variant="outline"
          className="border-brand-red/40 text-brand-red bg-brand-red/5 font-mono text-xs"
        >
          ADMIN
        </Badge>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground hover:bg-brand-surface-2 gap-2 font-body text-xs"
            data-ocid="admin.logout_button"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Batch Selector */}
        <aside className="w-52 border-r border-border/30 bg-brand-surface/30 flex-shrink-0 hidden md:flex flex-col">
          <div className="p-4 pb-2">
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-body font-semibold mb-3">
              Batches
            </p>
          </div>
          <div className="flex-1 px-2 space-y-0.5">
            {BATCHES.map((batch, idx) => (
              <button
                type="button"
                key={batch}
                onClick={() => setSelectedBatch(batch)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-body transition-all flex items-center gap-2 group ${
                  selectedBatch === batch
                    ? "bg-brand-red text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-brand-surface-2"
                }`}
                data-ocid={`admin.batch.tab.${idx + 1}`}
              >
                <ChevronRight
                  className={`w-3 h-3 shrink-0 transition-transform ${
                    selectedBatch === batch
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-50"
                  }`}
                />
                <span className="truncate font-medium">{batch}</span>
              </button>
            ))}
          </div>

          {/* Student Access Share */}
          <div className="p-3 border-t border-border/30 mt-auto space-y-2">
            <p className="text-[10px] text-muted-foreground/60 font-body uppercase tracking-widest flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              Student Links
            </p>
            {manifestHash ? (
              <div className="space-y-1">
                {BATCHES.map((batch) => (
                  <button
                    key={batch}
                    type="button"
                    onClick={() => handleCopyBatchLink(batch)}
                    className="w-full text-left px-2 py-1.5 rounded text-[11px] font-body text-muted-foreground hover:text-foreground hover:bg-brand-surface-2 flex items-center gap-1.5 transition-all"
                    data-ocid="admin.student.link.button"
                    title={`Copy student link for ${batch}`}
                  >
                    {copiedBatch === batch ? (
                      <Check className="w-3 h-3 text-green-500 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 shrink-0 opacity-50" />
                    )}
                    <span className="truncate">{batch}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground/40 font-body">
                Upload content to generate links
              </p>
            )}
          </div>
        </aside>

        {/* Mobile Batch Selector */}
        <div className="md:hidden w-full border-b border-border/30 bg-brand-surface/30 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {BATCHES.map((batch, idx) => (
              <button
                type="button"
                key={batch}
                onClick={() => setSelectedBatch(batch)}
                className={`px-3 py-1.5 rounded-md text-xs font-body font-medium whitespace-nowrap transition-all ${
                  selectedBatch === batch
                    ? "bg-brand-red text-white"
                    : "text-muted-foreground hover:text-foreground bg-brand-surface"
                }`}
                data-ocid={`admin.batch.tab.${idx + 1}`}
              >
                {batch}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Batch Header */}
          <div className="px-4 md:px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-brand-red rounded-full shrink-0" />
                <h2 className="font-display font-bold text-foreground text-xl truncate">
                  {selectedBatch}
                </h2>
              </div>
              <p className="text-muted-foreground text-sm font-body mt-0.5 pl-3.5">
                {filteredContent.length} items in {selectedSection}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile: copy link button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyBatchLink(selectedBatch)}
                disabled={!manifestHash}
                className="border-border/40 text-muted-foreground hover:text-foreground hover:border-brand-red/40 gap-1.5 font-body text-xs md:hidden"
                data-ocid="admin.student.link.button"
              >
                {copiedBatch === selectedBatch ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Share
              </Button>

              <Button
                size="sm"
                onClick={() => setUploadOpen(true)}
                className="bg-brand-red hover:bg-brand-red-bright text-white gap-1.5 font-body text-xs font-semibold"
                data-ocid="admin.upload.open_modal_button"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Content
              </Button>
            </div>
          </div>

          {/* Student Access Banner (visible when manifest exists) */}
          {manifestHash && (
            <div className="px-4 md:px-6 py-2 bg-green-500/5 border-b border-green-500/10 hidden md:flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <p className="text-green-400/80 text-xs font-body flex-1">
                Content is live — students on any device can access it via the
                batch links
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyBatchLink(selectedBatch)}
                className="text-green-400/70 hover:text-green-400 hover:bg-green-500/10 gap-1.5 font-body text-xs h-7 px-2"
                data-ocid="admin.student.copy_link.button"
              >
                {copiedBatch === selectedBatch ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                Copy {selectedBatch} link
              </Button>
            </div>
          )}

          {/* Section Tabs + Content */}
          <Tabs
            value={selectedSection}
            onValueChange={setSelectedSection}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="mx-4 md:mx-6 mt-4 mb-0 bg-brand-surface-2/50 border border-border/30 rounded-md h-9 p-0.5 shrink-0 w-fit">
              {SECTIONS.map((section, idx) => (
                <TabsTrigger
                  key={section}
                  value={section}
                  className="font-body text-xs font-medium h-8 px-4 rounded data-[state=active]:bg-brand-red data-[state=active]:text-white data-[state=active]:shadow-none"
                  data-ocid={`admin.section.tab.${idx + 1}`}
                >
                  {section}
                </TabsTrigger>
              ))}
            </TabsList>

            {SECTIONS.map((section) => (
              <TabsContent
                key={section}
                value={section}
                className="flex-1 overflow-hidden mt-4 px-4 md:px-6 pb-4"
              >
                <ScrollArea className="h-full">
                  {filteredContent.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-20 text-center"
                      data-ocid="admin.content.empty_state"
                    >
                      <div className="w-14 h-14 rounded-full bg-brand-surface-2 border border-border/40 flex items-center justify-center mb-4">
                        {section === "Lecture" ? (
                          <Video className="w-6 h-6 text-muted-foreground/40" />
                        ) : section === "PDF" ? (
                          <FileText className="w-6 h-6 text-muted-foreground/40" />
                        ) : (
                          <Play className="w-6 h-6 text-muted-foreground/40" />
                        )}
                      </div>
                      <p className="text-muted-foreground font-body text-sm font-medium">
                        No {section} content yet
                      </p>
                      <p className="text-muted-foreground/50 text-xs mt-1 font-body">
                        Click "Upload Content" to add content to this section
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                        className="mt-4 bg-brand-red hover:bg-brand-red-bright text-white gap-1.5 font-body text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First Content
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {filteredContent.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 bg-brand-surface border border-border/40 rounded-lg p-3.5 group hover:border-border/60 transition-colors"
                            data-ocid={`admin.content.item.${idx + 1}`}
                          >
                            <div
                              className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                                item.fileType === "video"
                                  ? "bg-brand-red/10 border border-brand-red/20"
                                  : "bg-blue-500/10 border border-blue-500/20"
                              }`}
                            >
                              {item.fileType === "video" ? (
                                <Video className="w-4 h-4 text-brand-red" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-body text-sm font-semibold truncate">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] h-4 px-1.5 ${
                                    item.fileType === "video"
                                      ? "border-brand-red/30 text-brand-red"
                                      : "border-blue-400/30 text-blue-400"
                                  }`}
                                >
                                  {item.fileType === "video" ? "VIDEO" : "PDF"}
                                </Badge>
                                <span className="text-muted-foreground/50 text-[10px] font-body flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {formatDate(item.uploadedAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenViewer(item)}
                                disabled={viewerLoading}
                                className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-brand-surface-2"
                                title="View content"
                                data-ocid="admin.content.view_button"
                              >
                                {viewerLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : item.fileType === "video" ? (
                                  <Play className="w-3.5 h-3.5" />
                                ) : (
                                  <ExternalLink className="w-3.5 h-3.5" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteId(item.id)}
                                className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete"
                                data-ocid={`admin.content.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>

      {/* Upload Dialog */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(v) => !isUploading && setUploadOpen(v)}
      >
        <DialogContent
          className="bg-brand-surface border border-border max-w-md"
          data-ocid="admin.upload.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand-red" />
              Upload Content
            </DialogTitle>
            <p className="text-muted-foreground text-xs font-body mt-1">
              Adding to:{" "}
              <span className="text-foreground font-semibold">
                {selectedBatch}
              </span>{" "}
              → <span className="text-brand-red">{selectedSection}</span>
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-body">
                Title
              </Label>
              <Input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter content title..."
                className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-brand-red focus-visible:border-brand-red font-body text-sm"
                data-ocid="admin.upload.title_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-body">
                File
              </Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  uploadFile
                    ? "border-brand-red/50 bg-brand-red/5"
                    : "border-border/40 hover:border-brand-red/30 hover:bg-brand-surface-2/50"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                data-ocid="admin.upload.dropzone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.pdf,video/mp4,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadFile ? (
                    <div className="space-y-1">
                      <div
                        className={`mx-auto w-8 h-8 rounded flex items-center justify-center mb-2 ${
                          uploadFile.name.endsWith(".mp4")
                            ? "bg-brand-red/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        {uploadFile.name.endsWith(".mp4") ? (
                          <Video className="w-4 h-4 text-brand-red" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <p className="text-foreground text-sm font-body font-medium truncate max-w-full">
                        {uploadFile.name}
                      </p>
                      <p className="text-muted-foreground/60 text-xs font-body">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm font-body">
                        Drop file here or click to browse
                      </p>
                      <p className="text-muted-foreground/50 text-xs mt-1 font-body">
                        Supports MP4 and PDF · Up to 1 GB
                      </p>
                    </>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                  data-ocid="admin.upload.loading_state"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-body">
                      {uploadStatusText()}
                    </span>
                    <span className="text-brand-red text-xs font-mono">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress
                    value={uploadProgress}
                    className="h-1.5 bg-brand-surface-2"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setUploadOpen(false)}
              disabled={isUploading}
              className="text-muted-foreground hover:text-foreground font-body text-sm"
              data-ocid="admin.upload.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !uploadFile}
              className="bg-brand-red hover:bg-brand-red-bright text-white font-body font-semibold gap-2"
              data-ocid="admin.upload.submit_button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="bg-brand-surface border border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              Delete Content
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm font-body py-2">
            Are you sure you want to delete this content? This action cannot be
            undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
              className="text-muted-foreground font-body text-sm"
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/80 text-destructive-foreground font-body font-semibold gap-2"
              data-ocid="admin.delete.confirm_button"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Viewer */}
      {viewerItem && (
        <ContentViewerModal
          title={viewerItem.item.title}
          batch={viewerItem.item.batch}
          section={viewerItem.item.section}
          fileType={viewerItem.item.fileType}
          fileUrl={viewerItem.url}
          onClose={() => setViewerItem(null)}
        />
      )}
    </div>
  );
}
