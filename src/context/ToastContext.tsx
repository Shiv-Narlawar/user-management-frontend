import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastContextType = {
  push: (type: ToastType, message: string, duration?: number) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  toasts: ToastItem[];
};

const ToastContext = createContext<ToastContextType | null>(null);

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 3500;

function generateId() {
  return crypto.randomUUID();
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type: ToastType, message: string, duration = DEFAULT_DURATION) => {
      // 🔥 Prevent duplicate toasts
      setToasts((prev) => {
        const exists = prev.find((t) => t.message === message && t.type === type);
        if (exists) return prev;

        const id = generateId();
        const newToast: ToastItem = { id, type, message, duration };

        const next = [newToast, ...prev].slice(0, MAX_TOASTS);

        const timer = window.setTimeout(() => {
          remove(id);
        }, duration);

        timers.current.set(id, timer);

        return next;
      });
    },
    [remove]
  );

  const clearAll = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  // 🔥 Cleanup on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      push,
      remove,
      clearAll,
      toasts,
    }),
    [push, remove, clearAll, toasts]
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
              "min-w-[260px] max-w-[340px] rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
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