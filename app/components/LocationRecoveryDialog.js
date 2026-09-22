"use client";

import { LocateFixed, MapPin, ShieldCheck, X } from "lucide-react";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

export default function LocationRecoveryDialog({ onClose, onRetry, onUseDemo, permissionState, recoveryMessage }) {
  return (
    <Dialog
      layerClassName="sheet-layer location-recovery-layer"
      sectionClassName="location-recovery"
      labelledBy="location-recovery-title"
      onClose={onClose}
    >
      <header className="location-recovery-header">
        <span className="location-recovery-icon"><LocateFixed size={26} /></span>
        <IconButton label="Close location help" onClick={onClose}><X size={20} /></IconButton>
      </header>
      <h2 id="location-recovery-title">Location access is off</h2>
      <p>QueueLess cannot change a browser permission itself. Once Location is set to Allow, this screen will recognise it and connect your position.</p>
      {recoveryMessage && <div className="permission-message" role="alert"><ShieldCheck size={18} /><span><strong>Permission is still blocked</strong><small>{recoveryMessage}</small></span></div>}
      <ol className="permission-steps">
        <li><span>1</span><div><strong>Open this site’s permissions</strong><small>Use the location or settings control beside the address bar.</small></div></li>
        <li><span>2</span><div><strong>Allow precise location</strong><small>Set Location to Allow for QueueLess SA.</small></div></li>
        <li><span>3</span><div><strong>Try again</strong><small>Return here and use the button below.</small></div></li>
      </ol>
      <div className="location-recovery-actions">
        <button className="primary-button" onClick={onRetry}><LocateFixed size={18} /> {permissionState === "prompt" ? "Request precise location" : "Check permission and try again"}</button>
        <button className="secondary-button" onClick={onUseDemo}><MapPin size={18} /> Use demo position</button>
        <button className="text-button location-close" onClick={onClose}>Continue without location</button>
      </div>
    </Dialog>
  );
}
