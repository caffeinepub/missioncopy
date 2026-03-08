import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, FileText, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

interface StudentEnrollmentPageProps {
  batch: string;
  onEnter: () => void;
}

const SECTION_FEATURES = [
  {
    icon: BookOpen,
    label: "Lecture Videos",
    description: "Watch recorded sessions",
    color: "text-brand-red",
    bg: "bg-brand-red/10 border-brand-red/20",
  },
  {
    icon: FileText,
    label: "PDF Resources",
    description: "Study notes & materials",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: MessageCircle,
    label: "Doubt Solving",
    description: "Q&A sessions",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function StudentEnrollmentPage({
  batch,
  onEnter,
}: StudentEnrollmentPageProps) {
  // Auto-redirect immediately on mount — enrollment page is just a safety fallback
  useEffect(() => {
    onEnter();
  }, [onEnter]);

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
              id="enrollment-grid"
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
          <rect width="100%" height="100%" fill="url(#enrollment-grid)" />
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
      <header className="relative z-10 px-6 py-5 flex items-center border-b border-border/30">
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
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Invite badge */}
          <div className="flex justify-center mb-6">
            <Badge
              variant="outline"
              className="border-brand-red/40 text-brand-red bg-brand-red/5 font-mono text-xs px-3 py-1"
            >
              YOU'VE BEEN INVITED
            </Badge>
          </div>

          {/* Welcome card */}
          <div
            className="bg-brand-surface border border-border/60 rounded-xl p-8 shadow-red-sm text-center"
            data-ocid="enrollment.batch_card"
          >
            {/* Batch icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mx-auto w-16 h-16 bg-brand-red rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-brand-red/20"
            >
              <span className="text-white text-2xl font-display font-black">
                M
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <p className="text-muted-foreground text-sm font-body mb-2">
                Welcome to
              </p>
              <h1 className="font-display font-black text-3xl md:text-4xl text-foreground tracking-tight mb-2">
                {batch}
              </h1>
              <p className="text-muted-foreground/60 text-xs font-mono uppercase tracking-widest mb-8">
                MISSIONCOPY BATCH
              </p>
            </motion.div>

            {/* Section features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              {SECTION_FEATURES.map(
                ({ icon: Icon, label, description, color, bg }, idx) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.07 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${bg}`}
                  >
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${bg}`}
                    >
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className={`text-xs font-body font-semibold ${color}`}>
                      {label}
                    </p>
                    <p className="text-[10px] font-body text-muted-foreground/60 leading-tight text-center">
                      {description}
                    </p>
                  </motion.div>
                ),
              )}
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-border/30 mb-6" />

            {/* Enter button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <p className="text-muted-foreground text-sm font-body mb-4">
                No signup required — click below to access your course
                materials.
              </p>
              <Button
                onClick={onEnter}
                size="lg"
                className="bg-brand-red hover:bg-brand-red-bright text-white font-display font-bold text-base gap-2.5 px-8 py-6 rounded-lg shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 transition-all w-full sm:w-auto"
                data-ocid="enrollment.enter_button"
              >
                Enter Batch
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* Reassurance note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-center text-muted-foreground/40 text-xs font-body mt-6"
          >
            Access is granted by your batch coordinator via invite link
          </motion.p>
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
    </div>
  );
}
