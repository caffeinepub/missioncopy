import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY } from "@/types/missioncopy";
import { findInviteByCode } from "@/utils/storage";
import { ArrowRight, BookOpen, Lock, Shield, Users, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LandingPageProps {
  onAdminLogin: () => void;
  onStudentAccess: (batch: string, token: string) => void;
}

export default function LandingPage({
  onAdminLogin,
  onStudentAccess,
}: LandingPageProps) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto-fill invite from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (invite) {
      setInviteCode(invite);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setPasswordError("");

    await new Promise((r) => setTimeout(r, 400)); // brief delay for UX

    if (adminPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
      setShowAdminModal(false);
      onAdminLogin();
    } else {
      setPasswordError("Incorrect password. Please try again.");
      setIsLoggingIn(false);
    }
  };

  const handleStudentAccess = () => {
    const code = inviteCode.trim();
    if (!code) {
      toast.error("Please enter your invite code");
      return;
    }

    const token = findInviteByCode(code);
    if (!token) {
      toast.error("Invalid invite code. Please check with your admin.");
      return;
    }

    onStudentAccess(token.batch, code);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Red diagonal stripe */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-5"
          style={{
            background:
              "conic-gradient(from 45deg, oklch(0.5 0.22 25.5), transparent 30%, transparent 50%, oklch(0.5 0.22 25.5) 70%)",
          }}
        />
        {/* Grid lines */}
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
        {/* Glowing orb */}
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
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center max-w-3xl"
        >
          {/* Logo / Wordmark */}
          <div className="mb-8 inline-flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-red" />
              <span className="text-brand-red font-mono text-xs tracking-[0.3em] uppercase">
                Est. 2024
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-red" />
            </div>
            <h1 className="font-display font-black text-7xl sm:text-8xl md:text-9xl tracking-tighter leading-none">
              <span className="text-foreground">MISSION</span>
              <span className="text-brand-red">COPY</span>
            </h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-red" />
              <p className="text-muted-foreground text-sm tracking-widest uppercase font-body font-medium">
                India's Premier Coaching Platform
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-red" />
            </div>
          </div>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {[
              { icon: BookOpen, label: "Video Lectures" },
              { icon: Zap, label: "PDF Resources" },
              { icon: Users, label: "Doubt Solving" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-border/50 text-muted-foreground text-xs font-body"
              >
                <Icon className="w-3 h-3 text-brand-red" />
                {label}
              </span>
            ))}
          </motion.div>

          {/* Student Access Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-sm mx-auto"
          >
            <div className="bg-brand-surface border border-border/60 rounded-lg p-6 shadow-red-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-brand-red rounded-full" />
                <p className="text-foreground font-display font-bold text-base">
                  Student Access
                </p>
              </div>
              <p className="text-muted-foreground text-sm mb-4 font-body">
                Enter your invite code from your batch coordinator to access
                course materials.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter invite code..."
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStudentAccess()}
                  className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm focus-visible:ring-brand-red focus-visible:border-brand-red"
                  data-ocid="landing.student_input"
                />
                <Button
                  onClick={handleStudentAccess}
                  className="bg-brand-red hover:bg-brand-red-bright text-white border-0 gap-1.5 shrink-0 font-body font-semibold"
                  data-ocid="landing.student_button"
                >
                  Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 border-t border-border/30 py-6 px-6"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: "4", label: "Batches" },
            { value: "3", label: "Section Types" },
            { value: "JEE & NEET", label: "Specializations" },
            { value: "100%", label: "Digital Access" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display font-black text-2xl text-brand-red">
                {value}
              </div>
              <div className="font-body text-xs text-muted-foreground mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

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
