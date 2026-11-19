"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Radio, WifiOff, X, RefreshCw } from "lucide-react";
import "./workspace.css";

export function Brand() {
  return (
    <div className="q-brand">
      <img src="/icon.svg" alt="" width="38" height="38" />
      <span>
        QueueLess <i>SA</i>
      </span>
    </div>
  );
}
export function Live({ on }: { on: boolean }) {
  return (
    <span className={"q-live " + (!on ? "q-sync" : "")}>
      {on ? <Radio size={14} /> : <WifiOff size={14} />}{" "}
      {on ? "Live updates" : "Syncing"}
    </span>
  );
}
export function ErrorNotice({
  text,
  retry,
}: {
  text: string;
  retry?: () => void;
}) {
  if (!text) return null;
  return (
    <div className="q-error" role="alert">
      {text}
      {retry && (
        <button onClick={retry}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="q-modal"
      aria-labelledby="q-modal-name"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 id="q-modal-name">{title}</h2>
          <button className="q-icon" aria-label="Close dialog" onClick={close}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Waves() {
  return (
    <svg
      className="q-waves"
      viewBox="0 0 420 220"
      preserveAspectRatio="xMaxYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 28 }, (_, i) => (
        <path
          key={i}
          d={`M ${10 + i * 8} -20 C ${235 + i * 6} 20, ${45 + i * 7} 125, ${210 + i * 6} 167 S ${370 + i * 9} 202, ${413 + i * 5} 245`}
          stroke="currentColor"
          strokeWidth="1.3"
        />
      ))}
    </svg>
  );
}
