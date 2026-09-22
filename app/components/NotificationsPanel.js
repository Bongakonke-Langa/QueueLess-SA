"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, LocateFixed, X } from "lucide-react";
import { relativeTime } from "../lib/queue";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

export default function NotificationsPanel({ notifications, onClose, onClear, soundEnabled }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Dialog
      layerClassName="notification-layer"
      sectionClassName="notification-panel"
      sectionId="notifications-panel"
      labelledBy="notifications-title"
      onClose={onClose}
    >
      <header className="notification-panel-header">
        <div>
          <span className="notification-kicker"><BellRing size={15} /> {soundEnabled ? "Sound on" : "Sound muted"}</span>
          <h2 id="notifications-title">Notifications</h2>
        </div>
        <IconButton label="Close notifications" onClick={onClose}><X size={19} /></IconButton>
      </header>
      <div className="notification-list">
        {notifications.length ? notifications.map((notification) => {
          const NotificationIcon = notification.type === "location" ? LocateFixed : BellRing;
          return (
            <article key={notification.id} className={`notification-item ${notification.read ? "" : "unread"}`}>
              <span className="notification-item-icon"><NotificationIcon size={18} /></span>
              <div><strong>{notification.title}</strong><p>{notification.body}</p><small>{relativeTime(notification.createdAt, now)}</small></div>
              {!notification.read && <i aria-label="Unread" />}
            </article>
          );
        }) : (
          <div className="notification-empty"><Bell size={25} /><strong>You’re all caught up</strong><span>New queue alerts will appear here.</span></div>
        )}
      </div>
      {notifications.length > 0 && <button className="notification-clear" onClick={onClear}>Clear notifications</button>}
    </Dialog>
  );
}
