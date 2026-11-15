import React from "react";
import { useToast } from "./use-toast";

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t, i) => (
        <div
          key={i}
          className={`rounded-md p-3 shadow-lg text-white ${
            t.type === "success"
              ? "bg-green-600"
              : t.type === "error"
              ? "bg-red-600"
              : t.type === "warning"
              ? "bg-yellow-500"
              : "bg-gray-800"
          }`}
        >
          <strong>{t.title}</strong>
          {t.description && <div className="text-sm">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
