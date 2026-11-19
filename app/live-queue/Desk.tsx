"use client";
import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  UsersRound,
  Clock3,
  CheckCheck,
  Layers3,
  History,
  QrCode,
  SlidersHorizontal,
  Store,
  ChevronRight,
  CalendarDays,
  Radio,
  Check,
  UserRoundX,
  Timer,
  ListOrdered,
  LogOut,
  Menu,
  X,
  Monitor,
  Flag,
} from "lucide-react";
import { useQueue } from "./use-queue";
import { type Priority, numberLabel, time, priorities } from "./model";
import { Brand, ErrorNotice, Live, Modal, Waves } from "./ui";
import Poster from "./Poster";

export default function Desk({ slug }: { slug: string }) {
  const q = useQueue(slug, true);
  const d = q.data,
    biz = d?.business,
    current = d?.called;
  const [section, setSection] = useState<"live" | "history">("live");
  const [modal, setModal] = useState<"settings" | "poster" | "no_show" | null>(
    null,
  );
  const [target, setTarget] = useState<number | null>(null);
  const [duration, setDuration] = useState("");
  const [mobile, setMobile] = useState(false);
  const [filter, setFilter] = useState(false);
  const [notice, setNotice] = useState("");
  function settings() {
    if (!biz) return;
    setMobile(false);
    setDuration(String(biz.average_minutes));
    setModal("settings");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (await q.manage({ action: "average", minutes: Number(duration) })) {
      setModal(null);
      setNotice("Service time saved.");
    }
  }
  const line = d?.line ?? [],
    visible = filter ? line.filter((t) => t.priority !== "standard") : line;
  const open = (s: "live" | "history") => {
    setSection(s);
    setMobile(false);
    setNotice("");
  };
  const nav = (
    <>
      <div className="q-nav-label">Workspace</div>
      <button
        className={section === "live" ? "active" : ""}
        onClick={() => open("live")}
      >
        <Layers3 />
        Live queue
      </button>
      <button
        className={section === "history" ? "active" : ""}
        onClick={() => open("history")}
      >
        <History />
        Ticket history
      </button>
      <div className="q-nav-label">Management</div>
      <button
        disabled={!biz}
        onClick={() => {
          setMobile(false);
          setModal("poster");
        }}
      >
        <QrCode />
        Join poster
      </button>
      <button disabled={!biz} onClick={settings}>
        <SlidersHorizontal />
        Queue settings
      </button>
    </>
  );
  const pageName = section === "live" ? "Live queue" : "Ticket history";
  return (
    <div className="q-app q-shell">
      <aside className={"q-sidebar " + (mobile ? "is-open" : "")}>
        <div className="q-brand-row">
          <Brand />
          <button
            className="q-mobile-close q-icon"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <div className="q-desk-label">
          <span />
          Merchant console
        </div>
        <nav aria-label="Merchant navigation">{nav}</nav>
        <div className="q-side-foot">
          <div className="q-location-icon">
            <Store size={20} />
          </div>
          <div>
            <strong>{biz?.name || "Merchant desk"}</strong>
            <small>{biz?.demo ? "Demo workspace" : "Merchant workspace"}</small>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="q-scrim"
          aria-label="Dismiss navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <main className="q-main">
        <header className="q-top">
          <div className="q-crumb">
            <button
              className="q-menu q-icon"
              aria-label="Open menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={18} />
            </button>
            <Monitor size={15} />
            <span>Workspace</span>
            <ChevronRight size={13} />
            <b>{pageName}</b>
          </div>
          <div className="flex items-center gap-3">
            <a
              className="q-btn q-outline q-customer-link"
              href={"/join/" + slug}
              target="_blank"
              rel="noreferrer"
            >
              Customer view <ArrowUpRight size={15} />
            </a>
            {biz && !biz.demo && (
              <button
                className="q-icon"
                title="Sign out"
                aria-label="Sign out"
                onClick={() => void q.signOut()}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </header>
        <div className="q-work">
          <div className="q-heading">
            <div>
              <div className="q-eyebrow">
                <span className="q-tick" /> Merchant workspace
              </div>
              <h1>
                {section === "live" ? "Queue overview" : "Ticket history"}
              </h1>
              <p>
                {section === "live"
                  ? "Manage your line and keep service moving."
                  : "Review the last 50 completed and no-show tickets."}
              </p>
            </div>
            {biz && (
              <div className="q-date">
                <CalendarDays size={15} />
                {new Intl.DateTimeFormat("en-ZA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: biz.timezone,
                }).format(new Date())}
              </div>
            )}
          </div>
          <ErrorNotice text={q.error} retry={q.read} />
          {q.login && !d && (
            <form
              className="q-login q-card"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void q.signIn(
                  String(f.get("email")),
                  String(f.get("password")),
                );
              }}
            >
              <Store size={25} />
              <h2>Merchant sign-in</h2>
              <p>Use the account assigned to this business.</p>
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <button className="q-btn q-primary" disabled={q.busy}>
                Sign in <ArrowRight size={15} />
              </button>
            </form>
          )}
          {!d && !q.login && !q.error && (
            <p className="q-loading" role="status">
              Connecting to the queue…
            </p>
          )}
          {d && biz && (
            <>
              {section === "live" ? (
                <>
                  <div className="q-stats">
                    <Stat
                      icon={<UsersRound />}
                      color="mint"
                      label="Waiting now"
                      value={d.waiting}
                      unit={d.waiting === 1 ? "person" : "people"}
                      detail="In the active queue"
                    />
                    <Stat
                      icon={<Clock3 />}
                      color="amber"
                      label="Estimated wait"
                      value={d.newWait}
                      unit="min"
                      detail="For a new arrival"
                    />
                    <Stat
                      icon={<CheckCheck />}
                      color="blue"
                      label="Served today"
                      value={d.completed ?? 0}
                      unit="tickets"
                      detail="Completed at this desk"
                    />
                  </div>
                  <div className="q-columns">
                    <div className="q-stack">
                      <section className="q-counter">
                        <Waves />
                        <div className="q-counter-in">
                          <div className="q-counter-top">
                            <span className="q-overline">
                              <span className="q-signal" />
                              Now serving
                            </span>
                            <span className="q-counter-chip">
                              <Radio size={12} /> Counter 01
                            </span>
                          </div>
                          <div className="q-current">
                            {current
                              ? numberLabel(current.number)
                              : "Counter ready"}
                          </div>
                          <p>
                            {current
                              ? "Called at " +
                                time(current.called_at!, biz.timezone) +
                                " · In service"
                              : line.length
                                ? "The next ticket is ready to call."
                                : "Waiting for the next arrival."}
                          </p>
                          {current ? (
                            <div className="q-counter-actions">
                              <button
                                disabled={q.busy}
                                className="q-btn q-light"
                                onClick={async () => {
                                  if (
                                    await q.manage({
                                      action: "completed",
                                      ticket: current.number,
                                    })
                                  )
                                    setNotice(
                                      numberLabel(current.number) +
                                        " marked completed.",
                                    );
                                }}
                              >
                                <Check size={15} />
                                Mark completed
                              </button>
                              <button
                                disabled={q.busy}
                                className="q-btn q-ghost"
                                onClick={() => {
                                  setTarget(current.number);
                                  setModal("no_show");
                                }}
                              >
                                <UserRoundX size={15} />
                                No-show
                              </button>
                            </div>
                          ) : (
                            <div className="q-counter-actions">
                              <button
                                className="q-btn q-light"
                                disabled={!line.length || q.busy}
                                onClick={() =>
                                  void q.manage({
                                    action: "call",
                                    ticket: line[0]?.number,
                                  })
                                }
                              >
                                <Radio size={15} />
                                Call next
                              </button>
                            </div>
                          )}
                        </div>
                      </section>
                      <section className="q-card q-line">
                        <div className="q-line-head">
                          <div>
                            <div className="q-card-title">
                              <ListOrdered size={19} />
                              <h2>Waiting line</h2>
                              <span className="q-count">{line.length}</span>
                            </div>
                            <p>Priority first, then by arrival time.</p>
                          </div>
                          <button
                            className="q-filter"
                            aria-pressed={filter}
                            onClick={() => setFilter(!filter)}
                          >
                            <Flag size={13} />
                            {filter ? "Priority only" : "All tickets"}
                          </button>
                        </div>
                        <div className="q-tablescroll">
                          <table>
                            <thead>
                              <tr>
                                <th>Position</th>
                                <th>Ticket</th>
                                <th>Joined</th>
                                <th>Priority</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visible.map((t) => (
                                <tr key={t.number}>
                                  <td>
                                    <span
                                      className={
                                        "q-place " +
                                        (line[0].number === t.number
                                          ? "first"
                                          : "")
                                      }
                                    >
                                      {line.indexOf(t) + 1}
                                    </span>
                                  </td>
                                  <td className="q-ticketnum">
                                    {numberLabel(t.number)}
                                  </td>
                                  <td>{time(t.joined_at, biz.timezone)}</td>
                                  <td>
                                    <label className={"q-select " + t.priority}>
                                      <span />
                                      <select
                                        aria-label={
                                          "Priority for " +
                                          numberLabel(t.number)
                                        }
                                        value={t.priority}
                                        disabled={q.busy}
                                        onChange={(e) =>
                                          void q.manage({
                                            action: "priority",
                                            ticket: t.number,
                                            category: e.target
                                              .value as Priority,
                                          })
                                        }
                                      >
                                        {priorities.map((v) => (
                                          <option value={v} key={v}>
                                            {v[0].toUpperCase() + v.slice(1)}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {!visible.length && (
                          <p className="q-empty">
                            {filter
                              ? "No priority tickets."
                              : "No one is waiting. Share your QR code to get started."}
                          </p>
                        )}
                        <div className="q-line-foot">
                          <Live on={q.connected} />
                          <span>{biz.name}</span>
                        </div>
                      </section>
                    </div>
                    <div className="q-stack">
                      <Poster business={biz} />
                      <section className="q-card q-settings">
                        <div className="q-card-title">
                          <span className="q-section-icon">
                            <Timer size={17} />
                          </span>
                          <h2>Service time</h2>
                        </div>
                        <p>Average time per customer.</p>
                        <div className="q-config">
                          <b>
                            {biz.average_minutes} <small>min</small>
                          </b>
                          <button className="q-textbtn" onClick={settings}>
                            Edit <SlidersHorizontal size={13} />
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </>
              ) : (
                <section className="q-card q-line">
                  <div className="q-line-head">
                    <div className="q-card-title">
                      <History size={18} />
                      <h2>Recent tickets</h2>
                    </div>
                    <Live on={q.connected} />
                  </div>
                  <div className="q-tablescroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Joined</th>
                          <th>Finished</th>
                          <th>Outcome</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(d.history ?? []).map((t) => (
                          <tr key={t.number}>
                            <td className="q-ticketnum">
                              {numberLabel(t.number)}
                            </td>
                            <td>{time(t.joined_at, biz.timezone)}</td>
                            <td>
                              {new Date(t.ended_at!).toLocaleDateString(
                                "en-ZA",
                                { timeZone: biz.timezone },
                              )}{" "}
                              · {time(t.ended_at!, biz.timezone)}
                            </td>
                            <td>
                              {t.status === "no_show" ? "No-show" : "Completed"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!d.history?.length && (
                    <p className="q-empty">No finished tickets yet.</p>
                  )}
                </section>
              )}
              <div role="status" className="q-notice">
                {notice}
              </div>
              {modal === "settings" && (
                <Modal title="Queue settings" close={() => setModal(null)}>
                  <form onSubmit={save}>
                    <p>
                      Set the average service time used for customer wait
                      estimates.
                    </p>
                    <label>
                      Minutes per customer
                      <input
                        autoFocus
                        required
                        type="number"
                        min="1"
                        max="120"
                        step="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </label>
                    <ErrorNotice text={q.error} />
                    <button className="q-btn q-primary" disabled={q.busy}>
                      Save changes
                    </button>
                  </form>
                </Modal>
              )}
              {modal === "poster" && (
                <Modal title="Join poster" close={() => setModal(null)}>
                  <Poster business={biz} />
                </Modal>
              )}
              {modal === "no_show" && target !== null && (
                <Modal
                  title={"Mark " + numberLabel(target) + " as a no-show?"}
                  close={() => setModal(null)}
                >
                  <p>
                    This will close the ticket and free the counter for the next
                    person.
                  </p>
                  <ErrorNotice text={q.error} />
                  <button
                    className="q-btn q-primary"
                    disabled={q.busy}
                    onClick={async () => {
                      if (
                        await q.manage({ action: "no_show", ticket: target })
                      ) {
                        setModal(null);
                        setNotice(numberLabel(target) + " marked no-show.");
                      }
                    }}
                  >
                    Confirm no-show
                  </button>
                </Modal>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
function Stat({
  icon,
  color,
  label,
  value,
  unit,
  detail,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: number;
  unit: string;
  detail: string;
}) {
  return (
    <section className="q-card q-stat">
      <div className="q-stat-top">
        <span className={"q-stat-icon " + color}>{icon}</span>
        <h2>{label}</h2>
      </div>
      <div className="q-stat-value">
        {value}
        <span>{unit}</span>
      </div>
      <div className="q-stat-detail">{detail}</div>
    </section>
  );
}
