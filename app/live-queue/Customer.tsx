"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BellRing,
  Check,
  Clock3,
  MapPin,
  Radio,
  ShieldCheck,
  Store,
  Ticket,
  UsersRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { numberLabel, time } from "./model";
import { useQueue } from "./use-queue";
import { Brand, Live, ErrorNotice, Waves } from "./ui";

export default function Customer({ slug }: { slug: string }) {
  const q = useQueue(slug, false),
    d = q.data,
    biz = d?.business,
    t = d?.mine;
  const waiting = t?.status === "waiting",
    called = t?.status === "called",
    next = waiting && d?.position === 1;
  const active = waiting || called;
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState("");
  const ctx = useRef<AudioContext | null>(null);
  const last = useRef("");
  const state = t
    ? t.number + ":" + (called ? "called" : next ? "next" : t.status)
    : "";
  useEffect(() => {
    if (
      state !== last.current &&
      sound &&
      (next || called) &&
      ctx.current?.state === "running"
    ) {
      const a = ctx.current;
      for (const [offset, hz] of [
        [0, 660],
        [0.18, 880],
      ]) {
        const tone = a.createOscillator(),
          vol = a.createGain(),
          start = a.currentTime + offset;
        tone.type = "sine";
        tone.frequency.value = hz;
        vol.gain.setValueAtTime(0.001, start);
        vol.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        tone.connect(vol);
        vol.connect(a.destination);
        tone.start(start);
        tone.stop(start + 0.31);
      }
    }
    last.current = state;
  }, [state, sound, next, called]);
  useEffect(
    () => () => {
      if (ctx.current) void ctx.current.close();
    },
    [],
  );
  async function toggleSound() {
    if (sound) {
      setSound(false);
      return;
    }
    try {
      ctx.current ??= new AudioContext();
      await ctx.current.resume();
      setSound(true);
      setSoundError("");
    } catch {
      setSoundError(
        "Sound is unavailable on this device. On-screen alerts are still on.",
      );
    }
  }
  return (
    <div className="q-app q-customer">
      <header className="q-guest-top">
        <Brand />
        <Live on={q.connected} />
      </header>
      <main className="q-guest-main">
        <div className="q-eyebrow">
          <span className="q-tick" />
          Customer queue
        </div>
        <h1>
          {active ? "Your live ticket" : t ? "Visit update" : "Join the queue"}
        </h1>
        <p>
          {active
            ? "Your place is saved on this device."
            : "Skip the physical line. No account needed."}
        </p>
        <ErrorNotice text={q.error} retry={q.read} />
        {!d && !q.error && <p role="status">Connecting to the queue…</p>}
        {d && biz && (
          <>
            <section className="q-guest-ticket">
              <div className="q-guest-hero">
                <Waves />
                <div className="q-overline">
                  <Store size={14} />
                  Service point
                </div>
                <h2>{biz.name}</h2>
                <p>
                  <MapPin size={14} />
                  {biz.location}
                </p>
              </div>
              <div className="q-guest-content">
                {t && (
                  <div className="q-issued">
                    <div>
                      <div className="q-overline">Ticket number</div>
                      <strong>{numberLabel(t.number)}</strong>
                    </div>
                    <div>
                      <div className="q-overline">Issued at</div>
                      <span>
                        {new Date(t.joined_at).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          timeZone: biz.timezone,
                        })}{" "}
                        · {time(t.joined_at, biz.timezone)}
                      </span>
                    </div>
                  </div>
                )}
                <div role="status" aria-live="polite">
                  {(next || called) && (
                    <div className={"q-banner " + (called ? "called" : "")}>
                      <BellRing size={20} />
                      <div>
                        <b>
                          {called
                            ? "Your ticket has been called"
                            : "You’re next up"}
                        </b>
                        <span>
                          {called
                            ? "Please go to counter 01 now."
                            : "Stay nearby. The counter will call you soon."}
                        </span>
                      </div>
                    </div>
                  )}
                  {t && !active && (
                    <div className="q-banner">
                      <Check size={20} />
                      <div>
                        <b>
                          {t.status === "completed"
                            ? "Your visit is complete"
                            : "Your ticket was marked no-show"}
                        </b>
                        <span>
                          {t.status === "completed"
                            ? "Thank you for visiting."
                            : "You can join again for a new ticket."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="q-guest-metrics">
                  <div>
                    <UsersRound size={18} />
                    <small>
                      {waiting ? "Your position" : "People waiting"}
                    </small>
                    <b>
                      {waiting ? "#" + d.position : d.waiting}
                      {waiting && <em> of {d.waiting}</em>}
                    </b>
                  </div>
                  <div>
                    <Clock3 size={18} />
                    <small>Estimated wait</small>
                    <b>
                      {active ? d.estimate : d.newWait}
                      <em> min</em>
                    </b>
                  </div>
                </div>
                {active ? (
                  <>
                    <ol className="q-progress" aria-label="Ticket progress">
                      {["Joined", "Next up", "Called"].map((x, i) => (
                        <li
                          className={
                            i <= (called ? 2 : next ? 1 : 0) ? "done" : ""
                          }
                          key={x}
                        >
                          <span>
                            {i <= (called ? 2 : next ? 1 : 0) ? (
                              <Check size={13} />
                            ) : (
                              i + 1
                            )}
                          </span>
                          {x}
                        </li>
                      ))}
                    </ol>
                    <button
                      className="q-btn q-outline q-wide"
                      onClick={toggleSound}
                      aria-pressed={sound}
                    >
                      {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}{" "}
                      {sound ? "Sound alerts on" : "Enable sound alerts"}
                    </button>
                    <ErrorNotice text={soundError} />
                    <p className="q-tip">
                      Keep this page open for live alerts. You can refresh
                      without losing your ticket.
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      className="q-btn q-primary q-wide"
                      disabled={q.busy}
                      onClick={() => void q.join()}
                    >
                      <Ticket size={17} />
                      {q.busy
                        ? "Issuing ticket…"
                        : t
                          ? "Get a new ticket"
                          : "Get my ticket"}
                      <ArrowRight size={16} />
                    </button>
                    <p className="q-tip">
                      <ShieldCheck size={13} /> No phone number or sign-up
                      required.
                    </p>
                  </>
                )}
              </div>
            </section>
            <div className="q-guest-footer">
              <Radio size={14} /> Powered by QueueLess SA
            </div>
          </>
        )}
      </main>
    </div>
  );
}
