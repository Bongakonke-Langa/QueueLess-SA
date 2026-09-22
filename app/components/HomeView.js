"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  Smartphone,
  X,
  Zap,
} from "lucide-react";
import { categories, searchRadiusKm } from "../lib/data";
import { formatSavedDuration, withLiveDistance } from "../lib/queue";
import { Tabs, TabsList, TabsTab } from "./ui/tabs";
import BranchCard from "./BranchCard";
import LocationStatusPanel from "./LocationStatusPanel";
import ServiceMap from "./ServiceMap";
import { IconButton } from "./ui";

export default function HomeView({ branchList, onChooseBranch, ticket, appointment, onOpenTicket, onRequestLocation, onPauseLocation, onOpenAreaSearch, onOpenLowData, onOpenStaff, locationStatus, userLocation, searchArea, searchOrigin, profile, savedMinutes, role, lowDataMode }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const now = new Date();
  const todayLabel = now.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const nearbyBranches = useMemo(
    () => branchList
      .map((branch) => withLiveDistance(branch, searchOrigin))
      .filter((branch) => branch.distance <= searchRadiusKm),
    [branchList, searchOrigin],
  );

  const visibleBranches = useMemo(() => nearbyBranches.filter((branch) => {
    const matchesCategory = category === "all" || branch.type === category;
    const text = `${branch.name} ${branch.address} ${branch.shortType}`.toLowerCase();
    return matchesCategory && text.includes(search.toLowerCase());
  }), [category, nearbyBranches, search]);

  const sortedBranches = useMemo(
    () => visibleBranches.slice().sort((a, b) => a.wait - b.wait),
    [visibleBranches],
  );
  const displayedBranches = showAll || category !== "all" || search
    ? sortedBranches
    : sortedBranches.slice(0, 3);

  useEffect(() => {
    setCategory("all");
    setSearch("");
    setShowAll(false);
    setSelectedId(null);
  }, [searchArea.id]);

  function choose(branch) {
    setSelectedId(branch.id);
    onChooseBranch(branch);
  }

  return (
    <main className="home-view view-enter">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">{todayLabel}</p>
          <h1>{greeting}, {profile.name.split(/\s+/)[0] || "there"}.</h1>
          <p>{onOpenStaff ? "You're viewing the citizen app — your branch console stays one tap away." : "Where do you need to be served today?"}</p>
        </div>
        <div className="welcome-actions">
          {onOpenStaff && <button className="staff-demo-button" onClick={onOpenStaff}><Building2 size={17} /><span><strong>Branch console</strong><small>Run a live branch</small></span></button>}
          {!onOpenStaff && (
            <div className="time-saved">
              <span><Zap size={18} /></span>
              <div><strong>{formatSavedDuration(savedMinutes || 0)}</strong><small>time saved in your visits</small></div>
            </div>
          )}
        </div>
      </section>

      {ticket && (
        <button className="active-queue-banner" onClick={onOpenTicket}>
          <span className="banner-pulse"><span /></span>
          <span className="banner-copy"><small>ACTIVE QUEUE · {ticket.code}</small><strong>{ticket.branch.name}</strong></span>
          <span className="banner-stat"><b>{ticket.status === "CALLED" ? "Next" : ticket.status === "SERVING" ? "Now" : Math.max(ticket.ahead, 0)}</b> ahead</span>
          <ArrowRight size={20} />
        </button>
      )}

      {appointment && !ticket && (
        <div className="appointment-banner">
          <span><CalendarDays size={20} /></span>
          <div><small>UPCOMING APPOINTMENT</small><strong>{appointment.branch.name}</strong><span>{new Date(appointment.slotAt).toLocaleDateString("en-ZA", { weekday: "long" })} at {new Date(appointment.slotAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })} · {appointment.service}</span></div>
          <BadgeCheck size={20} />
        </div>
      )}

      <button className="search-area-summary" onClick={onOpenAreaSearch} aria-label={`Change service search area from ${searchArea.label}`}>
        <span className="search-area-icon"><MapPin size={21} /></span>
        <span className="search-area-copy"><small>SEARCH AREA</small><strong>{searchArea.label}</strong><span>{searchArea.secondary}</span></span>
        <span className="search-area-count"><strong>{nearbyBranches.length}</strong><small>centres within {searchRadiusKm} km</small></span>
        <ChevronDown size={19} />
      </button>

      <section className="dashboard-toolbar" aria-label="Find a service centre">
        <div className="search-row">
          <label className="search-box">
            <Search size={20} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a branch or service"
              aria-label="Search a branch or service"
            />
            {search && <IconButton label="Clear search" onClick={() => setSearch("")}><X size={18} /></IconButton>}
          </label>
          <IconButton
            label={locationStatus === "live" ? "Precise location is active" : "Use my precise location"}
            className={`current-location ${locationStatus}`}
            onClick={onRequestLocation}
          >
            {locationStatus === "live" ? <LocateFixed size={20} /> : <Navigation size={20} />}
          </IconButton>
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="category-tabs" aria-label="Service types">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTab key={item.id} value={item.id}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </TabsTab>
              );
            })}
          </TabsList>
        </Tabs>
      </section>

      <LocationStatusPanel
        locationStatus={locationStatus}
        userLocation={userLocation}
        onRequestLocation={onRequestLocation}
        onPauseLocation={onPauseLocation}
      />

      <button className="low-data-band" onClick={onOpenLowData}>
        <span><Smartphone size={20} /></span>
        <span><strong>No mobile data?</strong><small>Join and check queues by SMS, WhatsApp or USSD</small></span>
        <ChevronRight size={18} />
      </button>

      <section className={`discovery-layout${lowDataMode ? " low-data" : ""}`}>
        {!lowDataMode && (
        <ServiceMap
          visibleBranches={visibleBranches}
          selectedId={selectedId}
          onSelect={choose}
          onRequestLocation={onRequestLocation}
          locationStatus={locationStatus}
          userLocation={userLocation}
          searchArea={searchArea}
        />
        )}
        {lowDataMode && (
          <div className="low-data-map-note" role="note">
            <strong>Low-data mode is on</strong>
            <span>Map hidden to save data — all {visibleBranches.length} centres listed below. Turn it off in Profile → App settings.</span>
          </div>
        )}
        <div className="branch-list-wrap">
          <div className="section-heading">
            <div>
              <h2>{nearbyBranches.length ? `Best options near ${searchArea.label}` : `Search area: ${searchArea.label}`}</h2>
              <p>{nearbyBranches.length ? `Staff-verified data · within ${searchRadiusKm} km · shortest wait first` : "Location updated successfully · demo branch coverage is not available here yet"}</p>
            </div>
            {category === "all" && !search && sortedBranches.length > 3 && (
              <button className="text-button" onClick={() => setShowAll((current) => !current)}>
                {showAll ? "Show best 3" : "See all"} <ArrowRight size={16} />
              </button>
            )}
          </div>
          <div className="branch-list" id="branch-list">
            {displayedBranches.length ? displayedBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                selected={selectedId === branch.id}
                onSelect={choose}
              />
            )) : nearbyBranches.length === 0 ? (
              <div className="empty-state coverage-empty" aria-live="polite"><MapPin size={26} /><strong>Area updated successfully</strong><span>We found {searchArea.label}, but the prototype network has no service centres within {searchRadiusKm} km. Choose a supported demo area to continue.</span><button onClick={onOpenAreaSearch}>Choose a covered area</button></div>
            ) : (
              <div className="empty-state"><Search size={26} /><strong>No centres found here</strong><span>Try another service type or change the search area.</span><button onClick={onOpenAreaSearch}>Change search area</button></div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
