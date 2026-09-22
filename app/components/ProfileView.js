"use client";

import {
  Bell,
  BellRing,
  BadgeCheck,
  Building2,
  ChevronRight,
  CircleUserRound,
  LogOut,
  MapPin,
  Settings,
  Smartphone,
  Zap,
} from "lucide-react";
import { Switch } from "./ui/switch";
import { AvatarContent } from "./ui";

const roleLabels = {
  ADMIN: { label: "Network administrator", detail: "Manages every QueueLess branch", icon: Building2 },
  STAFF: { label: "Branch queue manager", detail: "Runs the live queue at a branch", icon: Building2 },
  CITIZEN: { label: "Citizen account", detail: "Join queues and book visits", icon: CircleUserRound },
};

export default function ProfileView({ soundEnabled, onSoundChange, queuePrefs, onQueuePrefsChange, userLocation, profile, onEditProfile, onOpenSettings, onPreferenceChange, onLogout, role = "CITIZEN", branchName }) {
  const roleInfo = roleLabels[role] || roleLabels.CITIZEN;
  const RoleIcon = roleInfo.icon;
  return (
    <main className="simple-view view-enter">
      <section className="profile-hero"><span className="profile-avatar"><AvatarContent profile={profile} /></span><div><p className="eyebrow">MY PROFILE</p><h1>{profile.name}</h1><p><MapPin size={15} /> {userLocation?.source === "gps" ? `Live GPS · ±${Math.round(userLocation.accuracy)} m` : userLocation?.source === "demo" ? "Demo position active" : `${profile.city}, ${profile.province}`}</p></div><button className="secondary-button" onClick={onEditProfile}>Edit profile</button></section>
      <section className="settings-grid">
        <div className="settings-section">
          <h2>Queue preferences</h2>
          <div className="switch-row">
            <span className="settings-icon"><Bell size={19} /></span>
            <span><strong>SMS queue alerts</strong><small>Get alerts even when data is off</small></span>
            <Switch checked={queuePrefs.sms} onCheckedChange={(checked) => onQueuePrefsChange({ ...queuePrefs, sms: checked })} aria-label="SMS queue alerts" />
          </div>
          <div className="switch-row">
            <span className="settings-icon"><BellRing size={19} /></span>
            <span><strong>Notification sounds</strong><small>Play a tone for new queue alerts</small></span>
            <Switch checked={soundEnabled} onCheckedChange={(checked) => { onSoundChange(checked); onPreferenceChange("Notification sounds", checked); }} aria-label="Notification sounds" />
          </div>
          <div className="switch-row">
            <span className="settings-icon"><Zap size={19} /></span>
            <span><strong>Low-wait alerts</strong><small>Notify me when favourites are quiet</small></span>
            <Switch checked={queuePrefs.lowWait} onCheckedChange={(checked) => onQueuePrefsChange({ ...queuePrefs, lowWait: checked })} aria-label="Low-wait alerts" />
          </div>
        </div>
        <div className="settings-section">
          <h2>Account</h2>
          <div className="switch-row static-row">
            <span className="settings-icon"><RoleIcon size={19} /></span>
            <span><strong>{roleInfo.label}</strong><small>{role === "STAFF" && branchName ? branchName : roleInfo.detail}</small></span>
          </div>
          <button type="button" onClick={onEditProfile}><span className="settings-icon"><Smartphone size={19} /></span><span><strong>{profile.phone}</strong><small>Verified mobile number</small></span><BadgeCheck size={19} className="success-icon" /></button>
          <button type="button" onClick={onOpenSettings}><span className="settings-icon"><Settings size={19} /></span><span><strong>App settings</strong><small>Text size, contrast and motion</small></span><ChevronRight size={19} /></button>
          <button type="button" className="sign-out-row" onClick={onLogout}><span className="settings-icon danger"><LogOut size={19} /></span><span><strong>Sign out</strong><small>End your session on this device</small></span><ChevronRight size={19} /></button>
        </div>
      </section>
    </main>
  );
}
