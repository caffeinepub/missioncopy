import { Toaster } from "@/components/ui/sonner";
import AdminDashboard from "@/pages/AdminDashboard";
import LandingPage from "@/pages/LandingPage";
import StudentEnrollmentPage from "@/pages/StudentEnrollmentPage";
import StudentView from "@/pages/StudentView";
import { ADMIN_SESSION_KEY } from "@/types/missioncopy";
import { findInviteByCode } from "@/utils/storage";
import { useEffect, useState } from "react";

export type AppRoute = "landing" | "admin" | "student" | "enrollment";

export interface AppState {
  route: AppRoute;
  studentBatch?: string;
  studentToken?: string;
}

function parseInitialRoute(): AppState {
  const params = new URLSearchParams(window.location.search);
  const inviteCode = params.get("invite");

  // Check for invite in URL → go directly to student view (skip enrollment)
  if (inviteCode) {
    const token = findInviteByCode(inviteCode);
    if (token) {
      return {
        route: "student",
        studentBatch: token.batch,
        studentToken: inviteCode,
      };
    }
  }

  // Check for /admin path or admin session
  const path = window.location.pathname;
  if (path.includes("/admin") || path.includes("admin")) {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "authenticated") {
      return { route: "admin" };
    }
  }

  // Check for /student path → go directly to student view (skip enrollment)
  if (path.includes("/student")) {
    const tokenParam = params.get("token");
    const batchParam = params.get("batch");
    if (tokenParam && batchParam) {
      return {
        route: "student",
        studentBatch: batchParam,
        studentToken: tokenParam,
      };
    }
  }

  return { route: "landing" };
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(parseInitialRoute);

  // Sync URL with app state
  useEffect(() => {
    if (appState.route === "admin") {
      window.history.pushState({}, "", "/admin");
    } else if (
      (appState.route === "student" || appState.route === "enrollment") &&
      appState.studentBatch
    ) {
      const params = new URLSearchParams({
        batch: appState.studentBatch,
        token: appState.studentToken || "",
      });
      window.history.pushState({}, "", `/student?${params.toString()}`);
    } else {
      window.history.pushState({}, "", "/");
    }
  }, [appState]);

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
        <LandingPage onAdminLogin={() => navigate({ route: "admin" })} />
      )}
      {appState.route === "admin" && (
        <AdminDashboard
          onLogout={() => {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            navigate({ route: "landing" });
          }}
        />
      )}
      {appState.route === "enrollment" && (
        <StudentEnrollmentPage
          batch={appState.studentBatch || ""}
          onEnter={() =>
            navigate({
              route: "student",
              studentBatch: appState.studentBatch,
              studentToken: appState.studentToken,
            })
          }
        />
      )}
      {appState.route === "student" && (
        <StudentView
          batch={appState.studentBatch || ""}
          onBack={() => navigate({ route: "landing" })}
        />
      )}
    </div>
  );
}
