import React, { createContext, useContext, useMemo, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

type ToastContextType = {
  push: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
  toasts: ToastItem[];
};

const ToastContext = createContext<ToastContextType | null>(null);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const push = (type: ToastType, message: string) => {
    const id = uid();
    const item: ToastItem = { id, type, message };
    setToasts((prev) => [item, ...prev]);

    // auto dismiss
    window.setTimeout(() => remove(id), 3500);
  };

  const value = useMemo(
    () => ({
      push,
      remove,
      toasts,
    }),
    [toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast UI */}
      <div className="fixed right-4 top-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "min-w-[260px] max-w-[340px] rounded-2xl border px-4 py-3 text-sm shadow-lg",
              t.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-200"
                : t.type === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-blue-500/30 bg-blue-500/10 text-blue-200",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="font-semibold">
                {t.type === "success"
                  ? "Success"
                  : t.type === "error"
                  ? "Error"
                  : "Info"}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-slate-300 hover:text-white"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <div className="mt-1 text-slate-200/90">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}