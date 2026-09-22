"use client";

import {
  ChevronRight,
  MapPin,
  ShieldCheck,
  Ticket,
  Zap,
} from "lucide-react";
import { branchTypeIcon } from "../lib/data";
import { formatSavedDuration, formatSearchTime } from "../lib/queue";

export default function ActivityView({ onOpenVisit, locationHistory, onSelectLocation, completedVisits, totalSavedMinutes }) {
  const items = completedVisits;
  const totalSaved = totalSavedMinutes ?? items.reduce((total, item) => total + (item.savedMinutes || 0), 0);
  return (
    <main className="simple-view view-enter">
      <section className="simple-heading"><div><p className="eyebrow">YOUR IMPACT</p><h1>Time back in your day.</h1><p>A record of your QueueLess visits.</p></div></section>
      <section className="impact-band"><div><Zap size={24} /><span><strong>{formatSavedDuration(totalSaved)}</strong><small>Total time saved</small></span></div><div><Ticket size={24} /><span><strong>{items.length}</strong><small>Queues completed</small></span></div><div><MapPin size={24} /><span><strong>{items.length}</strong><small>Counters skipped</small></span></div></section>
      <section className="history-section location-history-section">
        <div className="section-heading"><div><h2>Location activity</h2><p>Every service-area update stored on this device</p></div><span className="private-badge"><ShieldCheck size={14} /> Private</span></div>
        {locationHistory.length ? (
          <div className="history-list location-history-list">{locationHistory.map((area) => (
            <button key={area.historyId} onClick={() => onSelectLocation(area)} aria-label={`Search around ${area.label} again`}>
              <span className="branch-icon gold"><MapPin size={21} /></span>
              <span className="history-copy"><strong>{area.label}</strong><span>{area.secondary}</span></span>
              <span className="location-history-meta"><strong>{area.source === "gps" ? "GPS" : area.source === "geocoding" ? "Live API" : "Area preset"}</strong><small>{formatSearchTime(area.timestamp)}</small></span>
              <ChevronRight size={18} />
            </button>
          ))}</div>
        ) : (
          <div className="location-history-empty"><MapPin size={22} /><span><strong>No location changes yet</strong><small>Change the search area on Explore and it will appear here.</small></span></div>
        )}
      </section>
      <section className="history-section">
        <div className="section-heading"><div><h2>Recent visits</h2><p>Your completed service history</p></div></div>
        <div className="history-list">
          {items.length ? items.map((item) => {
            const Icon = branchTypeIcon(item.type);
            return (
              <button key={item.id} onClick={() => onOpenVisit(item)} aria-label={`View ${item.name} visit`}>
                <span className={`branch-icon ${item.tone}`}><Icon size={21} /></span>
                <span className="history-copy"><strong>{item.name}</strong><span>{item.service} · {item.date}</span></span>
                <span className="saved"><Zap size={14} /> Saved {formatSavedDuration(item.savedMinutes || 0)}</span>
                <ChevronRight size={18} />
              </button>
            );
          }) : (
            <div className="location-history-empty"><Ticket size={22} /><span><strong>No visits yet</strong><small>Join a queue, get served, and your completed visits will appear here.</small></span></div>
          )}
        </div>
      </section>
    </main>
  );
}
