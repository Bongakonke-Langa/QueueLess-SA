"use client";
import { useEffect, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import QRCode from "qrcode";
import { Download, Printer, QrCode } from "lucide-react";
import type { Business } from "./model";

export default function Poster({ business }: { business: Business }) {
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  const [printing, setPrinting] = useState(false);
  function printPoster() {
    flushSync(() => setPrinting(true));
    window.addEventListener("afterprint", () => setPrinting(false), {
      once: true,
    });
    window.print();
  }
  useEffect(() => {
    let valid = true;
    const link = new URL("/join/" + business.slug, window.location.origin).href;
    setQr("");
    setError(false);
    setUrl(link);
    QRCode.toString(link, {
      type: "svg",
      width: 512,
      margin: 4,
      errorCorrectionLevel: "M",
      color: { dark: "#103d32", light: "#ffffff" },
    })
      .then((s) => {
        if (valid)
          setQr("data:image/svg+xml;charset=utf-8," + encodeURIComponent(s));
      })
      .catch(() => {
        if (valid) setError(true);
      });
    return () => {
      valid = false;
    };
  }, [business.slug]);
  return (
    <section className="q-card q-poster">
      <div className="q-card-title">
        <span className="q-section-icon">
          <QrCode size={17} />
        </span>
        <h2>Customer access</h2>
      </div>
      <p>One scan to join your queue.</p>
      <div className="q-poster-stage">
        <div className="q-paper">
          <div className="q-paper-brand">
            <img src="/icon.svg" width="16" height="16" alt="" />
            QueueLess SA
          </div>
          <strong>Scan to join</strong>
          {qr ? (
            <img
              className="q-qr"
              src={qr}
              alt={"QR code to join " + business.name}
            />
          ) : (
            <div className="q-qr">
              {error ? "QR unavailable" : "Preparing QR…"}
            </div>
          )}
          <span>{business.name}</span>
        </div>
      </div>
      <div className="q-poster-buttons">
        {qr && (
          <a
            className="q-btn q-outline"
            href={qr}
            download={business.slug + "-queue.svg"}
          >
            <Download size={15} />
            Download QR
          </a>
        )}
        <button
          className="q-icon"
          title="Print join poster"
          aria-label="Print join poster"
          disabled={!qr}
          onClick={printPoster}
        >
          <Printer size={16} />
        </button>
      </div>
      {printing &&
        createPortal(
          <div className="q-print-only">
            <h1>{business.name}</h1>
            <p>{business.location}</p>
            <h2>Scan to join our queue</h2>
            {qr && <img src={qr} alt="Join QR code" />}
            <p>No account needed. Keep your ticket open for live updates.</p>
            <p>{url}</p>
          </div>,
          document.body,
        )}
    </section>
  );
}
