"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Brand } from "../components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [carriedName, setCarriedName] = useState("");

  useEffect(() => {
    // Already signed in? Straight through.
    fetch("/api/me")
      .then((response) => {
        if (response.ok) router.replace("/");
        else setChecking(false);
      })
      .catch(() => setChecking(false));

    // Carry a name saved on this device into the new account.
    try {
      const saved = JSON.parse(window.localStorage.getItem("queueless-profile") || "null");
      if (saved?.name) setCarriedName(saved.name);
    } catch {
      // Storage unavailable; the account simply starts with an empty name.
    }
  }, [router]);

  async function requestOtp(event) {
    event?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "The sign-in service is temporarily unavailable. Please try again in a moment.");
      }
      setDevCode(payload?.devCode || "");
      setStep("code");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event) {
    event?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name: carriedName || undefined }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "The sign-in service is temporarily unavailable. Please try again in a moment.");
      }
      router.replace("/");
    } catch (verifyError) {
      setError(verifyError.message);
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <main className="auth-screen">
        <div className="app-loading"><span /></div>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand"><Brand /></div>
        <h1 className="auth-title">{step === "phone" ? "Welcome back." : "Check your messages."}</h1>
        <p className="auth-sub">
          {step === "phone"
            ? "Sign in with your mobile number to join live queues, book appointments and keep your visit history."
            : `We sent a 6-digit code to ${phone}. It is valid for 5 minutes.`}
        </p>

        {error && <p className="auth-error" role="alert">{error}</p>}
        {step === "code" && devCode && (
          <p className="auth-devcode">Demo sign-in — your code is <b>{devCode}</b></p>
        )}

        {step === "phone" ? (
          <form onSubmit={requestOtp}>
            <label className="auth-field">
              <span>MOBILE NUMBER</span>
              <input
                className="auth-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="082 555 0142"
                required
                autoFocus
              />
            </label>
            <button className="primary-button full" disabled={busy}>
              {busy ? "Sending…" : "Send my code"} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <label className="auth-field">
              <span>6-DIGIT CODE</span>
              <input
                className="auth-input auth-otp"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="······"
                required
                autoFocus
              />
            </label>
            <button className="primary-button full" disabled={busy || code.length !== 6}>
              {busy ? "Verifying…" : "Verify and continue"} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {step === "code" && (
          <div className="auth-row" style={{ marginTop: 16, marginBottom: 0 }}>
            <button className="text-button" onClick={() => { setStep("phone"); setCode(""); setError(""); }}>Use another number</button>
            <button className="text-button" onClick={requestOtp} disabled={busy}>Resend code</button>
          </div>
        )}

        <p className="auth-foot"><ShieldCheck size={13} /> Your number is only used to secure your place in queues.</p>
      </div>
    </main>
  );
}
