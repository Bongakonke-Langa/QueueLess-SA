"use client";

import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Building2,
  CalendarDays,
  Clock3,
  Navigation,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { formatTime } from "../lib/queue";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

export default function JoinConfirmation({ branch, service, onBack, onConfirm }) {
  return (
    <Dialog
      layerClassName="sheet-layer confirmation-layer"
      sectionClassName="confirmation-sheet"
      labelledBy="confirm-title"
      onClose={onBack}
      backdropCloses={false}
    >
      <div className="confirm-top">
        <IconButton label="Back to branch details" onClick={onBack}><ArrowLeft size={20} /></IconButton>
        <span>Confirm your place</span>
        <span className="step-count">2 of 2</span>
      </div>
      <div className="confirm-visual">
        <span className="ticket-rings"><Ticket size={32} /></span>
        <h2 id="confirm-title">Skip the waiting room.</h2>
        <p>We’ll keep an eye on the queue and tell you when it’s time to leave.</p>
      </div>
      <div className="confirm-summary">
        <div className="summary-branch"><span className={`branch-icon ${branch.accent}`}><Building2 size={22} /></span><span><small>JOINING</small><strong>{branch.name}</strong><span>{service}</span></span></div>
        <div className="summary-grid">
          <div><Clock3 size={19} /><span><small>Estimated wait</small><strong>{branch.wait} minutes</strong></span></div>
          <div><Users size={19} /><span><small>Ahead of you</small><strong>{branch.people} people</strong></span></div>
          <div><Navigation size={19} /><span><small>Leave in</small><strong>{Math.max(branch.wait - branch.travel + 5, 3)} minutes</strong></span></div>
          <div><CalendarDays size={19} /><span><small>Expected service</small><strong>{formatTime(branch.wait)}</strong></span></div>
        </div>
      </div>
      <label className="notification-toggle">
        <span className="toggle-icon"><BellRing size={20} /></span>
        <span><strong>Queue alerts</strong><small>Notify me when it is time to leave</small></span>
        <input type="checkbox" defaultChecked />
        <i />
      </label>
      <button className="primary-button full" onClick={onConfirm}>Confirm and join queue <ArrowRight size={19} /></button>
      <p className="privacy-note"><ShieldCheck size={14} /> Your ID is only shared with this branch.</p>
    </Dialog>
  );
}
