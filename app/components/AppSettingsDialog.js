"use client";

import { useState } from "react";
import { Accessibility, X } from "lucide-react";
import { Switch } from "./ui/switch";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

export default function AppSettingsDialog({ settings, onClose, onSave }) {
  const [draft, setDraft] = useState(settings);

  function toggle(setting) {
    setDraft((current) => ({ ...current, [setting]: !current[setting] }));
  }

  return (
    <Dialog
      layerClassName="sheet-layer app-settings-layer"
      sectionClassName="profile-editor app-settings"
      labelledBy="app-settings-title"
      onClose={onClose}
    >
      <header className="profile-editor-header">
        <div><p className="eyebrow">ACCESSIBILITY</p><h2 id="app-settings-title">App settings</h2></div>
        <IconButton label="Close app settings" onClick={onClose}><X size={20} /></IconButton>
      </header>
      <div className="settings-form">
        <div className="settings-intro"><span><Accessibility size={24} /></span><div><strong>Make QueueLess comfortable for you</strong><small>These settings are saved on this device.</small></div></div>
        <div className="switch-row">
          <span><strong>Larger text</strong><small>Increase important labels and branch details</small></span>
          <Switch checked={draft.largeText} onCheckedChange={(checked) => toggle("largeText")} aria-label="Larger text" />
        </div>
        <div className="switch-row">
          <span><strong>Higher contrast</strong><small>Strengthen text and borders throughout the app</small></span>
          <Switch checked={draft.highContrast} onCheckedChange={(checked) => toggle("highContrast")} aria-label="Higher contrast" />
        </div>
        <div className="switch-row">
          <span><strong>Reduce motion</strong><small>Minimise animated transitions throughout the app</small></span>
          <Switch checked={draft.reducedMotion} onCheckedChange={(checked) => toggle("reducedMotion")} aria-label="Reduce motion" />
        </div>
      </div>
      <div className="profile-editor-footer">
        <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
        <button type="button" className="primary-button" onClick={() => onSave(draft)}>Save settings</button>
      </div>
    </Dialog>
  );
}
