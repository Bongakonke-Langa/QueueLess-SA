"use client";

import { BadgeCheck, ChevronRight, Clock3 } from "lucide-react";
import { branchTypeIcon } from "../lib/data";
import { formatBranchFreshness } from "../lib/queue";

export default function BranchCard({ branch, selected, onSelect }) {
  const Icon = branchTypeIcon(branch.type);
  const waitTone = branch.wait <= 20 ? "good" : branch.wait <= 35 ? "medium" : "busy";
  return (
    <button className={`branch-card ${selected ? "selected" : ""}`} onClick={() => onSelect(branch)}>
      <span className={`branch-icon ${branch.accent}`}><Icon size={22} /></span>
      <span className="branch-copy">
        <span className="branch-eyebrow">{branch.shortType} <i /> {branch.distance} km</span>
        <strong>{branch.name}</strong>
        <span className="branch-meta"><Clock3 size={15} /> Closes {branch.closes} <i /> {branch.people} waiting</span>
        <span className={`branch-verified ${branch.operationalStatus !== "open" ? "limited" : ""}`}><BadgeCheck size={13} /> {branch.operationalStatus === "open" ? "Verified" : branch.status} · {formatBranchFreshness(branch)}</span>
      </span>
      <span className={`wait-time ${waitTone}`}><strong>{branch.wait}</strong><small>min wait</small></span>
      <ChevronRight className="branch-arrow" size={19} />
    </button>
  );
}
