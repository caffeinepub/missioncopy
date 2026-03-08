import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_PASSWORD,
  ADMIN_SESSION_KEY,
  BATCHES,
  BATCH_INFO,
} from "@/types/missioncopy";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Lock,
  Shield,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface LandingPageProps {
  onAdminLogin: () => void;
  onSelectBatch: (batch: string) => void;
}

const BATCH_ICONS = [Video, BookOpen, FileText, BookOpen];

export default function LandingPage({
  onAdminLogin,
  onSelectBatch,
}: LandingPageProps) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setPasswordError("");

    await new Promise((r) => setTimeout(r, 400));

    if (adminPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
      setShowAdminModal(false);
      onAdminLogin();
    } else {
      setPasswordError("Incorrect password. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-5"
          style={{
            background:
              "conic-gradient(from 45deg, oklch(0.5 0.22 25.5), transparent 30%, transparent 50%, oklch(0.5 0.22 25.5) 70%)",
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="presentation"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.5 0.22 25.5), transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-border/30">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-brand-red rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-display font-black">
              M
            </span>
          </div>
          <span className="font-display font-black text-lg tracking-tight text-foreground">
            MISSION<span className="text-brand-red">COPY</span>
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdminModal(true)}
            className="border-border/50 text-muted-foreground hover:text-foreground hover:border-brand-red/50 hover:bg-brand-red/5 gap-2 font-body text-xs"
            data-ocid="landing.admin_button"
          >
            <Lock className="w-3 h-3" />
            Admin Login
          </Button>
        </motion.div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-red" />
            <span className="text-brand-red font-mono text-xs tracking-[0.3em] uppercase">
              Est. 2024
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-red" />
          </div>
          <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl tracking-tighter leading-none mb-4">
            <span className="text-foreground">MISSION</span>
            <span className="text-brand-red">COPY</span>
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-body font-medium">
            India's Premier Coaching Platform
          </p>
        </motion.div>

        {/* Batch Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <p className="text-muted-foreground text-xs font-body uppercase tracking-widest text-center mb-5">
            Select your batch to access content
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BATCHES.map((batch, idx) => {
              const info = BATCH_INFO[batch];
              const Icon = BATCH_ICONS[idx];
              return (
                <motion.button
                  key={batch}
                  type="button"
                  onClick={() => onSelectBatch(batch)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 + idx * 0.07 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex items-center gap-4 bg-brand-surface border border-border/50 hover:border-brand-red/60 hover:bg-brand-surface-2 rounded-xl p-5 text-left transition-all"
                  data-ocid={`landing.batch.button.${idx + 1}`}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center shrink-0 group-hover:bg-brand-red/20 transition-colors">
                    <Icon className="w-5 h-5 text-brand-red" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-mono text-brand-red/70 tracking-widest uppercase mb-0.5">
                      {info.tag}
                    </span>
                    <span className="block text-foreground font-display font-bold text-lg leading-tight">
                      {info.label}
                    </span>
                    <span className="block text-muted-foreground text-xs font-body mt-0.5">
                      {info.subtitle}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-brand-red/60 group-hover:translate-x-0.5 transition-all shrink-0" />

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl bg-brand-red/0 group-hover:bg-brand-red/[0.03] transition-colors pointer-events-none" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 py-4 px-6">
        <p className="text-center text-muted-foreground/50 text-xs font-body">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red/60 hover:text-brand-red transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Admin Login Dialog */}
      <AnimatePresence>
        {showAdminModal && (
          <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
            <DialogContent
              className="bg-brand-surface border border-border max-w-sm"
              data-ocid="admin.login.dialog"
            >
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-brand-red" />
                  </div>
                  <DialogTitle className="font-display font-bold text-foreground">
                    Admin Login
                  </DialogTitle>
                </div>
              </DialogHeader>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-body">
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Enter admin password..."
                    className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-brand-red focus-visible:border-brand-red font-mono"
                    autoFocus
                    data-ocid="admin.login_input"
                  />
                  <AnimatePresence>
                    {passwordError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-xs font-body"
                        data-ocid="admin.login.error_state"
                      >
                        {passwordError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-brand-red hover:bg-brand-red-bright text-white font-body font-semibold"
                  data-ocid="admin.login.submit_button"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Login to Dashboard"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
