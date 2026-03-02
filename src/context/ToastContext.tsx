import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, type }]);

    // auto dismiss
    window.setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const value = useMemo(
    () => ({ showToast, removeToast, toasts }),
    [showToast, removeToast, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Minimal toast UI*/}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "glass rounded-2xl px-4 py-3 text-sm shadow-lg border",
              t.type === "success" ? "border-emerald-500/30" : "",
              t.type === "error" ? "border-rose-500/30" : "",
              t.type === "info" ? "border-sky-500/30" : "",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-slate-100">{t.message}</div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-200"
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}