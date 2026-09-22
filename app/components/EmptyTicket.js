"use client";

import { ArrowRight, Ticket } from "lucide-react";

export default function EmptyTicket({ onExplore }) {
  return <main className="empty-ticket view-enter"><span><Ticket size={34} /></span><h1>No active queue</h1><p>Find a nearby branch and join before you leave home.</p><button className="primary-button" onClick={onExplore}>Explore nearby branches <ArrowRight size={18} /></button></main>;
}
