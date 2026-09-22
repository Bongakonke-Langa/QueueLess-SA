"use client";

import { ChevronRight, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { navItems } from "../lib/data";
import { AvatarContent, Brand, IconButton } from "./ui";

export default function AppNavigation({ view, onNavigate, hasTicket, profile, collapsed, onToggleCollapse, role }) {
  // Branch users see their console first; citizens keep the standard order.
  const visibleNavItems = navItems
    .filter((item) => !item.roles || item.roles.includes(role))
    .sort((a, b) => (b.roles ? 1 : 0) - (a.roles ? 1 : 0));
  const bottomNavItems = visibleNavItems.slice(0, 5);
  return (
    <>
      <aside className={`side-nav ${collapsed ? "collapsed" : ""}`}>
        <div className="side-nav-header">
          <Brand />
          <IconButton
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </IconButton>
        </div>
        <nav aria-label="Main navigation">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
                {item.id === "ticket" && hasTicket && <i />}
              </button>
            );
          })}
        </nav>
        <div className="side-impact">
          <Sparkles size={18} />
          <strong>Save your time</strong>
          <span>Plan the wait. Live your day.</span>
        </div>
        <button className="account-mini" onClick={() => onNavigate("profile")}>
          <span className="avatar"><AvatarContent profile={profile} /></span>
          <span><strong>{profile.name}</strong><small>{profile.city}</small></span>
          <ChevronRight size={17} />
        </button>
      </aside>

      <nav className="bottom-nav" aria-label="Main navigation">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon"><Icon size={21} />{item.id === "ticket" && hasTicket && <i />}</span>
              <span>{item.mobileLabel || item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
