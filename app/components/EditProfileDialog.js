"use client";

import { useState } from "react";
import { Camera, Check, Trash2, X } from "lucide-react";
import Dialog from "./Dialog";
import { AvatarContent, IconButton } from "./ui";

export default function EditProfileDialog({ profile, onClose, onSave }) {
  const [draft, setDraft] = useState(profile);
  const [avatarError, setAvatarError] = useState("");

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submitProfile(event) {
    event.preventDefault();
    onSave({
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      city: draft.city.trim(),
      province: draft.province.trim(),
      avatar: draft.avatar || "",
    });
  }

  function uploadAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError("Choose an image smaller than 8 MB.");
      return;
    }

    setAvatarError("");
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - side) / 2;
      const sourceY = (image.naturalHeight - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 480;
      canvas.height = 480;
      const context = canvas.getContext("2d");
      if (!context) {
        setAvatarError("Photo processing is unavailable in this browser.");
        URL.revokeObjectURL(objectUrl);
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, sourceX, sourceY, side, side, 0, 0, canvas.width, canvas.height);
      updateField("avatar", canvas.toDataURL("image/jpeg", 0.86));
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      setAvatarError("That image could not be read. Please choose another one.");
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  }

  return (
    <Dialog
      layerClassName="sheet-layer profile-editor-layer"
      sectionClassName="profile-editor"
      labelledBy="profile-editor-title"
      onClose={onClose}
    >
      <header className="profile-editor-header">
        <div><p className="eyebrow">MY DETAILS</p><h2 id="profile-editor-title">Edit profile</h2></div>
        <IconButton label="Close profile editor" onClick={onClose}><X size={20} /></IconButton>
      </header>
      <form onSubmit={submitProfile}>
        <div className="profile-editor-identity">
          <span className="profile-avatar"><AvatarContent profile={draft} /></span>
          <div className="profile-editor-identity-copy">
            <strong>{draft.name || "Your name"}</strong>
            <small>QueueLess profile photo</small>
            <div className="avatar-actions">
              <label className="avatar-upload-button">
                <Camera size={16} /> {draft.avatar ? "Change photo" : "Upload photo"}
                <input className="avatar-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} />
              </label>
              {draft.avatar && <button type="button" className="avatar-remove-button" onClick={() => updateField("avatar", "")}><Trash2 size={15} /> Remove</button>}
            </div>
          </div>
        </div>
        {avatarError && <p className="avatar-error" role="alert">{avatarError}</p>}
        <div className="profile-form-grid">
          <label><span>Full name</span><input value={draft.name} onChange={(event) => updateField("name", event.target.value)} required autoComplete="name" /></label>
          <label><span>Mobile number</span><input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} required inputMode="tel" autoComplete="tel" /></label>
          <label><span>City</span><input value={draft.city} onChange={(event) => updateField("city", event.target.value)} required autoComplete="address-level2" /></label>
          <label><span>Province</span><input value={draft.province} onChange={(event) => updateField("province", event.target.value)} required autoComplete="address-level1" /></label>
        </div>
        <div className="profile-editor-footer">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button"><Check size={18} /> Save changes</button>
        </div>
      </form>
    </Dialog>
  );
}
