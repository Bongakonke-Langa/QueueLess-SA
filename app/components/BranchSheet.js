"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Landmark,
  MapPin,
  Navigation,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { branchTypeIcon } from "../lib/data";
import { branchJoinState, formatBranchFreshness, formatTime } from "../lib/queue";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

export default function BranchSheet({ branch, initialService, onClose, onContinue, onFallback }) {
  const availableServices = branch.services.filter((service) => !branch.unavailableServices.includes(service.name));
  const [selectedService, setSelectedService] = useState(initialService && !branch.unavailableServices.includes(initialService) ? initialService : availableServices[0]?.name || "");
  const BranchIcon = branchTypeIcon(branch.type);
  const joinState = branchJoinState(branch);

  return (
    <Dialog
      layerClassName="sheet-layer"
      sectionClassName="branch-sheet"
      labelledBy="branch-title"
      onClose={onClose}
    >
      <div className="sheet-handle" />
      <div className="sheet-header">
        <IconButton label="Close branch details" onClick={onClose}><X size={20} /></IconButton>
        <span className="verified"><BadgeCheck size={16} /> Staff verified {formatBranchFreshness(branch)}</span>
      </div>

      <div className="branch-title-row">
        <span className={`branch-icon large ${branch.accent}`}><BranchIcon size={26} /></span>
        <div><p>{branch.shortType}</p><h2 id="branch-title">{branch.name}</h2><span><MapPin size={15} /> {branch.address}</span></div>
      </div>

      <div className="branch-vitals">
        <div><small>ESTIMATED WAIT</small><strong>{branch.wait} min</strong><span className="positive"><Activity size={14} /> {branch.status}</span></div>
        <div><small>QUEUE CAPACITY</small><strong>{branch.people}/{branch.capacity}</strong><span><Users size={14} /> Live count</span></div>
        <div><small>TRAVEL TIME</small><strong>{branch.travel} min</strong><span><Navigation size={14} /> From you</span></div>
      </div>

      <div className={`branch-access-state ${joinState.canJoin ? "open" : "limited"}`}>
        {joinState.canJoin ? <BadgeCheck size={18} /> : <CalendarDays size={18} />}
        <span><strong>{joinState.reason}</strong><small>{joinState.detail}</small></span>
      </div>

      <div className="service-selector">
        <div className="section-heading"><div><h3>What do you need help with?</h3><p>Select one service</p></div></div>
        <div className="service-options">
          {branch.services.map((service) => {
            const isUnavailable = branch.unavailableServices.includes(service.name);
            return (
            <button
              key={service.name}
              className={selectedService === service.name ? "selected" : ""}
              onClick={() => setSelectedService(service.name)}
              disabled={isUnavailable}
            >
              <span className="radio"><Check size={14} /></span>
              <span><strong>{service.name}</strong><small>{isUnavailable ? "Unavailable today" : service.duration}</small></span>
            </button>
          )})}
        </div>
      </div>

      <div className="fair-queue-rules" aria-label="Fair queue rules">
        <span><ShieldCheck size={18} /></span>
        <div><strong>Fair queue rules</strong><small>One active ticket per person · {branch.graceMinutes}-minute arrival grace · unattended places release automatically</small></div>
      </div>

      <div className="sheet-footer">
        <span className="arrival-note"><ShieldCheck size={19} /><span><strong>{joinState.canJoin ? `Arrive by ${formatTime(branch.wait + 7)}` : "You still have options"}</strong><small>{joinState.canJoin ? `Your place is held for ${branch.graceMinutes} minutes` : "Book a slot or compare quieter centres"}</small></span></span>
        {joinState.canJoin ? (
          <div className="sheet-footer-actions">
            <button className="secondary-button" onClick={() => onFallback(selectedService || branch.services[0].name)}><CalendarDays size={17} /> Book a time</button>
            <button className="primary-button" onClick={() => onContinue(selectedService)} disabled={!selectedService}>Join virtual queue <ArrowRight size={19} /></button>
          </div>
        ) : (
          <button className="primary-button" onClick={() => onFallback(selectedService || branch.services[0].name)}>Appointments and alternatives <CalendarDays size={19} /></button>
        )}
      </div>
    </Dialog>
  );
}
