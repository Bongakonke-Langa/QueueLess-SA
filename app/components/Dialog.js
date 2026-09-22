"use client";

import { DialogPrimitive } from "./ui/dialog";

/**
 * Modal shell built on Base UI (via coss) with the app's own layer/panel
 * styling. Escape closes, focus is trapped and restored, backdrop click
 * closes (unless `backdropCloses` is false), and scroll is locked — all
 * handled by the primitive.
 */
export default function Dialog({
  layerClassName = "sheet-layer",
  sectionClassName,
  sectionId,
  labelledBy,
  onClose,
  backdropCloses = true,
  children,
}) {
  return (
    <DialogPrimitive.Root
      open
      disablePointerDismissal={!backdropCloses}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <div className={layerClassName}>
          <DialogPrimitive.Backdrop className="dialog-backdrop-fill" />
          <DialogPrimitive.Popup
            className={sectionClassName}
            id={sectionId}
            aria-labelledby={labelledBy}
            tabIndex={-1}
          >
            {children}
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
