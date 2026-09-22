"use client";

import { useEffect, useState } from "react";
import { LocateFixed, Pause, Play, ShieldCheck } from "lucide-react";
import { formatLocationFreshness } from "../lib/queue";

export default function LocationStatusPanel({ locationStatus, userLocation, onRequestLocation, onPauseLocation }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!userLocation?.updatedAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(timer);
  }, [userLocation?.updatedAt]);

  const isLive = locationStatus === "live" && userLocation?.source === "gps";
  const isDemo = userLocation?.source === "demo";
  const isPaused = locationStatus === "paused";
  const isRequesting = locationStatus === "requesting";
  const tone = isLive ? "live" : isDemo ? "demo" : isPaused ? "paused" : isRequesting ? "requesting" : "off";
  const title = isLive
    ? "Live GPS connected"
    : isDemo
      ? "Demo position active"
      : isPaused
        ? "Live GPS paused"
        : isRequesting
          ? "Finding your position"
          : "Turn on live GPS";
  const description = isLive
    ? "Distances and travel times update automatically as you move."
    : isDemo
      ? "Judging preview is using a clearly marked sample position."
      : isPaused
        ? "Your last position stays visible until tracking resumes."
        : isRequesting
          ? "Waiting for a precise reading from your device."
          : "See accurate nearby branches and know when to leave.";
  const actionLabel = isPaused
    ? "Resume live GPS"
    : isDemo
      ? "Switch to live GPS"
      : "Enable live GPS";

  return (
    <section className={`gps-status-strip ${tone}`} aria-label="Live GPS status" aria-live="polite">
      <div className="gps-status-lead">
        <span className="gps-status-icon"><LocateFixed size={22} /></span>
        <span><small>SMART LOCATION</small><strong>{title}</strong><span>{description}</span></span>
      </div>
      <div className="gps-readouts" aria-label="Location details">
        <span><small>COORDINATES</small><strong>{userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : "Not shared"}</strong></span>
        <span><small>ACCURACY</small><strong>{(isLive || isPaused) && userLocation ? `±${Math.round(userLocation.accuracy)} m` : isDemo ? "Demo" : "Waiting"}</strong></span>
        <span><small>UPDATED</small><strong>{formatLocationFreshness(userLocation?.updatedAt, now)}</strong></span>
      </div>
      {isLive ? (
        <button className="gps-action secondary-button" onClick={onPauseLocation}><Pause size={17} /> Pause sharing</button>
      ) : (
        <button className="gps-action primary-button" onClick={onRequestLocation} disabled={isRequesting}>
          {isRequesting ? <LocateFixed size={17} /> : <Play size={17} />} {isRequesting ? "Locating…" : actionLabel}
        </button>
      )}
      <p className="gps-privacy"><ShieldCheck size={14} /> Used only for nearby distances and arrival timing in this prototype.</p>
    </section>
  );
}
