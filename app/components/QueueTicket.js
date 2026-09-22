"use client";

import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  Footprints,
  Landmark,
  MapPin,
  Navigation,
  Sparkles,
  Zap,
  BellRing,
} from "lucide-react";
import { formatTime, getDirectionsUrl, withLiveDistance } from "../lib/queue";

export default function QueueTicket({ ticket, branchList, onAdvance, onCancel, onCheckedIn, onComplete, userLocation, demoMode }) {
  const latestBranch = branchList.find((branch) => branch.id === ticket.branchId) || ticket.branch;
  const activeBranch = withLiveDistance(latestBranch, userLocation);
  const isCheckedIn = ticket.checkedIn;
  const isCalled = ticket.status === "CALLED";
  const isServing = ticket.status === "SERVING";
  const ahead = Math.max(ticket.ahead, 0);
  const progress = Math.max(4, Math.min(100, 100 - (ahead / Math.max(ticket.initialAhead, 1)) * 100));
  const leaveSoon = !isServing && !isCalled && ahead <= 3;

  const headline = isServing
    ? "You’re being served."
    : isCalled
      ? "You’re next!"
      : isCheckedIn
        ? "You’re checked in."
        : "Your place is secured.";
  const subline = isServing
    ? "Enjoy — the waiting is over."
    : isCalled
      ? "Go to the counter now and check in."
      : isCheckedIn
        ? "Please wait near the service counter."
        : leaveSoon
          ? "Time to head to the branch. Your turn is close."
          : "Carry on with your day. We’ll watch the queue for you.";
  const statusLabel = isServing ? "Now serving" : isCalled ? "Called" : isCheckedIn ? "Checked in" : "Live";
  const statusClass = isServing ? "checked" : isCalled ? "checked" : isCheckedIn ? "checked" : "";

  const liveMessage = isServing
    ? "The branch is serving you now."
    : isCalled
      ? `Ticket ${ticket.code} has been called.`
      : leaveSoon
        ? "Time to head to the branch"
        : "The queue is moving. We’ll alert you when to leave.";
  const joinedClock = new Date(ticket.joinedAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <main className="ticket-view view-enter">
      <section className="ticket-heading">
        <div><p className="eyebrow">ACTIVE VIRTUAL QUEUE</p><h1>{headline}</h1><p>{subline}</p></div>
        <span className={`live-status ${statusClass}`}><span /> {statusLabel}</span>
      </section>

      <section className={`live-ticket ${isCheckedIn ? "is-checked" : ""}`}>
        <div className="ticket-main">
          <div className="ticket-number"><small>YOUR TICKET</small><strong>{ticket.code}</strong><span>{ticket.service}</span></div>
          <div className="queue-progress" style={{ "--progress": `${progress}%` }}>
            <div><strong>{isServing ? <Check size={38} /> : isCalled ? "1" : ahead}</strong><span>{isServing ? "NOW" : isCalled ? "YOU’RE NEXT" : ahead === 0 ? "NEXT IN LINE" : "PEOPLE AHEAD"}</span></div>
          </div>
          <div className="queue-message"><span className="pulse-icon"><BellRing size={20} /></span><div><small>LIVE UPDATE</small><strong>{liveMessage}</strong><span>Updated just now</span></div></div>
        </div>
        <div className="ticket-side">
          <div><small>ESTIMATED TURN</small><strong>{isServing ? "Now" : formatTime(Math.max(ticket.waitMinutes, 0))}</strong></div>
          <div><small>WAIT REMAINING</small><strong>{isServing ? "0 min" : `~${Math.max(ticket.waitMinutes, 0)} min`}</strong></div>
          <div><small>QUEUE STATUS</small><strong className="moving"><Activity size={16} /> {isServing ? "Serving" : "Moving well"}</strong></div>
        </div>
      </section>

      {demoMode && ticket.status === "WAITING" && (
        <section className="demo-control">
          <span className="demo-badge"><Zap size={16} /> DEMO MODE</span>
          <span><strong>Simulate branch staff</strong><small>Runs the same "call next" action a staff console would.</small></span>
          <button onClick={onAdvance}>{isCalled ? "Ticket called" : "Call my ticket"} <ArrowRight size={17} /></button>
        </section>
      )}

      <section className="ticket-details-layout">
        <div className="journey-panel">
          <div className="section-heading"><div><h2>Your queue journey</h2><p>Live timing based on branch flow</p></div></div>
          <div className="timeline">
            <div className="timeline-step done"><span><Check size={16} /></span><div><strong>Joined the virtual queue</strong><small>{joinedClock} · Place secured</small></div></div>
            <div className={`timeline-step ${ahead <= 3 || isCalled || isServing ? "done" : "active"}`}><span>{ahead <= 3 || isCalled || isServing ? <Check size={16} /> : <MapPin size={16} />}</span><div><strong>Leave for the branch</strong><small>{ahead <= 3 || isCalled || isServing ? `Alert sent · Travel time ${activeBranch.travel} min` : `We’ll alert you about ${Math.max(ticket.waitMinutes - activeBranch.travel, 2)} min before`}</small></div></div>
            <div className={`timeline-step ${isCheckedIn ? "done" : isCalled || ahead <= 3 ? "active" : ""}`}><span>{isCheckedIn ? <Check size={16} /> : <MapPin size={16} />}</span><div><strong>Arrive and check in</strong><small>{isCheckedIn ? "Checked in successfully" : "Confirm your arrival from the app"}</small></div></div>
            <div className={`timeline-step ${isServing ? "done" : isCalled ? "active" : ""}`}><span><Sparkles size={16} /></span><div><strong>Get served</strong><small>{isServing ? `Serving ticket ${ticket.code}` : isCalled ? `Serving ticket ${ticket.code} now` : `We’ll call ticket ${ticket.code}`}</small></div></div>
          </div>
        </div>

        <aside className="branch-panel">
          <div className="branch-panel-title"><span className={`branch-icon ${activeBranch.accent}`}><Landmark size={22} /></span><div><small>YOUR BRANCH</small><strong>{activeBranch.name}</strong><span>{activeBranch.address}</span></div></div>
          <div className="branch-panel-meta"><span><Clock3 size={16} /> Open until {activeBranch.closes}</span><span><Footprints size={16} /> {activeBranch.distance} km away {userLocation ? "· live" : ""}</span></div>
          <a
            className="secondary-button"
            href={getDirectionsUrl(activeBranch, userLocation)}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={18} /> Get directions
          </a>
          {isServing ? (
            <button className="primary-button full complete-service" onClick={onComplete}><Check size={19} /> Mark service complete</button>
          ) : (
            <>
              {!isCheckedIn && <button className="primary-button full check-in" onClick={onCheckedIn}><MapPin size={19} /> I’m at the branch</button>}
              {isCheckedIn && <button className="primary-button full complete-service" onClick={onComplete}><Check size={19} /> Mark service complete</button>}
              <button className="danger-button" onClick={onCancel}>Leave this queue</button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
