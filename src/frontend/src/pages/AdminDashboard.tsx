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
import {
  BATCHES,
  type ContentItem,
  type InviteToken,
  SECTIONS,
} from "@/types/missioncopy";
import {
  addContentItem,
  addInviteToken,
  deleteContentItem,
  getContent,
  getInvites,
} from "@/utils/storage";
import {
  Calendar,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
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
  const [contentItems, setContentItems] = useState<ContentItem[]>(getContent);
  const [invites, setInvites] = useState<InviteToken[]>(getInvites);

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState("");
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [viewInvitesOpen, setViewInvitesOpen] = useState(false);

  // Content viewer
  const [viewerItem, setViewerItem] = useState<ContentItem | null>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredContent = contentItems.filter(
    (item) => item.batch === selectedBatch && item.section === selectedSection,
  );

  const batchInvites = invites.filter((inv) => inv.batch === selectedBatch);

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

    try {
      const bytes = new Uint8Array(await uploadFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setUploadProgress(pct);
      });

      const isVideo =
        uploadFile.name.toLowerCase().endsWith(".mp4") ||
        uploadFile.type.startsWith("video/");

      const newItem: ContentItem = {
        id: generateId(),
        batch: selectedBatch,
        section: selectedSection,
        title: uploadTitle.trim(),
        fileType: isVideo ? "video" : "pdf",
        blobHash: hash,
        uploadedAt: Date.now(),
      };

      addContentItem(newItem);
      setContentItems(getContent());
      setUploadOpen(false);
      setUploadTitle("");
      setUploadFile(null);
      setUploadProgress(0);
      toast.success("Content uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true);
    try {
      // Generate a random invite code (backend-independent fallback)
      const code = `MC-${selectedBatch.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
      const token: InviteToken = {
        code,
        batch: selectedBatch,
        createdAt: Date.now(),
      };
      addInviteToken(token);
      setInvites(getInvites());
      const url = `${window.location.origin}/?invite=${encodeURIComponent(code)}`;
      setGeneratedInviteUrl(url);
      setInviteOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate invite link");
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteContentItem(id);
    setContentItems(getContent());
    setDeleteId(null);
    toast.success("Content deleted");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

          {/* Batch stats */}
          <div className="p-4 border-t border-border/30 mt-auto">
            <p className="text-[10px] text-muted-foreground/60 font-body mb-1">
              Selected batch
            </p>
            <p className="text-foreground text-xs font-body font-semibold truncate">
              {selectedBatch}
            </p>
            <p className="text-muted-foreground text-[10px] mt-0.5 font-body">
              {contentItems.filter((i) => i.batch === selectedBatch).length}{" "}
              items total
            </p>
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewInvitesOpen(true)}
                className="border-border/50 text-muted-foreground hover:text-foreground hover:border-brand-red/30 gap-1.5 font-body text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Invites</span>
                <span className="sm:hidden">Invites</span>
                {batchInvites.length > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-0.5 border-brand-red/30 text-brand-red text-[10px] h-4 px-1"
                  >
                    {batchInvites.length}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateInvite}
                disabled={isGeneratingInvite}
                variant="outline"
                className="border-brand-red/40 text-brand-red hover:bg-brand-red/5 gap-1.5 font-body text-xs"
                data-ocid="admin.invite.button"
              >
                {isGeneratingInvite ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Generate Invite</span>
                <span className="sm:hidden">Invite</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setUploadOpen(true)}
                className="bg-brand-red hover:bg-brand-red-bright text-white gap-1.5 font-body text-xs font-semibold"
                data-ocid="admin.upload.open_modal_button"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload
              </Button>
            </div>
          </div>

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
                        Click "Upload" to add content to this section
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
                            {/* File type icon */}
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

                            {/* Content info */}
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

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setViewerItem(item)}
                                className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-brand-surface-2"
                                title="View content"
                                data-ocid="admin.content.view_button"
                              >
                                {item.fileType === "video" ? (
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
            {/* Title */}
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

            {/* File Drop Zone */}
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
                  accept=".mp4,.pdf"
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
                        Supports MP4 and PDF
                      </p>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Upload Progress */}
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
                      Uploading...
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

      {/* Invite Generated Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent
          className="bg-brand-surface border border-border max-w-md"
          data-ocid="admin.invite.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-brand-red" />
              Invite Link Generated
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-muted-foreground text-sm font-body">
              Share this link with students for{" "}
              <span className="text-foreground font-semibold">
                {selectedBatch}
              </span>
              :
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-background border border-border/50 rounded px-3 py-2 font-mono text-xs text-muted-foreground truncate">
                {generatedInviteUrl}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(generatedInviteUrl)}
                className="shrink-0 border-border/50 hover:border-brand-red/40 hover:text-brand-red"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-muted-foreground/50 text-xs font-body">
              Students can use this link directly — no signup required.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setInviteOpen(false)}
              className="bg-brand-red hover:bg-brand-red-bright text-white font-body font-semibold"
              data-ocid="admin.invite.close_button"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invites Dialog */}
      <Dialog open={viewInvitesOpen} onOpenChange={setViewInvitesOpen}>
        <DialogContent className="bg-brand-surface border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-red" />
              Invite Links — {selectedBatch}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {batchInvites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-body text-sm">
                  No invite links generated yet
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setViewInvitesOpen(false);
                    handleGenerateInvite();
                  }}
                  className="mt-3 bg-brand-red hover:bg-brand-red-bright text-white font-body text-xs"
                >
                  Generate First Invite
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-2">
                  {batchInvites.map((inv, idx) => {
                    const url = `${window.location.origin}/?invite=${encodeURIComponent(inv.code)}`;
                    return (
                      <div
                        key={inv.code}
                        className="flex items-center gap-2 bg-background border border-border/40 rounded p-2.5"
                        data-ocid={`admin.invite.item.${idx + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-foreground truncate">
                            {inv.code}
                          </p>
                          <p className="text-muted-foreground/50 text-[10px] font-body mt-0.5">
                            Created {formatDate(inv.createdAt)}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(url)}
                          className="w-7 h-7 text-muted-foreground hover:text-brand-red shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setViewInvitesOpen(false)}
              className="text-muted-foreground font-body text-sm"
              data-ocid="admin.invite.view_close_button"
            >
              Close
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
              className="text-muted-foreground font-body text-sm"
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive hover:bg-destructive/80 text-destructive-foreground font-body font-semibold gap-2"
              data-ocid="admin.delete.confirm_button"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
