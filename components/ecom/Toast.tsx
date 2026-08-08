"use client";

import { useEcomStore } from "@/store/ecomStore";

export function Toast() {
  const { toasts, removeToast } = useEcomStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-foreground">{toast.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground text-xs p-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
