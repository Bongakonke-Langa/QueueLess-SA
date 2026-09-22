"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type React from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "info" | "error" | "warning" | "loading";

export interface QueuelessToast {
  id: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
}

interface ToastInput {
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
  duration?: number;
}

const TOAST_ICONS = {
  error: CircleAlertIcon,
  info: InfoIcon,
  loading: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
} as const;

const DEFAULT_DURATION_MS = 4200;
const MAX_VISIBLE = 4;

let nextToastId = 1;
type ToastListener = (toasts: QueuelessToast[]) => void;
const listeners = new Set<ToastListener>();
let liveToasts: QueuelessToast[] = [];
const dismissTimers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  const snapshot = [...liveToasts];
  listeners.forEach((listener) => listener(snapshot));
}

function dismissToast(id: number) {
  const timer = dismissTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    dismissTimers.delete(id);
  }
  if (!liveToasts.some((toast) => toast.id === id)) return;
  liveToasts = liveToasts.filter((toast) => toast.id !== id);
  emit();
}

function scheduleDismiss(id: number, duration: number) {
  const existing = dismissTimers.get(id);
  if (existing) clearTimeout(existing);
  if (duration <= 0) return;
  dismissTimers.set(
    id,
    setTimeout(() => {
      dismissTimers.delete(id);
      dismissToast(id);
    }, duration),
  );
}

/** In-house toast manager: same .add() surface, plain React state, no flushSync. */
export const toastManager = {
  add(input: ToastInput): number {
    const id = nextToastId++;
    const toast: QueuelessToast = {
      id,
      title: input.title,
      description: input.description,
      type: input.type ?? "success",
    };
    liveToasts = [...liveToasts.slice(-(MAX_VISIBLE - 1)), toast];
    scheduleDismiss(id, input.duration ?? DEFAULT_DURATION_MS);
    emit();
    return id;
  },
  close(id: number) {
    dismissToast(id);
  },
  dismiss: dismissToast,
  clear() {
    dismissTimers.forEach((timer) => clearTimeout(timer));
    dismissTimers.clear();
    liveToasts = [];
    emit();
  },
};

function useLiveToasts(): QueuelessToast[] {
  const [toasts, setToasts] = useState<QueuelessToast[]>(() => [...liveToasts]);
  useEffect(() => {
    const listener: ToastListener = (snapshot) => setToasts(snapshot);
    listeners.add(listener);
    setToasts([...liveToasts]);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return toasts;
}

const toastToneClass: Record<ToastType, string> = {
  success: "ql-toast--success",
  info: "ql-toast--info",
  error: "ql-toast--error",
  warning: "ql-toast--warning",
  loading: "ql-toast--info",
};

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastProviderProps {
  children?: React.ReactNode;
  position?: ToastPosition;
}

function positionClass(position: ToastPosition): string {
  switch (position) {
    case "top-left":
      return "ql-toasts--top-left";
    case "top-center":
      return "ql-toasts--top-center";
    case "top-right":
      return "ql-toasts--top-right";
    case "bottom-left":
      return "ql-toasts--bottom-left";
    case "bottom-center":
      return "ql-toasts--bottom-center";
    case "bottom-right":
    default:
      return "ql-toasts--bottom-right";
  }
}

/** Live toast stack: pure React state + CSS animation, no layout reads. */
export function ToastProvider({
  children,
  position = "bottom-right",
}: ToastProviderProps): React.ReactElement {
  const toasts = useLiveToasts();
  const dismiss = useCallback((id: number) => dismissToast(id), []);
  return (
    <>
      {children}
      <div
        className={cn("ql-toasts", positionClass(position))}
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        data-slot="toast-viewport"
      >
        {toasts.map((toast) => {
          const Icon = toast.type ? TOAST_ICONS[toast.type] : null;
          return (
            <div
              key={toast.id}
              className={cn("ql-toast", toast.type && toastToneClass[toast.type])}
              role={toast.type === "error" ? "alert" : "status"}
              data-slot="toast-popup"
              data-type={toast.type}
            >
              {Icon && (
                <span className="ql-toast-icon" data-slot="toast-icon" aria-hidden="true">
                  <Icon />
                </span>
              )}
              <div className="ql-toast-body">
                <p className="ql-toast-title" data-slot="toast-title">
                  {toast.title}
                </p>
                {toast.description != null && toast.description !== "" && (
                  <p className="ql-toast-description" data-slot="toast-description">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="ql-toast-close"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
              >
                <XIcon />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Backwards-compat shim: nothing else imports the anchored variant. */
export function AnchoredToastProvider({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}

export const anchoredToastManager = toastManager;
