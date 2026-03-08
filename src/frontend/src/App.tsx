import { Toaster } from "@/components/ui/sonner";
import AdminDashboard from "@/pages/AdminDashboard";
import LandingPage from "@/pages/LandingPage";
import StudentView from "@/pages/StudentView";
import { ADMIN_SESSION_KEY } from "@/types/missioncopy";
import { getLocalManifestHash, saveLocalManifestHash } from "@/utils/storage";
import { useEffect, useState } from "react";

export type AppRoute = "landing" | "admin" | "student";

export interface AppState {
  route: AppRoute;
  studentBatch?: string;
}

/**
 * On load: if URL contains ?manifest=..., persist it to localStorage so all
 * batch cards work even when navigating without the query param.
 */
function initManifestFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const urlManifest = params.get("manifest");
  if (urlManifest) {
    saveLocalManifestHash(urlManifest);
    return urlManifest;
  }
  return getLocalManifestHash();
}

function parseInitialRoute(): AppState {
  const path = window.location.pathname;

  // Check for admin session
  if (path.includes("/admin")) {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "authenticated") {
      return { route: "admin" };
    }
  }

  // Check for /student path with batch param
  const params = new URLSearchParams(window.location.search);
  if (path.includes("/student")) {
    const batchParam = params.get("batch");
    if (batchParam) {
      return { route: "student", studentBatch: decodeURIComponent(batchParam) };
    }
  }

  // If a batch param is present on landing (e.g., from admin share link),
  // go directly to student view
  const batchFromUrl = params.get("batch");
  if (batchFromUrl) {
    return { route: "student", studentBatch: decodeURIComponent(batchFromUrl) };
  }

  return { route: "landing" };
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(parseInitialRoute);
  const [manifestHash] = useState<string | null>(initManifestFromUrl);

  // Sync URL with app state
  useEffect(() => {
    if (appState.route === "admin") {
      window.history.pushState({}, "", "/admin");
    } else if (appState.route === "student" && appState.studentBatch) {
      const params = new URLSearchParams({
        batch: appState.studentBatch,
      });
      if (manifestHash) params.set("manifest", manifestHash);
      window.history.pushState({}, "", `/?${params.toString()}`);
    } else {
      window.history.pushState({}, "", "/");
    }
  }, [appState, manifestHash]);

  const navigate = (newState: AppState) => {
    setAppState(newState);
  };

  return (
    <div className="dark min-h-screen bg-background font-body">
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "bg-brand-surface border border-border text-foreground font-body",
            success: "border-brand-red/40",
            error: "border-destructive/40",
          },
        }}
      />
      {appState.route === "landing" && (
        <LandingPage
          onAdminLogin={() => navigate({ route: "admin" })}
          onSelectBatch={(batch) =>
            navigate({ route: "student", studentBatch: batch })
          }
        />
      )}
      {appState.route === "admin" && (
        <AdminDashboard
          onLogout={() => {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            navigate({ route: "landing" });
          }}
        />
      )}
      {appState.route === "student" && (
        <StudentView
          batch={appState.studentBatch || ""}
          manifestHash={manifestHash || ""}
          onBack={() => navigate({ route: "landing" })}
        />
      )}
    </div>
  );
}
