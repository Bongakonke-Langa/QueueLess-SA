"use client";

import { useState } from "react";
import { Building2, CalendarDays, ChevronRight, X } from "lucide-react";
import { branchJoinState, distanceBetween, formatBranchFreshness } from "../lib/queue";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

const TIME_SLOTS = ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:00"];

export default function FallbackDialog({ branch, service, branchList, onClose, onBook, onChooseAlternative }) {
  const [day, setDay] = useState("Today");
  const [time, setTime] = useState("09:30");
  const alternatives = branchList
    .filter((item) => item.id !== branch.id && item.type === branch.type && branchJoinState(item).canJoin)
    .map((item) => ({ ...item, alternativeDistance: Number(distanceBetween(branch.latitude, branch.longitude, item.latitude, item.longitude).toFixed(1)) }))
    .sort((a, b) => a.alternativeDistance - b.alternativeDistance || a.wait - b.wait)
    .slice(0, 2);

  return (
    <Dialog
      layerClassName="sheet-layer fallback-layer"
      sectionClassName="fallback-dialog"
      labelledBy="fallback-title"
      onClose={onClose}
    >
      <header><div><p className="eyebrow">PREFERRED VISIT</p><h2 id="fallback-title">Choose your preferred visit time</h2></div><IconButton label="Close options" onClick={onClose}><X size={19} /></IconButton></header>
      <div className="fallback-reason"><CalendarDays size={20} /><span><strong>Book {service} at {branch.name}</strong><small>Pick the day and time that suits you — your arrival window is held for you.</small></span></div>
      <section className="appointment-picker"><div><h3>Book a guaranteed arrival window</h3><small>Your appointment is confirmed instantly.</small></div><div className="choice-row">{["Today", "Tomorrow"].map((item) => <button key={item} className={day === item ? "active" : ""} onClick={() => setDay(item)}>{item}</button>)}</div><div className="time-grid">{TIME_SLOTS.map((item) => <button key={item} className={time === item ? "active" : ""} onClick={() => setTime(item)}>{item}</button>)}</div><button className="primary-button full" onClick={() => onBook({ branch, service, day: day.toLowerCase(), time })}><CalendarDays size={18} /> Confirm {day.toLowerCase()} at {time}</button></section>
      <section className="alternative-branches"><div><h3>Or use the next-nearest centre</h3><small>Open for virtual joins</small></div>{alternatives.length ? alternatives.map((item) => <button key={item.id} onClick={() => onChooseAlternative(item)}><span className={`branch-icon ${item.accent}`}><Building2 size={19} /></span><span><strong>{item.name}</strong><small>{item.alternativeDistance} km away · {item.wait} min wait · verified {formatBranchFreshness(item)}</small></span><ChevronRight size={18} /></button>) : <p>No open alternatives are in the network right now.</p>}</section>
    </Dialog>
  );
}
