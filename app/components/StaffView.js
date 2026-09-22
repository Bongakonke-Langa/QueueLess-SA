"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CircleUserRound,
  MessageSquare,
  PhoneCall,
  PlayCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { branchJoinState, formatBranchFreshness, relativeTime } from "../lib/queue";
import { serviceCatalogue } from "../lib/data";
import NumberControl from "./NumberControl";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";

const QUEUE_POLL_MS = 5000;

const ticketStatusChip = {
  WAITING: "waiting",
  CALLED: "called",
  SERVING: "serving",
};

export default function StaffView({
  user,
  branchList,
  demoMode,
  notify,
  onSaveSettings,
  onTicketAction,
  onResetDemo,
  onCitizenView,
}) {
  const isAdmin = user.role === "ADMIN";
  const manageableBranches = useMemo(
    () => (isAdmin ? branchList : branchList.filter((branch) => branch.id === user.branchId)),
    [isAdmin, branchList, user.branchId],
  );
  const [selectedId, setSelectedId] = useState(manageableBranches[0]?.id ?? user.branchId);

  const [queue, setQueue] = useState(null);
  const [queueError, setQueueError] = useState("");
  const [busyTicketId, setBusyTicketId] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");

  const liveBranch = queue?.branch
    ? { ...queue.branch, accent: queue.branch.accent, services: queue.branch.services }
    : manageableBranches.find((branch) => branch.id === selectedId) || manageableBranches[0];

  const [draft, setDraft] = useState(() => draftFromBranch(liveBranch));
  useEffect(() => {
    setDraft(draftFromBranch(liveBranch));
  }, [liveBranch.id, liveBranch.updatedAt]);

  const loadQueue = useCallback(async (branchId) => {
    try {
      const response = await fetch(`/api/staff/queue?branchId=${branchId}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setQueueError(payload?.error || "The live queue is unavailable right now.");
        return;
      }
      const data = await response.json();
      setQueue(data);
      setQueueError("");
    } catch {
      setQueueError("The live queue is unavailable right now.");
    }
  }, []);

  const loadAnalytics = useCallback(async (branchId) => {
    try {
      const response = await fetch(`/api/staff/analytics?branchId=${branchId}`);
      if (!response.ok) {
        setAnalyticsError("Analytics are unavailable right now.");
        return;
      }
      setAnalytics(await response.json());
      setAnalyticsError("");
    } catch {
      setAnalyticsError("Analytics are unavailable right now.");
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return undefined;
    loadQueue(selectedId);
    loadAnalytics(selectedId);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadQueue(selectedId);
        loadAnalytics(selectedId);
      }
    }, QUEUE_POLL_MS);
    return () => window.clearInterval(timer);
  }, [selectedId, loadQueue, loadAnalytics]);

  const tickets = queue?.tickets || [];
  const waitingTickets = tickets.filter((t) => t.status === "WAITING");
  const nextWaiting = waitingTickets[0] || null;
  const activeCount = tickets.length;
  const livePeople = Math.min(draft.people + activeCount, 999);

  const todayStats = analytics?.today || null;
  const history = analytics?.history || [];
  const peakDay = history.length
    ? history.reduce((best, day) => (day.served > (best?.served ?? -1) ? day : best), null)
    : null;
  const historyPeak = Math.max(1, ...history.map((day) => day.served));

  async function handleTicketAction(ticket, action) {
    setBusyTicketId(ticket.id);
    const done = await onTicketAction(ticket.id, action);
    setBusyTicketId(null);
    if (done) await loadQueue(selectedId);
  }

  async function callNext() {
    if (!nextWaiting) return;
    await handleTicketAction(nextWaiting, "call");
  }

  async function publish() {
    setPublishing(true);
    const ok = await onSaveSettings(selectedId, draft);
    setPublishing(false);
    if (ok) await loadQueue(selectedId);
  }

  async function resetDemo() {
    setResetting(true);
    const done = await onResetDemo();
    setResetting(false);
    if (done) await loadQueue(selectedId);
  }

  function update(name, value) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function toggleService(serviceName) {
    setDraft((current) => ({
      ...current,
      unavailableServices: current.unavailableServices.includes(serviceName)
        ? current.unavailableServices.filter((name) => name !== serviceName)
        : [...current.unavailableServices, serviceName],
    }));
  }

  if (!manageableBranches.length) {
    return (
      <main className="staff-view view-enter">
        <section className="staff-heading">
          <div>
            <p className="eyebrow">BRANCH OPERATIONS</p>
            <h1>Live branch console</h1>
            <p>No branch is assigned to this account yet.</p>
          </div>
        </section>
        <section className="operations-panel">
          <p className="staff-queue-empty">Ask a QueueLess administrator to assign you to a branch, then reload this page.</p>
        </section>
      </main>
    );
  }

  const previewBranch = { ...liveBranch, ...draft, people: livePeople };
  const joinState = branchJoinState(previewBranch);
  const occupancy = Math.min(100, Math.round((livePeople / Math.max(draft.capacity, 1)) * 100));
  const branchOptions = manageableBranches.map((branch) => ({ label: branch.name, value: String(branch.id) }));

  return (
    <main className="staff-view view-enter">
      <section className="staff-heading">
        <div>
          <p className="eyebrow">BRANCH OPERATIONS</p>
          <h1>Live branch console</h1>
          <p>Call the next citizen, keep settings current — every update reaches citizen screens instantly.</p>
        </div>
        <div className="staff-heading-actions">
          <button className="secondary-button" onClick={onCitizenView}><CircleUserRound size={18} /> Citizen app</button>
        </div>
      </section>

      <section className="staff-branch-bar">
        <span className="staff-role"><Building2 size={20} /><span><small>SIGNED IN AS</small><strong>{isAdmin ? "Network administrator" : "Branch queue manager"}</strong></span></span>
        <label>
          <span>{isAdmin ? "Inspecting branch" : "Managing branch"}</span>
          <Select
            items={branchOptions}
            value={String(selectedId)}
            onValueChange={(value) => setSelectedId(Number(value))}
            disabled={!isAdmin}
          >
            <SelectTrigger className="staff-branch-select" aria-label="Managing branch"><SelectValue /></SelectTrigger>
            <SelectPopup>{branchOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectPopup>
          </Select>
        </label>
        <span className="staff-sync"><ShieldCheck size={18} /><span><small>LAST PUBLISHED</small><strong>{formatBranchFreshness(liveBranch)}</strong></span></span>
      </section>

      <div className="staff-layout">
        <section className="operations-panel">
          <div className="panel-heading staff-queue-heading">
            <span><Users size={19} /></span>
            <div><h2>Live queue</h2><p>{waitingTickets.length} waiting · {tickets.length - waitingTickets.length} at counters</p></div>
            <button className="primary-button call-next-button" onClick={callNext} disabled={!nextWaiting || busyTicketId !== null}>
              <PhoneCall size={17} /> Call next
            </button>
          </div>

          {queueError && <p className="staff-queue-error" role="alert">{queueError}</p>}

          {tickets.length === 0 && !queueError ? (
            <p className="staff-queue-empty">Nobody is waiting right now. Citizens who join the virtual queue will appear here instantly.</p>
          ) : (
            <ul className="staff-queue">
              {tickets.map((ticket, index) => (
                <li key={ticket.id} className="staff-queue-row">
                  <span className="staff-queue-position">{ticket.status === "WAITING" ? `#${index + 1}` : "•"}</span>
                  <div className="staff-queue-main">
                    <span className="staff-queue-code"><strong>{ticket.code}</strong><i className={`queue-chip ${ticketStatusChip[ticket.status] || ""}`}>{ticket.status === "WAITING" ? "Waiting" : ticket.status === "CALLED" ? "Called" : "Serving"}</i>{ticket.checkedIn && <i className="queue-chip checked"><UserCheck size={11} /> Checked in</i>}</span>
                    <span className="staff-queue-detail">{ticket.serviceName} · {ticket.userName} · {ticket.userPhone}</span>
                    <span className="staff-queue-time">Joined {relativeTime(ticket.joinedAt)}{ticket.ahead ? ` · ${ticket.ahead} ahead` : ""}</span>
                  </div>
                  <div className="staff-queue-actions">
                    {ticket.status === "WAITING" && <button className="staff-action" onClick={() => handleTicketAction(ticket, "call")} disabled={busyTicketId !== null}><PhoneCall size={14} /> Call</button>}
                    {ticket.status === "CALLED" && <button className="staff-action" onClick={() => handleTicketAction(ticket, "serve")} disabled={busyTicketId !== null}><PlayCircle size={14} /> Serve</button>}
                    {ticket.status === "SERVING" && <button className="staff-action done" onClick={() => handleTicketAction(ticket, "complete")} disabled={busyTicketId !== null}><UserCheck size={14} /> Done</button>}
                    {["WAITING", "CALLED"].includes(ticket.status) && <button className="staff-action quiet" onClick={() => handleTicketAction(ticket, "no-show")} disabled={busyTicketId !== null}><UserX size={14} /> No-show</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="panel-heading settings-heading">
            <span><SlidersHorizontal size={19} /></span>
            <div><h2>Branch settings</h2><p>Published to every citizen screen when you save</p></div>
          </div>

          <div className="status-segment" role="group" aria-label="Branch operating status">
            {[{ id: "open", label: "Open" }, { id: "paused", label: "Pause joins" }, { id: "closed", label: "Closed" }].map((status) => (
              <button key={status.id} className={draft.operationalStatus === status.id ? "active" : ""} onClick={() => update("operationalStatus", status.id)}>{status.label}</button>
            ))}
          </div>

          <div className="number-grid">
            <NumberControl label="Est. wait per person" value={draft.wait} min={0} max={120} suffix=" min" onChange={(value) => update("wait", value)} />
            <NumberControl label="Walk-ins in branch" value={draft.people} min={0} max={draft.capacity} onChange={(value) => update("people", value)} />
            <NumberControl label="Open counters" value={draft.counters} min={1} max={12} onChange={(value) => update("counters", value)} />
            <NumberControl label="Queue capacity" value={draft.capacity} min={5} max={100} onChange={(value) => { update("capacity", value); if (draft.people > value) update("people", value); }} />
          </div>

          <div className="capacity-meter"><span><strong>Occupancy</strong><small>{livePeople} of {draft.capacity} places (incl. virtual queue)</small></span><div><i style={{ width: `${occupancy}%` }} /></div><b>{occupancy}%</b></div>

          <div className="operations-toggles">
            <div className="operations-switch"><span><strong>Virtual joins</strong><small>Allow citizens to take a place remotely</small></span><Switch checked={draft.virtualJoins} onCheckedChange={(checked) => update("virtualJoins", checked)} aria-label="Virtual joins" /></div>
            <div className="operations-switch"><span><strong>Priority assistance</strong><small>Flag access support at check-in</small></span><Switch checked={draft.priorityAccess} onCheckedChange={(checked) => update("priorityAccess", checked)} aria-label="Priority assistance" /></div>
          </div>

          <div className="grace-control"><ShieldCheck size={18} /><span><strong>Arrival grace period</strong><small>Places release automatically after this time</small></span><NumberControl label="Grace" value={draft.graceMinutes} min={5} max={30} suffix=" min" onChange={(value) => update("graceMinutes", value)} /></div>

          <div className="service-availability">
            <div><h3>Services today</h3><small>Turn off anything temporarily unavailable</small></div>
            {(liveBranch.services || []).map((service) => {
              const available = !draft.unavailableServices.includes(service.name);
              return (
                <button key={service.name} type="button" role="switch" aria-checked={available} onClick={() => toggleService(service.name)}>
                  <span>{service.name}</span>
                  <span className={`availability-state ${available ? "available" : "off"}`}>{available ? "Available" : "Unavailable"}</span>
                </button>
              );
            })}
          </div>

          <button className="primary-button full publish-button" onClick={publish} disabled={publishing}>
            <Save size={18} /> {publishing ? "Publishing…" : "Publish live update"}
          </button>
        </section>

        <aside className="staff-insights">
          <section className="citizen-preview">
            <div className="panel-heading"><span><Smartphone size={19} /></span><div><h2>Citizen preview</h2><p>What citizens see right now</p></div></div>
            <div className="preview-branch"><span className={`branch-icon ${previewBranch.accent}`}><Building2 size={21} /></span><div><small>{serviceCatalogue[previewBranch.type]?.shortType || previewBranch.type}</small><strong>{previewBranch.name}</strong><span>{previewBranch.address}</span></div></div>
            <div className="preview-metrics"><div><small>WAIT</small><strong>{draft.wait} min</strong></div><div><small>IN QUEUE</small><strong>{livePeople}/{draft.capacity}</strong></div><div><small>COUNTERS</small><strong>{draft.counters}</strong></div></div>
            <div className={`preview-access ${joinState.canJoin ? "open" : "limited"}`}><span /><div><strong>{joinState.reason}</strong><small>{joinState.detail}</small></div></div>
          </section>

          <section className="impact-panel">
            <div className="panel-heading"><span><UserCheck size={19} /></span><div><h2>Today at this branch</h2><p>Live from the queue</p></div></div>
            <div className="impact-metrics">
              <div><strong>{liveBranch.servedToday}</strong><span>people served</span></div>
              <div><strong>{waitingTickets.length}</strong><span>waiting now</span></div>
              <div><strong>{tickets.filter((t) => t.status === "SERVING").length}</strong><span>at counters</span></div>
              <div><strong>{occupancy}%</strong><span>occupancy</span></div>
            </div>
          </section>

          <section className="impact-panel">
            <div className="panel-heading"><span><BarChart3 size={19} /></span><div><h2>Branch analytics</h2><p>Computed from visit history</p></div></div>
            {analyticsError ? (
              <p className="staff-queue-empty">{analyticsError}</p>
            ) : !todayStats ? (
              <p className="staff-queue-empty">Loading analytics…</p>
            ) : (
              <>
                <div className="impact-metrics">
                  <div><strong>{todayStats.served}</strong><span>served today</span></div>
                  <div><strong>{todayStats.avgWaitMinutes} min</strong><span>avg actual wait</span></div>
                  <div><strong>{todayStats.noShowRate}%</strong><span>no-show rate</span></div>
                  <div><strong>{todayStats.savedMinutes}</strong><span>min saved today</span></div>
                </div>
                {history.length > 0 && (
                  <div className="analytics-history">
                    <small>LAST 14 DAYS{peakDay ? ` · PEAK ${peakDay.day} (${peakDay.served} SERVED)` : ""}</small>
                    <div className="analytics-bars" role="img" aria-label="Visits served per day over the last 14 days">
                      {history.map((day) => (
                        <span key={day.day} title={`${day.day}: ${day.served} served · ${day.noShows} no-shows`}>
                          <i style={{ height: `${Math.max(6, Math.round((day.served / historyPeak) * 100))}%` }} />
                          <b>{day.day.slice(5)}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {demoMode && (
            <>
              <section className="channel-panel">
                <div><h2>Demo controls</h2><p>Return the whole operations demo to its opening state.</p></div>
                <div>
                  <button onClick={resetDemo} disabled={resetting}>
                    <RotateCcw size={17} /> {resetting ? "Resetting…" : "Reset demo data"}
                  </button>
                </div>
              </section>
              <section className="channel-panel">
                <div><h2>Access-channel test</h2><p>Send a demo update beyond the smartphone app.</p></div>
                <div>
                  <button onClick={() => notify("SMS update sent", `${liveBranch.name}: ${draft.wait} min wait, ${livePeople} people.`)}><Smartphone size={17} /> SMS</button>
                  <button onClick={() => notify("WhatsApp update sent", `Queue status shared for ${liveBranch.name}.`)}><MessageSquare size={17} /> WhatsApp</button>
                  <button onClick={() => notify("USSD status published", "The *120*7537# menu now reflects this branch update.")}><PhoneCall size={17} /> USSD</button>
                </div>
              </section>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

function draftFromBranch(branch) {
  return {
    wait: branch.wait,
    people: branch.walkIns ?? branch.people,
    counters: branch.counters,
    capacity: branch.capacity,
    operationalStatus: branch.operationalStatus,
    virtualJoins: branch.virtualJoins,
    graceMinutes: branch.graceMinutes,
    priorityAccess: branch.priorityAccess,
    unavailableServices: branch.unavailableServices || [],
  };
}
