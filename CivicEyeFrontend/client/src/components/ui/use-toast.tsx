import { useState, useCallback } from "react";

export interface ToastProps {
  title: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
  duration?: number;
}

let globalToastHandler: ((toast: ToastProps) => void) | null = null;

/**
 * useToast hook
 * Provides toast() for local component usage
 * and maintains toasts array for optional UI rendering
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(
    ({ title, description, type = "default", duration = 3000 }: ToastProps) => {
      const newToast = { title, description, type, duration };
      setToasts((prev) => [...prev, newToast]);

      // remove toast automatically
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t !== newToast));
      }, duration);

      // fallback console log
      console.log(`[${type.toUpperCase()}] ${title}: ${description || ""}`);
    },
    []
  );

  // assign to global handler
  globalToastHandler = toast;

  return { toast, toasts };
}

/**
 * Global toast() function
 * works anywhere (even outside components)
 */
export function toast(toastData: ToastProps) {
  if (globalToastHandler) globalToastHandler(toastData);
  else console.warn("⚠️ toast() called before initialization");
}
