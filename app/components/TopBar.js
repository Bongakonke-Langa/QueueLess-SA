"use client";

import { BadgeCheck, Bell, ChevronDown, LocateFixed } from "lucide-react";
import { AvatarContent, Brand, IconButton } from "./ui";

export default function TopBar({
  onProfile,
  onNotifications,
  onRequestLocation,
  unreadCount,
  notificationsOpen,
  locationStatus,
  userLocation,
  profile,
}) {
  const hasPosition = Boolean(userLocation);
  const isLive = locationStatus === "live" && hasPosition;
  const locationText = hasPosition
    ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
    : locationStatus === "requesting" ? "Locating…" : "Johannesburg";
  const locationEyebrow = isLive
    ? `Live GPS · ±${Math.round(userLocation.accuracy)} m`
    : userLocation?.source === "demo" ? "Demo position"
    : hasPosition ? "Last known position"
    : locationStatus === "denied" ? "Location off" : "Near";

  return (
    <header className="top-bar">
      <div className="mobile-brand"><Brand /></div>
      <button
        className={`location-button ${locationStatus}`}
        onClick={onRequestLocation}
        aria-label={isLive ? `Live location ${locationText}` : hasPosition ? `${locationEyebrow}, ${locationText}. Try precise location` : "Use my precise location"}
      >
        <LocateFixed size={17} />
        <span><small>{locationEyebrow}</small>{locationText}</span>
        {isLive ? <BadgeCheck size={16} /> : <ChevronDown size={16} />}
      </button>
      <div className="top-actions">
        <IconButton
          label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className={unreadCount ? "has-dot" : ""}
          onClick={onNotifications}
          aria-expanded={notificationsOpen}
          aria-controls="notifications-panel"
        >
          <Bell size={20} />
        </IconButton>
        <button className="top-profile" onClick={onProfile} aria-label="Open profile"><AvatarContent profile={profile} /></button>
      </div>
    </header>
  );
}
