"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublishMenuButton({ hasMenu }: { hasMenu: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const publish = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/admin/publish-menu", { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setState("done");
      setTimeout(() => {
        router.refresh();
      }, 800);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  if (hasMenu) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-3 py-1.5 rounded-full">
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </span>
        Menu live today
      </span>
    );
  }

  return (
    <button
      onClick={publish}
      disabled={state === "loading" || state === "done"}
      className={`text-sm rounded-md px-4 py-2 font-medium transition-all ${
        state === "done"
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : state === "error"
          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
          : "bg-orange-700 text-white hover:bg-orange-800 shadow-sm"
      }`}
    >
      {state === "loading"
        ? "Publishing…"
        : state === "done"
        ? "✓ Published"
        : state === "error"
        ? "Error — try again"
        : "Publish today's menu"}
    </button>
  );
}
