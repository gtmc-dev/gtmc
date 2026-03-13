"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createFeature } from "@/actions/feature";

type State =
  | { status: "pending" }
  | { status: "success"; featureId: string }
  | { status: "error"; message: string };

export function PendingCreationBanner() {
  const router = useRouter();
  const [state, setState] = React.useState<State>({ status: "pending" });
  const inFlightRef = React.useRef(false);
  const [isRetrying, startRetry] = React.useTransition();

  const runCreation = React.useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const raw = sessionStorage.getItem("pendingFeatureCreate.v1");
    if (!raw) {
      inFlightRef.current = false;
      return; // No payload — render nothing
    }

    try {
      const payload = JSON.parse(raw) as { title: string; content: string; tags: string[] };
      const res = await createFeature(payload);
      sessionStorage.removeItem("pendingFeatureCreate.v1");
      setState({ status: "success", featureId: res.feature.id });
      router.refresh();
    } catch (err: any) {
      inFlightRef.current = false; // Allow retry
      setState({ status: "error", message: err.message || "Unknown error" });
    }
  }, [router]);

  React.useEffect(() => {
    // Only run if there's a payload
    const raw = sessionStorage.getItem("pendingFeatureCreate.v1");
    if (!raw) return;
    runCreation();
  }, [runCreation]);

  // If no payload ever, render nothing
  const raw = typeof window !== "undefined" ? sessionStorage.getItem("pendingFeatureCreate.v1") : null;
  if (!raw && state.status === "pending") return null;

  if (state.status === "success") {
    return (
      <div className="border border-tech-main/40 bg-white/60 backdrop-blur-sm px-4 py-3 font-mono text-sm flex items-center gap-3">
        <span className="w-2 h-2 bg-tech-main inline-block" />
        <span className="text-tech-main uppercase tracking-[0.1em]">FEATURE_CREATED_</span>
        <a href={`/features/${state.featureId}`} className="underline text-tech-accent hover:text-tech-main ml-2">
          VIEW_FEATURE_{state.featureId}_
        </a>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="border border-red-400/60 bg-red-50/60 backdrop-blur-sm px-4 py-3 font-mono text-sm flex items-center gap-3">
        <span className="w-2 h-2 bg-red-500 inline-block" />
        <span className="text-red-700 uppercase tracking-[0.1em]">CREATION_FAILED_</span>
        <span className="text-red-600 text-xs ml-2">{state.message}</span>
        <button
          onClick={() => startRetry(() => { inFlightRef.current = false; runCreation(); })}
          disabled={isRetrying}
          className="ml-auto border border-red-400 px-2 py-0.5 text-xs text-red-600 hover:bg-red-100 uppercase"
        >
          {isRetrying ? "RETRYING..." : "RETRY_"}
        </button>
      </div>
    );
  }

  // pending
  return (
    <div className="border border-tech-main/40 bg-white/60 backdrop-blur-sm px-4 py-3 font-mono text-sm flex items-center gap-3">
      <span className="w-2 h-2 bg-tech-accent animate-pulse inline-block" />
      <span className="text-tech-main uppercase tracking-[0.1em]">CREATING_FEATURE_...</span>
    </div>
  );
}
