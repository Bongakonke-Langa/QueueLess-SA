"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  BellRing,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  Footprints,
  HeartPulse,
  History,
  Home,
  Landmark,
  LocateFixed,
  MapPin,
  MessageSquare,
  Minus,
  Navigation,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  PhoneCall,
  Play,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";

const categories = [
  { id: "all", label: "All services", icon: Compass },
  { id: "home-affairs", label: "Home Affairs", icon: Landmark },
  { id: "clinic", label: "Clinics", icon: HeartPulse },
  { id: "bank", label: "Banks", icon: Banknote },
];

const serviceCatalogue = {
  "home-affairs": {
    shortType: "Home Affairs",
    closes: "15:30",
    services: [
      { name: "Smart ID application", duration: "12 min per person" },
      { name: "Passport application", duration: "15 min per person" },
      { name: "Document collection", duration: "5 min per person" },
    ],
  },
  clinic: {
    shortType: "Public clinic",
    closes: "16:00",
    services: [
      { name: "General consultation", duration: "10 min per person" },
      { name: "Medication collection", duration: "4 min per person" },
      { name: "Immunisation", duration: "8 min per person" },
    ],
  },
  bank: {
    shortType: "Bank branch",
    closes: "15:30",
    services: [
      { name: "Account services", duration: "10 min per person" },
      { name: "Card collection", duration: "5 min per person" },
      { name: "Consultant appointment", duration: "15 min per person" },
    ],
  },
};

function createBranch(branch) {
  return {
    distance: 0,
    travel: 3,
    status: branch.wait <= 20 ? "Low wait" : branch.wait <= 35 ? "Moderate" : "Busy now",
    accent: branch.type === "clinic" ? "coral" : branch.type === "bank" ? "blue" : branch.wait > 35 ? "gold" : "teal",
    counters: branch.type === "home-affairs" ? 5 : 4,
    capacity: branch.type === "home-affairs" ? 45 : 32,
    virtualJoins: true,
    operationalStatus: "open",
    graceMinutes: 10,
    oneTicket: true,
    autoRelease: true,
    priorityAccess: branch.type === "clinic",
    updatedMinutes: (branch.id % 5) + 1,
    dataSource: "Branch staff",
    servedToday: 64 + (branch.id * 3),
    unavailableServices: [],
    ...serviceCatalogue[branch.type],
    ...branch,
  };
}

const branches = [
  createBranch({ id: 1, type: "home-affairs", name: "Randburg Home Affairs", address: "Malibongwe Drive, Randburg", latitude: -26.0903016, longitude: 27.9816209, wait: 18, people: 12 }),
  createBranch({ id: 2, type: "clinic", name: "Ferndale Community Clinic", address: "Oxford Street, Ferndale", latitude: -26.0954, longitude: 28.0032, wait: 11, people: 7, status: "Moving fast" }),
  createBranch({ id: 3, type: "bank", name: "Ubuntu Bank Rosebank", address: "Cradock Avenue, Rosebank", latitude: -26.1459, longitude: 28.0416, wait: 26, people: 19 }),
  createBranch({ id: 4, type: "home-affairs", name: "Johannesburg Home Affairs", address: "Harrison Street, Marshalltown", latitude: -26.2041, longitude: 28.0416, wait: 54, people: 41 }),
  createBranch({ id: 5, type: "home-affairs", name: "Sandton Civic Services", address: "Rivonia Road, Sandton", latitude: -26.1072, longitude: 28.0562, wait: 22, people: 15 }),
  createBranch({ id: 6, type: "clinic", name: "Sandton Community Clinic", address: "Benmore Road, Sandton", latitude: -26.1041, longitude: 28.0438, wait: 14, people: 9 }),
  createBranch({ id: 7, type: "bank", name: "Ubuntu Bank Sandton", address: "Maude Street, Sandton", latitude: -26.1087, longitude: 28.0578, wait: 9, people: 5, status: "Moving fast" }),
  createBranch({ id: 8, type: "home-affairs", name: "Orlando Home Affairs", address: "Mooki Street, Orlando East", latitude: -26.2328, longitude: 27.9233, wait: 31, people: 23 }),
  createBranch({ id: 9, type: "clinic", name: "Chiawelo Community Clinic", address: "Chris Hani Road, Soweto", latitude: -26.2786, longitude: 27.8502, wait: 17, people: 11 }),
  createBranch({ id: 10, type: "bank", name: "Ubuntu Bank Maponya", address: "Chris Hani Road, Klipspruit", latitude: -26.2581, longitude: 27.9028, wait: 13, people: 8 }),
  createBranch({ id: 11, type: "home-affairs", name: "Pretoria Home Affairs", address: "Sophie de Bruyn Street, Pretoria", latitude: -25.7538, longitude: 28.1877, wait: 29, people: 20 }),
  createBranch({ id: 12, type: "clinic", name: "Tshwane Central Clinic", address: "Sisulu Street, Pretoria", latitude: -25.7472, longitude: 28.2011, wait: 16, people: 10 }),
  createBranch({ id: 13, type: "bank", name: "Ubuntu Bank Church Square", address: "Church Square, Pretoria", latitude: -25.7463, longitude: 28.1881, wait: 12, people: 7 }),
  createBranch({ id: 14, type: "home-affairs", name: "Cape Town Home Affairs", address: "Barrack Street, Cape Town", latitude: -33.9266, longitude: 18.4232, wait: 38, people: 28 }),
  createBranch({ id: 15, type: "clinic", name: "Cape Town Civic Clinic", address: "Buitenkant Street, Cape Town", latitude: -33.9285, longitude: 18.4257, wait: 15, people: 9 }),
  createBranch({ id: 16, type: "bank", name: "Ubuntu Bank Adderley", address: "Adderley Street, Cape Town", latitude: -33.9228, longitude: 18.4226, wait: 19, people: 12 }),
  createBranch({ id: 17, type: "home-affairs", name: "Durban Home Affairs", address: "Commercial Road, Durban Central", latitude: -29.8574, longitude: 31.0244, wait: 34, people: 25 }),
  createBranch({ id: 18, type: "clinic", name: "Warwick Community Clinic", address: "Warwick Avenue, Durban", latitude: -29.8589, longitude: 31.0149, wait: 10, people: 6 }),
  createBranch({ id: 19, type: "bank", name: "Ubuntu Bank Durban Central", address: "Smith Street, Durban", latitude: -29.8597, longitude: 31.0252, wait: 21, people: 14 }),
  createBranch({ id: 20, type: "home-affairs", name: "Gqeberha Home Affairs", address: "Govan Mbeki Avenue, Gqeberha", latitude: -33.9594, longitude: 25.6024, wait: 24, people: 17 }),
  createBranch({ id: 21, type: "clinic", name: "Central Community Clinic", address: "Rink Street, Gqeberha", latitude: -33.9632, longitude: 25.6105, wait: 12, people: 8 }),
  createBranch({ id: 22, type: "bank", name: "Ubuntu Bank Gqeberha", address: "Market Square, Gqeberha", latitude: -33.9617, longitude: 25.6191, wait: 18, people: 11 }),
];

const searchRadiusKm = 35;
const defaultSearchArea = {
  id: "default-johannesburg",
  label: "Johannesburg",
  secondary: "Gauteng, South Africa",
  latitude: -26.2041,
  longitude: 28.0473,
  source: "default",
};

const popularSearchAreas = [
  { id: "preset-randburg", label: "Randburg", secondary: "Gauteng, South Africa", latitude: -26.0936, longitude: 28.0064, source: "preset" },
  { id: "preset-sandton", label: "Sandton", secondary: "Gauteng, South Africa", latitude: -26.1076, longitude: 28.0567, source: "preset" },
  { id: "preset-soweto", label: "Soweto", secondary: "Gauteng, South Africa", latitude: -26.2485, longitude: 27.854, source: "preset" },
  { id: "preset-pretoria", label: "Pretoria", secondary: "Gauteng, South Africa", latitude: -25.7479, longitude: 28.2293, source: "preset" },
  { id: "preset-cape-town", label: "Cape Town", secondary: "Western Cape, South Africa", latitude: -33.9249, longitude: 18.4241, source: "preset" },
  { id: "preset-durban", label: "Durban", secondary: "KwaZulu-Natal, South Africa", latitude: -29.8587, longitude: 31.0218, source: "preset" },
];

const queueSteps = [
  { ahead: 12, wait: 18, message: "You are in the queue" },
  { ahead: 7, wait: 12, message: "The queue is moving quickly" },
  { ahead: 3, wait: 6, message: "Time to head to the branch" },
  { ahead: 1, wait: 2, message: "You are next. Check in now" },
];

const navItems = [
  { id: "home", label: "Explore", icon: Home },
  { id: "ticket", label: "My queue", icon: Ticket },
  { id: "activity", label: "Activity", icon: History },
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "staff", label: "Staff demo", mobileLabel: "Staff", icon: Building2 },
];

const initialNotifications = [
  {
    id: "low-wait",
    title: "Short queue nearby",
    body: "Ferndale Community Clinic is down to an 11 minute wait.",
    time: "8 min ago",
    type: "queue",
    read: false,
  },
  {
    id: "welcome",
    title: "Welcome to QueueLess SA",
    body: "We’ll keep watch while you get on with your day.",
    time: "Today",
    type: "info",
    read: true,
  },
];

const defaultProfile = {
  name: "Bonga M.",
  phone: "082 555 0142",
  city: "Johannesburg",
  province: "Gauteng",
  avatar: "",
};

const defaultAppSettings = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
};

const demoLocation = {
  latitude: -26.1048,
  longitude: 28.0017,
  accuracy: 250,
  updatedAt: null,
  source: "demo",
};

function distanceBetween(latitudeA, longitudeA, latitudeB, longitudeB) {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB))
    * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function withLiveDistance(branch, userLocation) {
  if (!userLocation) return branch;
  const distance = distanceBetween(
    userLocation.latitude,
    userLocation.longitude,
    branch.latitude,
    branch.longitude,
  );
  return {
    ...branch,
    distance: Number(distance.toFixed(1)),
    travel: Math.max(3, Math.round(distance * 2.1)),
  };
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "QL";
}

function AvatarContent({ profile }) {
  return profile.avatar
    ? <img className="avatar-photo" src={profile.avatar} alt="" />
    : getInitials(profile.name);
}

function Brand() {
  return (
    <div className="brand" aria-label="QueueLess SA">
      <span className="brand-mark"><span>Q</span></span>
      <span className="brand-name">QueueLess <b>SA</b></span>
    </div>
  );
}

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

function AppNavigation({ view, onNavigate, hasTicket, profile, collapsed, onToggleCollapse }) {
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
          {navItems.map((item) => {
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
        {navItems.map((item) => {
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

function TopBar({
  onProfile,
  onNotifications,
  onRequestLocation,
  unreadCount,
  notificationsOpen,
  locationStatus,
  userLocation,
  profile,
}) {
  const hasPosition = Boolean(userLocation);
  const isLive = locationStatus === "live" && hasPosition;
  const locationText = hasPosition
    ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
    : locationStatus === "requesting" ? "Locating…" : "Johannesburg";
  const locationEyebrow = isLive
    ? `Live GPS · ±${Math.round(userLocation.accuracy)} m`
    : userLocation?.source === "demo" ? "Demo position"
    : hasPosition ? "Last known position"
    : locationStatus === "denied" ? "Location off" : "Near";

  return (
    <header className="top-bar">
      <div className="mobile-brand"><Brand /></div>
      <button
        className={`location-button ${locationStatus}`}
        onClick={onRequestLocation}
        aria-label={isLive ? `Live location ${locationText}` : hasPosition ? `${locationEyebrow}, ${locationText}. Try precise location` : "Use my precise location"}
      >
        <LocateFixed size={17} />
        <span><small>{locationEyebrow}</small>{locationText}</span>
        {isLive ? <BadgeCheck size={16} /> : <ChevronDown size={16} />}
      </button>
      <div className="top-actions">
        <IconButton
          label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className={unreadCount ? "has-dot" : ""}
          onClick={onNotifications}
          aria-expanded={notificationsOpen}
          aria-controls="notifications-panel"
        >
          <Bell size={20} />
        </IconButton>
        <button className="top-profile" onClick={onProfile} aria-label="Open profile"><AvatarContent profile={profile} /></button>
      </div>
    </header>
  );
}

function NotificationsPanel({ notifications, onClose, onClear, soundEnabled }) {
  return (
    <div className="notification-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section id="notifications-panel" className="notification-panel" role="dialog" aria-modal="true" aria-labelledby="notifications-title">
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
                <div><strong>{notification.title}</strong><p>{notification.body}</p><small>{notification.time}</small></div>
                {!notification.read && <i aria-label="Unread" />}
              </article>
            );
          }) : (
            <div className="notification-empty"><Bell size={25} /><strong>You’re all caught up</strong><span>New queue alerts will appear here.</span></div>
          )}
        </div>
        {notifications.length > 0 && <button className="notification-clear" onClick={onClear}>Clear notifications</button>}
      </section>
    </div>
  );
}

function branchesNear(location, branchList = branches) {
  if (!location) return [];
  return branchList.filter((branch) => distanceBetween(
    location.latitude,
    location.longitude,
    branch.latitude,
    branch.longitude,
  ) <= searchRadiusKm);
}

function formatBranchFreshness(branch, now = Date.now()) {
  if (branch.updatedAt) {
    const minutes = Math.max(0, Math.floor((now - branch.updatedAt) / 60000));
    if (minutes === 0) return "just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} min ago`;
  }
  return `${branch.updatedMinutes || 1} min ago`;
}

function branchJoinState(branch) {
  if (branch.operationalStatus === "closed") return { canJoin: false, reason: "Branch closed", detail: "Book a time or choose another centre." };
  if (branch.operationalStatus === "paused") return { canJoin: false, reason: "Virtual queue paused", detail: "The branch is clearing its current queue." };
  if (!branch.virtualJoins) return { canJoin: false, reason: "Online joins are paused", detail: "Book a time or use a nearby branch." };
  if (branch.people >= branch.capacity) return { canJoin: false, reason: "Queue at capacity", detail: "Choose an appointment or a quieter branch." };
  return { canJoin: true, reason: "Open for virtual joins", detail: `${Math.max(branch.capacity - branch.people, 0)} places available` };
}

function formatSearchTime(timestamp) {
  if (!timestamp) return "Recently";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function SearchAreaDialog({ currentArea, recentLocations, userLocation, locationStatus, branchList, onClose, onSelect, onUseMyLocation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  async function searchLocation(event) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setMessage("Enter at least two characters, such as Sandton or 2001.");
      setSearchStatus("error");
      return;
    }

    setSearchStatus("loading");
    setMessage("");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(trimmedQuery)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Location search is unavailable.");
      const nextResults = payload.results || [];
      setResults(nextResults);
      setSearchStatus("ready");
      setMessage(nextResults.length
        ? "Location found. Select a result below to update the map and nearby services."
        : "No South African locations matched that search. Try a suburb, town or postcode.");
      if (nextResults.length) {
        window.requestAnimationFrame(() => searchResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      }
    } catch (error) {
      setResults([]);
      setSearchStatus("error");
      setMessage(error.message || "Location search needs an internet connection. You can still use a popular area below.");
    }
  }

  return (
    <div className="sheet-layer area-search-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="area-search-dialog" role="dialog" aria-modal="true" aria-labelledby="area-search-title">
        <header className="area-search-header">
          <div><p className="eyebrow">LIVE LOCATION SEARCH</p><h2 id="area-search-title">Change search area</h2></div>
          <IconButton label="Close location search" onClick={onClose}><X size={19} /></IconButton>
        </header>

        <div className="current-search-area">
          <span><MapPin size={21} /></span>
          <div><small>SEARCHING NOW</small><strong>{currentArea.label}</strong><span>{currentArea.secondary}</span></div>
          <b>{branchesNear(currentArea, branchList).length} centres</b>
        </div>

        <form className="area-search-form" onSubmit={searchLocation}>
          <label htmlFor="area-query">Suburb, town, address or postcode</label>
          <div>
            <Search size={20} />
            <input
              ref={searchInputRef}
              id="area-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Sandton or Cape Town"
              autoComplete="street-address"
            />
            <button type="submit" disabled={searchStatus === "loading"}>
              {searchStatus === "loading" ? <LocateFixed size={18} /> : <ArrowRight size={18} />}
              <span>{searchStatus === "loading" ? "Searching" : "Search"}</span>
            </button>
          </div>
        </form>

        <button className={`use-position-button ${locationStatus}`} onClick={onUseMyLocation}>
          <LocateFixed size={20} />
          <span><strong>Search around my position</strong><small>{userLocation ? `${userLocation.source === "gps" ? "GPS" : "Demo"} position available` : "Uses precise GPS when permission is allowed"}</small></span>
          <ChevronRight size={18} />
        </button>

        <div className="area-results" ref={searchResultsRef} aria-live="polite">
          {message && <p className={`area-search-message ${searchStatus}`}>{message}</p>}
          {results.map((result) => (
            <button key={result.id} onClick={() => onSelect({ ...result, source: "geocoding" })}>
              <span className="area-result-icon"><MapPin size={19} /></span>
              <span><strong>{result.label}</strong><small>{result.secondary}</small></span>
              <b>{branchesNear(result, branchList).length ? `${branchesNear(result, branchList).length} centres` : "No demo centres"}</b>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>

        <section className="popular-areas">
          <div><h3>Popular areas</h3><small>Reliable choices for the live demo</small></div>
          <div className="popular-area-grid">
            {popularSearchAreas.map((area) => (
              <button key={area.id} className={currentArea.id === area.id ? "active" : ""} onClick={() => onSelect(area)}>
                <MapPin size={16} /><span><strong>{area.label}</strong><small>{branchesNear(area, branchList).length} centres</small></span>
              </button>
            ))}
          </div>
        </section>

        {recentLocations.length > 0 && (
          <section className="area-recent">
            <div><h3>Recent searches</h3><small>Saved on this device</small></div>
            {recentLocations.slice(0, 3).map((area) => (
              <button key={area.historyId} onClick={() => onSelect(area)}>
                <History size={17} /><span><strong>{area.label}</strong><small>{formatSearchTime(area.timestamp)}</small></span><ChevronRight size={17} />
              </button>
            ))}
          </section>
        )}

        <p className="geocoding-credit"><ShieldCheck size={14} /><span>Search results by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Searches run only when you press Search.</span></p>
      </section>
    </div>
  );
}

function ServiceMap({ visibleBranches, selectedId, onSelect, onRequestLocation, locationStatus, userLocation, searchArea }) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);
  const branchLayerRef = useRef(null);
  const userLayerRef = useRef(null);
  const searchLayerRef = useRef(null);
  const centredLocationSourceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [tileStatus, setTileStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function initialiseMap() {
      const leafletModule = await import("leaflet");
      if (cancelled || !mapElementRef.current || mapInstanceRef.current) return;
      const L = leafletModule.default;
      leafletRef.current = L;

      const map = L.map(mapElementRef.current, {
        zoomControl: false,
        minZoom: 9,
        maxZoom: 19,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      tiles.on("load", () => setTileStatus("ready"));
      tiles.on("tileerror", () => setTileStatus((current) => current === "loading" ? "error" : current));
      tiles.addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.setView([defaultSearchArea.latitude, defaultSearchArea.longitude], 11);
      map.whenReady(() => {
        window.setTimeout(() => map.invalidateSize({ pan: false }), 120);
        setMapReady(true);
      });
    }

    initialiseMap();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !L) return;

    if (branchLayerRef.current) branchLayerRef.current.remove();
    const branchLayer = L.layerGroup().addTo(map);
    branchLayerRef.current = branchLayer;

    visibleBranches.forEach((branch) => {
      const markerContent = document.createElement("div");
      markerContent.className = `queue-map-pin ${branch.accent} ${selectedId === branch.id ? "selected" : ""}`;
      const abbreviation = document.createElement("span");
      abbreviation.className = "queue-map-pin-type";
      abbreviation.textContent = branch.type === "home-affairs" ? "HA" : branch.type === "clinic" ? "CL" : "BK";
      const wait = document.createElement("span");
      wait.className = "queue-map-pin-wait";
      wait.textContent = `${branch.wait} min`;
      markerContent.append(abbreviation, wait);

      const icon = L.divIcon({
        className: "queue-map-marker",
        html: markerContent,
        iconSize: [78, 46],
        iconAnchor: [39, 46],
        popupAnchor: [0, -42],
      });

      const popup = document.createElement("div");
      popup.className = "queue-map-popup";
      const eyebrow = document.createElement("span");
      eyebrow.className = "queue-map-popup-eyebrow";
      eyebrow.textContent = `${branch.shortType} · ${branch.distance} km away`;
      const title = document.createElement("strong");
      title.textContent = branch.name;
      const address = document.createElement("span");
      address.className = "queue-map-popup-address";
      address.textContent = branch.address;
      const details = document.createElement("div");
      details.className = "queue-map-popup-details";
      const waitDetail = document.createElement("span");
      waitDetail.textContent = `${branch.wait} min wait`;
      const peopleDetail = document.createElement("span");
      peopleDetail.textContent = `${branch.people} people waiting`;
      const verifiedDetail = document.createElement("span");
      verifiedDetail.textContent = `Verified ${formatBranchFreshness(branch)}`;
      details.append(waitDetail, peopleDetail, verifiedDetail);
      const viewButton = document.createElement("button");
      viewButton.type = "button";
      viewButton.textContent = "View branch and join";
      viewButton.addEventListener("click", () => onSelect(branch));
      popup.append(eyebrow, title, address, details, viewButton);

      L.marker([branch.latitude, branch.longitude], {
        icon,
        keyboard: true,
        riseOnHover: true,
        alt: `${branch.name}, ${branch.wait} minute wait`,
      }).bindPopup(popup, { minWidth: 230, maxWidth: 270 }).addTo(branchLayer);
    });

    const mapPoints = [
      [searchArea.latitude, searchArea.longitude],
      ...visibleBranches.map((branch) => [branch.latitude, branch.longitude]),
    ];
    if (mapPoints.length === 1) {
      map.flyTo(mapPoints[0], 13, { duration: 0.65 });
    } else {
      map.fitBounds(L.latLngBounds(mapPoints), { padding: [54, 54], maxZoom: visibleBranches.length === 1 ? 14 : 12 });
    }
  }, [mapReady, onSelect, searchArea.id, searchArea.latitude, searchArea.longitude, selectedId, visibleBranches]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !L) return;

    if (userLayerRef.current) userLayerRef.current.remove();
    if (!userLocation) return;

    const userLayer = L.layerGroup().addTo(map);
    userLayerRef.current = userLayer;
    const coordinates = [userLocation.latitude, userLocation.longitude];
    const isLiveLocation = locationStatus === "live";
    const isDemoLocation = userLocation.source === "demo";
    L.circle(coordinates, {
      radius: Math.max(userLocation.accuracy, 20),
      color: isDemoLocation ? "#987119" : "#2879d0",
      weight: 2,
      fillColor: isDemoLocation ? "#d9b64e" : "#70a9e5",
      fillOpacity: 0.16,
      interactive: false,
    }).addTo(userLayer);

    const userMarker = document.createElement("div");
    userMarker.className = `queue-user-pin-wrap ${isDemoLocation ? "demo" : isLiveLocation ? "live" : "last-known"}`;
    const userPin = document.createElement("div");
    userPin.className = "queue-user-pin";
    const userPinCore = document.createElement("span");
    userPin.append(userPinCore);
    const userLabel = document.createElement("span");
    userLabel.className = "queue-user-pin-label";
    userLabel.textContent = isDemoLocation ? "Demo position" : isLiveLocation ? "You are here" : "Last location";
    userMarker.append(userPin, userLabel);
    const userIcon = L.divIcon({
      className: "queue-user-marker",
      html: userMarker,
      iconSize: [132, 44],
      iconAnchor: [17, 22],
      popupAnchor: [0, -24],
    });
    const userPopup = document.createElement("span");
    userPopup.textContent = isDemoLocation
      ? "Demo position for the prototype. Enable GPS to show your precise location."
      : `${isLiveLocation ? "Your live location" : "Your last known location"} · accurate to about ${Math.round(userLocation.accuracy)} metres`;
    L.marker(coordinates, {
      icon: userIcon,
      keyboard: true,
      zIndexOffset: 1000,
      alt: isDemoLocation ? "Demo position" : isLiveLocation ? "Your live location" : "Your last known location",
    }).bindPopup(userPopup).addTo(userLayer);

    if (searchArea.source === "gps" && centredLocationSourceRef.current !== userLocation.source) {
      centredLocationSourceRef.current = userLocation.source;
      map.flyTo(coordinates, 14, { duration: 0.7 });
    }
  }, [locationStatus, mapReady, searchArea.source, userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !L || !searchArea) return;

    if (searchLayerRef.current) searchLayerRef.current.remove();
    const searchLayer = L.layerGroup().addTo(map);
    searchLayerRef.current = searchLayer;
    const coordinates = [searchArea.latitude, searchArea.longitude];

    L.circle(coordinates, {
      radius: 1100,
      color: "#9a741c",
      weight: 2,
      dashArray: "6 6",
      fillColor: "#e5b641",
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(searchLayer);

    const markerContent = document.createElement("div");
    markerContent.className = "queue-search-pin";
    const markerDot = document.createElement("span");
    const markerLabel = document.createElement("strong");
    markerLabel.textContent = "Searching here";
    markerContent.append(markerDot, markerLabel);
    const icon = L.divIcon({
      className: "queue-search-marker",
      html: markerContent,
      iconSize: [116, 34],
      iconAnchor: [13, 17],
    });
    L.marker(coordinates, {
      icon,
      keyboard: true,
      zIndexOffset: 900,
      alt: `Service search centred on ${searchArea.label}`,
    }).bindPopup(`Searching for services within ${searchRadiusKm} km of ${searchArea.label}`).addTo(searchLayer);
  }, [mapReady, searchArea]);

  function handleMapLocation() {
    const map = mapInstanceRef.current;
    if (map && userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration: 0.65 });
      return;
    }
    onRequestLocation();
  }

  const mapLocationLabel = locationStatus === "live"
    ? "Live and updating"
    : userLocation?.source === "demo"
      ? "Demo position shown"
      : userLocation
        ? "Last position shown"
        : locationStatus === "denied"
          ? "Permission is off"
          : locationStatus === "requesting"
            ? "Finding your position"
            : "Show me on the map";

  return (
    <div className="service-map" aria-label="Map showing nearby service centres">
      <div ref={mapElementRef} className="leaflet-map-canvas" />
      {tileStatus === "loading" && <div className="map-loading"><span /><strong>Loading detailed map…</strong></div>}
      {tileStatus === "error" && <div className="map-tile-warning">Map tiles need an internet connection. Branch information is still available in the list.</div>}
      <div className="map-live-legend"><span className="live-dot" /> Wait times live <i /> <span className="search-dot" /> Search area {userLocation && <><i /> <span className={`user-dot ${userLocation.source === "demo" ? "demo" : ""}`} /> {userLocation.source === "demo" ? "Demo position" : "Your position"}</>}</div>
      <button className={`map-location-control ${locationStatus}`} onClick={handleMapLocation}>
        <LocateFixed size={20} />
        <span><strong>My location</strong><small>{mapLocationLabel}</small></span>
      </button>
    </div>
  );
}

function BranchCard({ branch, selected, onSelect }) {
  const Icon = branch.type === "clinic" ? HeartPulse : branch.type === "bank" ? Banknote : Landmark;
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

function formatLocationFreshness(updatedAt, now) {
  if (!updatedAt) return "Waiting";
  const seconds = Math.max(0, Math.round((now - updatedAt) / 1000));
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

function LocationStatusPanel({ locationStatus, userLocation, onRequestLocation, onPauseLocation }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!userLocation?.updatedAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(timer);
  }, [userLocation?.updatedAt]);

  const isLive = locationStatus === "live" && userLocation?.source === "gps";
  const isDemo = userLocation?.source === "demo";
  const isPaused = locationStatus === "paused";
  const isRequesting = locationStatus === "requesting";
  const tone = isLive ? "live" : isDemo ? "demo" : isPaused ? "paused" : isRequesting ? "requesting" : "off";
  const title = isLive
    ? "Live GPS connected"
    : isDemo
      ? "Demo position active"
      : isPaused
        ? "Live GPS paused"
        : isRequesting
          ? "Finding your position"
          : "Turn on live GPS";
  const description = isLive
    ? "Distances and travel times update automatically as you move."
    : isDemo
      ? "Judging preview is using a clearly marked sample position."
      : isPaused
        ? "Your last position stays visible until tracking resumes."
        : isRequesting
          ? "Waiting for a precise reading from your device."
          : "See accurate nearby branches and know when to leave.";
  const actionLabel = isPaused
    ? "Resume live GPS"
    : isDemo
      ? "Switch to live GPS"
      : "Enable live GPS";

  return (
    <section className={`gps-status-strip ${tone}`} aria-label="Live GPS status" aria-live="polite">
      <div className="gps-status-lead">
        <span className="gps-status-icon"><LocateFixed size={22} /></span>
        <span><small>SMART LOCATION</small><strong>{title}</strong><span>{description}</span></span>
      </div>
      <div className="gps-readouts" aria-label="Location details">
        <span><small>COORDINATES</small><strong>{userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : "Not shared"}</strong></span>
        <span><small>ACCURACY</small><strong>{(isLive || isPaused) && userLocation ? `±${Math.round(userLocation.accuracy)} m` : isDemo ? "Demo" : "Waiting"}</strong></span>
        <span><small>UPDATED</small><strong>{formatLocationFreshness(userLocation?.updatedAt, now)}</strong></span>
      </div>
      {isLive ? (
        <button className="gps-action secondary-button" onClick={onPauseLocation}><Pause size={17} /> Pause sharing</button>
      ) : (
        <button className="gps-action primary-button" onClick={onRequestLocation} disabled={isRequesting}>
          {isRequesting ? <LocateFixed size={17} /> : <Play size={17} />} {isRequesting ? "Locating…" : actionLabel}
        </button>
      )}
      <p className="gps-privacy"><ShieldCheck size={14} /> Used only for nearby distances and arrival timing in this prototype.</p>
    </section>
  );
}

function HomeView({ branchList, onChooseBranch, ticket, appointment, onOpenTicket, onRequestLocation, onPauseLocation, onOpenAreaSearch, onOpenLowData, onOpenStaff, locationStatus, userLocation, searchArea, searchOrigin, profile }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [showAll, setShowAll] = useState(false);

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
          <p className="eyebrow">Friday, 7 August</p>
          <h1>Good morning, {profile.name.split(/\s+/)[0] || "there"}.</h1>
          <p>Where do you need to be served today?</p>
        </div>
        <div className="welcome-actions">
          <button className="staff-demo-button" onClick={onOpenStaff}><Building2 size={17} /><span><strong>Staff demo</strong><small>Update a live branch</small></span></button>
          <div className="time-saved">
            <span><Zap size={18} /></span>
            <div><strong>3h 24m</strong><small>time saved this month</small></div>
          </div>
        </div>
      </section>

      {ticket && (
        <button className="active-queue-banner" onClick={onOpenTicket}>
          <span className="banner-pulse"><span /></span>
          <span className="banner-copy"><small>ACTIVE QUEUE</small><strong>{ticket.branch.name}</strong></span>
          <span className="banner-stat"><b>{queueSteps[ticket.step].ahead}</b> ahead</span>
          <ArrowRight size={20} />
        </button>
      )}

      {appointment && !ticket && (
        <div className="appointment-banner">
          <span><CalendarDays size={20} /></span>
          <div><small>UPCOMING APPOINTMENT</small><strong>{appointment.branch.name}</strong><span>{appointment.dateLabel} at {appointment.time} · {appointment.service}</span></div>
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

        <div className="category-tabs" role="tablist" aria-label="Service types">
          {categories.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={category === item.id ? "active" : ""}
                onClick={() => setCategory(item.id)}
                role="tab"
                aria-selected={category === item.id}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
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

      <section className="discovery-layout">
        <ServiceMap
          visibleBranches={visibleBranches}
          selectedId={selectedId}
          onSelect={choose}
          onRequestLocation={onRequestLocation}
          locationStatus={locationStatus}
          userLocation={userLocation}
          searchArea={searchArea}
        />
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

function BranchSheet({ branch, initialService, onClose, onContinue, onFallback }) {
  const availableServices = branch.services.filter((service) => !branch.unavailableServices.includes(service.name));
  const [selectedService, setSelectedService] = useState(initialService && !branch.unavailableServices.includes(initialService) ? initialService : availableServices[0]?.name || "");
  const BranchIcon = branch.type === "clinic" ? HeartPulse : branch.type === "bank" ? Banknote : Landmark;
  const joinState = branchJoinState(branch);

  return (
    <div className="sheet-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="branch-sheet" role="dialog" aria-modal="true" aria-labelledby="branch-title">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <IconButton label="Close branch details" onClick={onClose}><X size={20} /></IconButton>
          <span className="verified"><BadgeCheck size={16} /> Staff verified {formatBranchFreshness(branch)}</span>
        </div>

        <div className="branch-title-row">
          <span className={`branch-icon large ${branch.accent}`}><BranchIcon size={26} /></span>
          <div><p>{branch.shortType}</p><h2 id="branch-title">{branch.name}</h2><span><MapPin size={15} /> {branch.address}</span></div>
        </div>

        <div className="branch-vitals">
          <div><small>ESTIMATED WAIT</small><strong>{branch.wait} min</strong><span className="positive"><Activity size={14} /> {branch.status}</span></div>
          <div><small>QUEUE CAPACITY</small><strong>{branch.people}/{branch.capacity}</strong><span><Users size={14} /> Live count</span></div>
          <div><small>TRAVEL TIME</small><strong>{branch.travel} min</strong><span><Navigation size={14} /> From you</span></div>
        </div>

        <div className={`branch-access-state ${joinState.canJoin ? "open" : "limited"}`}>
          {joinState.canJoin ? <BadgeCheck size={18} /> : <CalendarDays size={18} />}
          <span><strong>{joinState.reason}</strong><small>{joinState.detail}</small></span>
        </div>

        <div className="service-selector">
          <div className="section-heading"><div><h3>What do you need help with?</h3><p>Select one service</p></div></div>
          <div className="service-options">
            {branch.services.map((service) => {
              const isUnavailable = branch.unavailableServices.includes(service.name);
              return (
              <button
                key={service.name}
                className={selectedService === service.name ? "selected" : ""}
                onClick={() => setSelectedService(service.name)}
                disabled={isUnavailable}
              >
                <span className="radio"><Check size={14} /></span>
                <span><strong>{service.name}</strong><small>{isUnavailable ? "Unavailable today" : service.duration}</small></span>
              </button>
            )})}
          </div>
        </div>

        <div className="fair-queue-rules" aria-label="Fair queue rules">
          <span><ShieldCheck size={18} /></span>
          <div><strong>Fair queue rules</strong><small>One active ticket per person · {branch.graceMinutes}-minute arrival grace · unattended places release automatically</small></div>
        </div>

        <div className="sheet-footer">
          <span className="arrival-note"><ShieldCheck size={19} /><span><strong>{joinState.canJoin ? `Arrive by ${formatTime(branch.wait + 7)}` : "You still have options"}</strong><small>{joinState.canJoin ? `Your place is held for ${branch.graceMinutes} minutes` : "Book a slot or compare quieter centres"}</small></span></span>
          {joinState.canJoin ? (
            <button className="primary-button" onClick={() => onContinue(selectedService)} disabled={!selectedService}>Join virtual queue <ArrowRight size={19} /></button>
          ) : (
            <button className="primary-button" onClick={() => onFallback(selectedService || branch.services[0].name)}>Appointments and alternatives <CalendarDays size={19} /></button>
          )}
        </div>
      </section>
    </div>
  );
}

function JoinConfirmation({ branch, service, onBack, onConfirm }) {
  return (
    <div className="sheet-layer confirmation-layer" role="presentation">
      <section className="confirmation-sheet" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="confirm-top">
          <IconButton label="Back to branch details" onClick={onBack}><ArrowLeft size={20} /></IconButton>
          <span>Confirm your place</span>
          <span className="step-count">2 of 2</span>
        </div>
        <div className="confirm-visual">
          <span className="ticket-rings"><Ticket size={32} /></span>
          <h2 id="confirm-title">Skip the waiting room.</h2>
          <p>We’ll keep an eye on the queue and tell you when it’s time to leave.</p>
        </div>
        <div className="confirm-summary">
          <div className="summary-branch"><span className={`branch-icon ${branch.accent}`}><Building2 size={22} /></span><span><small>JOINING</small><strong>{branch.name}</strong><span>{service}</span></span></div>
          <div className="summary-grid">
            <div><Clock3 size={19} /><span><small>Estimated wait</small><strong>{branch.wait} minutes</strong></span></div>
            <div><Users size={19} /><span><small>Ahead of you</small><strong>{branch.people} people</strong></span></div>
            <div><Navigation size={19} /><span><small>Leave in</small><strong>{Math.max(branch.wait - branch.travel + 5, 3)} minutes</strong></span></div>
            <div><CalendarDays size={19} /><span><small>Expected service</small><strong>{formatTime(branch.wait)}</strong></span></div>
          </div>
        </div>
        <label className="notification-toggle">
          <span className="toggle-icon"><BellRing size={20} /></span>
          <span><strong>Queue alerts</strong><small>Notify me when it is time to leave</small></span>
          <input type="checkbox" defaultChecked />
          <i />
        </label>
        <button className="primary-button full" onClick={onConfirm}>Confirm and join queue <ArrowRight size={19} /></button>
        <p className="privacy-note"><ShieldCheck size={14} /> Your ID is only shared with this branch.</p>
      </section>
    </div>
  );
}

function formatTime(minutesFromNow) {
  const now = new Date(2026, 7, 7, 10, 24);
  now.setMinutes(now.getMinutes() + minutesFromNow);
  return now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getDirectionsUrl(branch, userLocation) {
  const destination = `${branch.name}, ${branch.address}, Johannesburg, South Africa`;
  const origin = userLocation
    ? `&origin=${encodeURIComponent(`${userLocation.latitude},${userLocation.longitude}`)}`
    : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${origin}&travelmode=driving&dir_action=navigate`;
}

function QueueTicket({ ticket, branchList, onAdvance, onCancel, onCheckedIn, onComplete, userLocation }) {
  const current = queueSteps[ticket.step];
  const progress = ((12 - current.ahead) / 12) * 100;
  const canCheckIn = ticket.step === queueSteps.length - 1;
  const isCheckedIn = ticket.checkedIn;
  const latestBranch = branchList.find((branch) => branch.id === ticket.branch.id) || ticket.branch;
  const activeBranch = withLiveDistance(latestBranch, userLocation);

  return (
    <main className="ticket-view view-enter">
      <section className="ticket-heading">
        <div><p className="eyebrow">ACTIVE VIRTUAL QUEUE</p><h1>{isCheckedIn ? "You’re checked in." : "Your place is secured."}</h1><p>{isCheckedIn ? "Please wait near the service counter." : "Carry on with your day. We’ll watch the queue for you."}</p></div>
        <span className={`live-status ${isCheckedIn ? "checked" : ""}`}><span /> {isCheckedIn ? "Checked in" : "Live"}</span>
      </section>

      <section className={`live-ticket ${isCheckedIn ? "is-checked" : ""}`}>
        <div className="ticket-main">
          <div className="ticket-number"><small>YOUR TICKET</small><strong>QL-037</strong><span>{ticket.service}</span></div>
          <div className="queue-progress" style={{ "--progress": `${progress}%` }}>
            <div><strong>{isCheckedIn ? <Check size={38} /> : current.ahead}</strong><span>{isCheckedIn ? "READY" : "PEOPLE AHEAD"}</span></div>
          </div>
          <div className="queue-message"><span className="pulse-icon"><BellRing size={20} /></span><div><small>LIVE UPDATE</small><strong>{isCheckedIn ? "The branch knows you have arrived" : current.message}</strong><span>Updated just now</span></div></div>
        </div>
        <div className="ticket-side">
          <div><small>ESTIMATED TURN</small><strong>{isCheckedIn ? "Now" : formatTime(current.wait)}</strong></div>
          <div><small>WAIT REMAINING</small><strong>{isCheckedIn ? "0 min" : `~${current.wait} min`}</strong></div>
          <div><small>QUEUE STATUS</small><strong className="moving"><Activity size={16} /> Moving well</strong></div>
        </div>
      </section>

      {!isCheckedIn && (
        <section className="demo-control">
          <span className="demo-badge"><Zap size={16} /> HACKATHON DEMO</span>
          <span><strong>Simulate the live queue</strong><small>Advance the queue to show real-time alerts and check-in.</small></span>
          <button onClick={onAdvance} disabled={canCheckIn}>{canCheckIn ? "Ready to check in" : "Advance queue"} <ArrowRight size={17} /></button>
        </section>
      )}

      <section className="ticket-details-layout">
        <div className="journey-panel">
          <div className="section-heading"><div><h2>Your queue journey</h2><p>Live timing based on branch flow</p></div></div>
          <div className="timeline">
            <div className="timeline-step done"><span><Check size={16} /></span><div><strong>Joined the virtual queue</strong><small>10:24 · Place secured</small></div></div>
            <div className={`timeline-step ${ticket.step >= 2 ? "done" : "active"}`}><span>{ticket.step >= 2 ? <Check size={16} /> : <Bell size={16} />}</span><div><strong>Leave for the branch</strong><small>{ticket.step >= 2 ? `Alert sent · Travel time ${activeBranch.travel} min` : `We’ll alert you in about ${Math.max(current.wait - activeBranch.travel, 2)} min`}</small></div></div>
            <div className={`timeline-step ${isCheckedIn ? "done" : canCheckIn ? "active" : ""}`}><span>{isCheckedIn ? <Check size={16} /> : <MapPin size={16} />}</span><div><strong>Arrive and check in</strong><small>{isCheckedIn ? "Checked in successfully" : "Confirm your arrival from the app"}</small></div></div>
            <div className={`timeline-step ${isCheckedIn ? "active" : ""}`}><span><Sparkles size={16} /></span><div><strong>Get served</strong><small>{isCheckedIn ? "Listen for ticket QL-037" : "We’ll call ticket QL-037"}</small></div></div>
          </div>
        </div>

        <aside className="branch-panel">
          <div className="branch-panel-title"><span className={`branch-icon ${activeBranch.accent}`}><Landmark size={22} /></span><div><small>YOUR BRANCH</small><strong>{activeBranch.name}</strong><span>{activeBranch.address}</span></div></div>
          <div className="branch-panel-meta"><span><Clock3 size={16} /> Open until {activeBranch.closes}</span><span><Footprints size={16} /> {activeBranch.distance} km away {userLocation ? "· live" : ""}</span></div>
          <a
            className="secondary-button"
            href={getDirectionsUrl(activeBranch, userLocation)}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={18} /> Get directions
          </a>
          {canCheckIn && !isCheckedIn && <button className="primary-button full check-in" onClick={onCheckedIn}><MapPin size={19} /> I’m at the branch</button>}
          {isCheckedIn && <button className="primary-button full complete-service" onClick={onComplete}><Check size={19} /> Mark service complete</button>}
          {!isCheckedIn && <button className="danger-button" onClick={onCancel}>Leave this queue</button>}
        </aside>
      </section>
    </main>
  );
}

function formatSavedDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function ActivityView({ onOpenVisit, locationHistory, onSelectLocation, completedVisits }) {
  const baselineItems = [
    { id: "visit-randburg", icon: Landmark, name: "Randburg Home Affairs", service: "Document collection", date: "29 July 2026", saved: "1h 12m", savedMinutes: 72, tone: "teal" },
    { id: "visit-ferndale", icon: HeartPulse, name: "Ferndale Community Clinic", service: "Medication collection", date: "14 July 2026", saved: "42 min", savedMinutes: 42, tone: "coral" },
    { id: "visit-rosebank", icon: Banknote, name: "Ubuntu Bank Rosebank", service: "Card collection", date: "02 July 2026", saved: "1h 30m", savedMinutes: 90, tone: "blue" },
  ];
  const items = [...completedVisits, ...baselineItems];
  const totalSavedMinutes = items.reduce((total, item) => total + item.savedMinutes, 0);
  return (
    <main className="simple-view view-enter">
      <section className="simple-heading"><div><p className="eyebrow">YOUR IMPACT</p><h1>Time back in your day.</h1><p>A record of your QueueLess visits.</p></div></section>
      <section className="impact-band"><div><Zap size={24} /><span><strong>{formatSavedDuration(totalSavedMinutes)}</strong><small>Total time saved</small></span></div><div><Ticket size={24} /><span><strong>{items.length}</strong><small>Queues completed</small></span></div><div><Users size={24} /><span><strong>4.8</strong><small>Average rating</small></span></div></section>
      <section className="history-section location-history-section">
        <div className="section-heading"><div><h2>Location activity</h2><p>Every service-area update stored on this device</p></div><span className="private-badge"><ShieldCheck size={14} /> Private</span></div>
        {locationHistory.length ? (
          <div className="history-list location-history-list">{locationHistory.map((area) => (
            <button key={area.historyId} onClick={() => onSelectLocation(area)} aria-label={`Search around ${area.label} again`}>
              <span className="branch-icon gold"><MapPin size={21} /></span>
              <span className="history-copy"><strong>{area.label}</strong><span>{area.secondary}</span></span>
              <span className="location-history-meta"><strong>{area.source === "gps" ? "GPS" : area.source === "geocoding" ? "Live API" : "Area preset"}</strong><small>{formatSearchTime(area.timestamp)}</small></span>
              <ChevronRight size={18} />
            </button>
          ))}</div>
        ) : (
          <div className="location-history-empty"><MapPin size={22} /><span><strong>No location changes yet</strong><small>Change the search area on Explore and it will appear here.</small></span></div>
        )}
      </section>
      <section className="history-section"><div className="section-heading"><div><h2>Recent visits</h2><p>Your completed service history</p></div></div><div className="history-list">{items.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => onOpenVisit(item)} aria-label={`View ${item.name} visit`}><span className={`branch-icon ${item.tone}`}><Icon size={21} /></span><span className="history-copy"><strong>{item.name}</strong><span>{item.service} · {item.date}</span></span><span className="saved"><Zap size={14} /> Saved {item.saved}</span><ChevronRight size={18} /></button>; })}</div></section>
    </main>
  );
}

function EditProfileDialog({ profile, onClose, onSave }) {
  const [draft, setDraft] = useState(profile);
  const [avatarError, setAvatarError] = useState("");

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submitProfile(event) {
    event.preventDefault();
    onSave({
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      city: draft.city.trim(),
      province: draft.province.trim(),
      avatar: draft.avatar || "",
    });
  }

  function uploadAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError("Choose an image smaller than 8 MB.");
      return;
    }

    setAvatarError("");
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - side) / 2;
      const sourceY = (image.naturalHeight - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 480;
      canvas.height = 480;
      const context = canvas.getContext("2d");
      if (!context) {
        setAvatarError("Photo processing is unavailable in this browser.");
        URL.revokeObjectURL(objectUrl);
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, sourceX, sourceY, side, side, 0, 0, canvas.width, canvas.height);
      updateField("avatar", canvas.toDataURL("image/jpeg", 0.86));
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      setAvatarError("That image could not be read. Please choose another one.");
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  }

  return (
    <div className="sheet-layer profile-editor-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="profile-editor" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title">
        <header className="profile-editor-header">
          <div><p className="eyebrow">MY DETAILS</p><h2 id="profile-editor-title">Edit profile</h2></div>
          <IconButton label="Close profile editor" onClick={onClose}><X size={20} /></IconButton>
        </header>
        <form onSubmit={submitProfile}>
          <div className="profile-editor-identity">
            <span className="profile-avatar"><AvatarContent profile={draft} /></span>
            <div className="profile-editor-identity-copy">
              <strong>{draft.name || "Your name"}</strong>
              <small>QueueLess profile photo</small>
              <div className="avatar-actions">
                <label className="avatar-upload-button">
                  <Camera size={16} /> {draft.avatar ? "Change photo" : "Upload photo"}
                  <input className="avatar-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} />
                </label>
                {draft.avatar && <button type="button" className="avatar-remove-button" onClick={() => updateField("avatar", "")}><Trash2 size={15} /> Remove</button>}
              </div>
            </div>
          </div>
          {avatarError && <p className="avatar-error" role="alert">{avatarError}</p>}
          <div className="profile-form-grid">
            <label><span>Full name</span><input value={draft.name} onChange={(event) => updateField("name", event.target.value)} required autoComplete="name" /></label>
            <label><span>Mobile number</span><input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} required inputMode="tel" autoComplete="tel" /></label>
            <label><span>City</span><input value={draft.city} onChange={(event) => updateField("city", event.target.value)} required autoComplete="address-level2" /></label>
            <label><span>Province</span><input value={draft.province} onChange={(event) => updateField("province", event.target.value)} required autoComplete="address-level1" /></label>
          </div>
          <div className="profile-editor-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button"><Check size={18} /> Save changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AppSettingsDialog({ settings, onClose, onSave }) {
  const [draft, setDraft] = useState(settings);

  function toggle(setting) {
    setDraft((current) => ({ ...current, [setting]: !current[setting] }));
  }

  return (
    <div className="sheet-layer app-settings-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="profile-editor app-settings" role="dialog" aria-modal="true" aria-labelledby="app-settings-title">
        <header className="profile-editor-header">
          <div><p className="eyebrow">ACCESSIBILITY</p><h2 id="app-settings-title">App settings</h2></div>
          <IconButton label="Close app settings" onClick={onClose}><X size={20} /></IconButton>
        </header>
        <div className="settings-form">
          <div className="settings-intro"><span><Accessibility size={24} /></span><div><strong>Make QueueLess comfortable for you</strong><small>These settings are saved on this device.</small></div></div>
          <button type="button" role="switch" aria-checked={draft.largeText} onClick={() => toggle("largeText")}>
            <span><strong>Larger text</strong><small>Increase important labels and branch details</small></span>
            <span className={`mini-switch ${draft.largeText ? "on" : ""}`} aria-hidden="true"><i /></span>
          </button>
          <button type="button" role="switch" aria-checked={draft.highContrast} onClick={() => toggle("highContrast")}>
            <span><strong>Higher contrast</strong><small>Strengthen text and borders throughout the app</small></span>
            <span className={`mini-switch ${draft.highContrast ? "on" : ""}`} aria-hidden="true"><i /></span>
          </button>
          <button type="button" role="switch" aria-checked={draft.reducedMotion} onClick={() => toggle("reducedMotion")}>
            <span><strong>Reduce motion</strong><small>Minimise animated transitions throughout the app</small></span>
            <span className={`mini-switch ${draft.reducedMotion ? "on" : ""}`} aria-hidden="true"><i /></span>
          </button>
        </div>
        <div className="profile-editor-footer">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="button" className="primary-button" onClick={() => onSave(draft)}><Check size={18} /> Save settings</button>
        </div>
      </section>
    </div>
  );
}

function LocationRecoveryDialog({ onClose, onRetry, onUseDemo, permissionState, recoveryMessage }) {
  return (
    <div className="sheet-layer location-recovery-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="location-recovery" role="dialog" aria-modal="true" aria-labelledby="location-recovery-title">
        <header className="location-recovery-header">
          <span className="location-recovery-icon"><LocateFixed size={26} /></span>
          <IconButton label="Close location help" onClick={onClose}><X size={20} /></IconButton>
        </header>
        <h2 id="location-recovery-title">Location access is off</h2>
        <p>QueueLess cannot change a browser permission itself. Once Location is set to Allow, this screen will recognise it and connect your position.</p>
        {recoveryMessage && <div className="permission-message" role="alert"><ShieldCheck size={18} /><span><strong>Permission is still blocked</strong><small>{recoveryMessage}</small></span></div>}
        <ol className="permission-steps">
          <li><span>1</span><div><strong>Open this site’s permissions</strong><small>Use the location or settings control beside the address bar.</small></div></li>
          <li><span>2</span><div><strong>Allow precise location</strong><small>Set Location to Allow for QueueLess SA.</small></div></li>
          <li><span>3</span><div><strong>Try again</strong><small>Return here and use the button below.</small></div></li>
        </ol>
        <div className="location-recovery-actions">
          <button className="primary-button" onClick={onRetry}><LocateFixed size={18} /> {permissionState === "prompt" ? "Request precise location" : "Check permission and try again"}</button>
          <button className="secondary-button" onClick={onUseDemo}><MapPin size={18} /> Use demo position</button>
          <button className="text-button location-close" onClick={onClose}>Continue without location</button>
        </div>
      </section>
    </div>
  );
}

function ProfileView({ soundEnabled, onSoundChange, userLocation, profile, onEditProfile, onOpenSettings, onPreferenceChange }) {
  const [sms, setSms] = useState(true);
  const [lowWait, setLowWait] = useState(true);

  function togglePreference(name, current, setter) {
    const next = !current;
    setter(next);
    onPreferenceChange(name, next);
  }

  return (
    <main className="simple-view view-enter">
      <section className="profile-hero"><span className="profile-avatar"><AvatarContent profile={profile} /></span><div><p className="eyebrow">MY PROFILE</p><h1>{profile.name}</h1><p><MapPin size={15} /> {userLocation?.source === "gps" ? `Live GPS · ±${Math.round(userLocation.accuracy)} m` : userLocation?.source === "demo" ? "Demo position active" : `${profile.city}, ${profile.province}`}</p></div><button className="secondary-button" onClick={onEditProfile}>Edit profile</button></section>
      <section className="settings-grid">
        <div className="settings-section"><h2>Queue preferences</h2><button type="button" role="switch" aria-checked={sms} onClick={() => togglePreference("SMS queue alerts", sms, setSms)}><span className="settings-icon"><Bell size={19} /></span><span><strong>SMS queue alerts</strong><small>Get alerts even when data is off</small></span><span className={`mini-switch ${sms ? "on" : ""}`} aria-hidden="true"><i /></span></button><button type="button" role="switch" aria-checked={soundEnabled} onClick={() => { const next = !soundEnabled; onSoundChange(next); onPreferenceChange("Notification sounds", next); }}><span className="settings-icon"><BellRing size={19} /></span><span><strong>Notification sounds</strong><small>Play a tone for new queue alerts</small></span><span className={`mini-switch ${soundEnabled ? "on" : ""}`} aria-hidden="true"><i /></span></button><button type="button" role="switch" aria-checked={lowWait} onClick={() => togglePreference("Low-wait alerts", lowWait, setLowWait)}><span className="settings-icon"><Zap size={19} /></span><span><strong>Low-wait alerts</strong><small>Notify me when favourites are quiet</small></span><span className={`mini-switch ${lowWait ? "on" : ""}`} aria-hidden="true"><i /></span></button></div>
        <div className="settings-section"><h2>Account</h2><button type="button" onClick={onEditProfile}><span className="settings-icon"><Smartphone size={19} /></span><span><strong>{profile.phone}</strong><small>Verified mobile number</small></span><BadgeCheck size={19} className="success-icon" /></button><button type="button" onClick={onOpenSettings}><span className="settings-icon"><Settings size={19} /></span><span><strong>App settings</strong><small>Text size, contrast and motion</small></span><ChevronRight size={19} /></button></div>
      </section>
    </main>
  );
}

function NumberControl({ label, value, min, max, suffix, onChange }) {
  return (
    <div className="number-control">
      <span><small>{label}</small><strong>{value}{suffix || ""}</strong></span>
      <span className="stepper">
        <IconButton label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}><Minus size={17} /></IconButton>
        <IconButton label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}><Plus size={17} /></IconButton>
      </span>
    </div>
  );
}

function StaffView({ branchList, onPublish, onReset, onCitizenView, onChannelTest }) {
  const [selectedId, setSelectedId] = useState(branchList[0].id);
  const selectedBranch = branchList.find((branch) => branch.id === selectedId) || branchList[0];
  const [draft, setDraft] = useState(() => ({
    wait: selectedBranch.wait,
    people: selectedBranch.people,
    counters: selectedBranch.counters,
    capacity: selectedBranch.capacity,
    operationalStatus: selectedBranch.operationalStatus,
    virtualJoins: selectedBranch.virtualJoins,
    graceMinutes: selectedBranch.graceMinutes,
    priorityAccess: selectedBranch.priorityAccess,
    unavailableServices: selectedBranch.unavailableServices,
  }));

  useEffect(() => {
    setDraft({
      wait: selectedBranch.wait,
      people: selectedBranch.people,
      counters: selectedBranch.counters,
      capacity: selectedBranch.capacity,
      operationalStatus: selectedBranch.operationalStatus,
      virtualJoins: selectedBranch.virtualJoins,
      graceMinutes: selectedBranch.graceMinutes,
      priorityAccess: selectedBranch.priorityAccess,
      unavailableServices: selectedBranch.unavailableServices,
    });
  }, [selectedBranch.id, selectedBranch.updatedAt]);

  const previewBranch = { ...selectedBranch, ...draft };
  const joinState = branchJoinState(previewBranch);
  const occupancy = Math.min(100, Math.round((draft.people / Math.max(draft.capacity, 1)) * 100));
  const estimatedSaved = Math.max(0, Math.round(selectedBranch.servedToday * Math.max(draft.wait - 7, 4) / 60));

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

  return (
    <main className="staff-view view-enter">
      <section className="staff-heading">
        <div><p className="eyebrow">BRANCH OPERATIONS</p><h1>Live queue control</h1><p>Publish one update, then view the same branch as a citizen.</p></div>
        <div className="staff-heading-actions"><button className="secondary-button" onClick={onReset}>Reset demo data</button><button className="primary-button" onClick={onCitizenView}><CircleUserRound size={18} /> Citizen app</button></div>
      </section>

      <section className="staff-branch-bar">
        <span className="staff-role"><Building2 size={20} /><span><small>SIGNED IN AS</small><strong>Branch queue manager</strong></span></span>
        <label><span>Managing branch</span><select value={selectedId} onChange={(event) => setSelectedId(Number(event.target.value))}>{branchList.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <span className="staff-sync"><BadgeCheck size={18} /><span><small>LAST PUBLISHED</small><strong>{formatBranchFreshness(selectedBranch)}</strong></span></span>
      </section>

      <div className="staff-layout">
        <section className="operations-panel">
          <div className="panel-heading"><span><Activity size={19} /></span><div><h2>Queue snapshot</h2><p>What citizens see right now</p></div></div>

          <div className="status-segment" role="group" aria-label="Branch operating status">
            {[{ id: "open", label: "Open" }, { id: "paused", label: "Pause joins" }, { id: "closed", label: "Closed" }].map((status) => <button key={status.id} className={draft.operationalStatus === status.id ? "active" : ""} onClick={() => update("operationalStatus", status.id)}>{status.label}</button>)}
          </div>

          <div className="number-grid">
            <NumberControl label="Estimated wait" value={draft.wait} min={0} max={120} suffix=" min" onChange={(value) => update("wait", value)} />
            <NumberControl label="People waiting" value={draft.people} min={0} max={draft.capacity} onChange={(value) => update("people", value)} />
            <NumberControl label="Open counters" value={draft.counters} min={1} max={12} onChange={(value) => update("counters", value)} />
            <NumberControl label="Queue capacity" value={draft.capacity} min={5} max={100} onChange={(value) => { update("capacity", value); if (draft.people > value) update("people", value); }} />
          </div>

          <div className="capacity-meter"><span><strong>Occupancy</strong><small>{draft.people} of {draft.capacity} places</small></span><div><i style={{ width: `${occupancy}%` }} /></div><b>{occupancy}%</b></div>

          <div className="operations-toggles">
            <button type="button" role="switch" aria-checked={draft.virtualJoins} onClick={() => update("virtualJoins", !draft.virtualJoins)}><span><strong>Virtual joins</strong><small>Allow citizens to take a place remotely</small></span><span className={`mini-switch ${draft.virtualJoins ? "on" : ""}`}><i /></span></button>
            <button type="button" role="switch" aria-checked={draft.priorityAccess} onClick={() => update("priorityAccess", !draft.priorityAccess)}><span><strong>Priority assistance</strong><small>Flag access support at check-in</small></span><span className={`mini-switch ${draft.priorityAccess ? "on" : ""}`}><i /></span></button>
          </div>

          <div className="grace-control"><ShieldCheck size={18} /><span><strong>Arrival grace period</strong><small>Places release automatically after this time</small></span><NumberControl label="Grace" value={draft.graceMinutes} min={5} max={20} suffix=" min" onChange={(value) => update("graceMinutes", value)} /></div>

          <div className="service-availability"><div><h3>Services today</h3><small>Turn off anything temporarily unavailable</small></div>{selectedBranch.services.map((service) => { const available = !draft.unavailableServices.includes(service.name); return <button key={service.name} type="button" role="switch" aria-checked={available} onClick={() => toggleService(service.name)}><span>{service.name}</span><span className={`availability-state ${available ? "available" : "off"}`}>{available ? "Available" : "Unavailable"}</span></button>; })}</div>

          <button className="primary-button full publish-button" onClick={() => onPublish(selectedBranch.id, draft)}><Save size={18} /> Publish live update</button>
        </section>

        <aside className="staff-insights">
          <section className="citizen-preview">
            <div className="panel-heading"><span><Smartphone size={19} /></span><div><h2>Citizen preview</h2><p>Before publishing</p></div></div>
            <div className="preview-branch"><span className={`branch-icon ${previewBranch.accent}`}><Building2 size={21} /></span><div><small>{previewBranch.shortType}</small><strong>{previewBranch.name}</strong><span>{previewBranch.address}</span></div></div>
            <div className="preview-metrics"><div><small>WAIT</small><strong>{draft.wait} min</strong></div><div><small>QUEUE</small><strong>{draft.people}/{draft.capacity}</strong></div><div><small>COUNTERS</small><strong>{draft.counters}</strong></div></div>
            <div className={`preview-access ${joinState.canJoin ? "open" : "limited"}`}><span /><div><strong>{joinState.reason}</strong><small>{joinState.detail}</small></div></div>
          </section>

          <section className="impact-panel">
            <div className="panel-heading"><span><BarChart3 size={19} /></span><div><h2>Today’s impact</h2><p>Operational demo metrics</p></div></div>
            <div className="impact-metrics"><div><strong>{selectedBranch.servedToday}</strong><span>people served</span></div><div><strong>{estimatedSaved}h</strong><span>citizen time returned</span></div><div><strong>{draft.counters}</strong><span>active counters</span></div><div><strong>{Math.max(2, Math.round(draft.wait / Math.max(draft.people, 1) * 10))}m</strong><span>average movement</span></div></div>
            <div className="flow-chart" aria-label="Hourly queue flow chart">{[38, 62, 46, 78, 56, Math.max(20, occupancy)].map((height, index) => <span key={index} style={{ height: `${height}%` }}><i /></span>)}</div>
            <div className="flow-labels"><span>08:00</span><span>10:00</span><span>12:00</span><span>Now</span></div>
          </section>

          <section className="channel-panel"><div><h2>Access-channel test</h2><p>Send a demo update beyond the smartphone app.</p></div><div><button onClick={() => onChannelTest("SMS update sent", `${selectedBranch.name}: ${draft.wait} min wait, ${draft.people} people.`)}><Smartphone size={17} /> SMS</button><button onClick={() => onChannelTest("WhatsApp update sent", `Queue status shared for ${selectedBranch.name}.`)}><MessageSquare size={17} /> WhatsApp</button><button onClick={() => onChannelTest("USSD status published", "The *120*7537# menu now reflects this branch update.")}><PhoneCall size={17} /> USSD</button></div></section>
        </aside>
      </div>
    </main>
  );
}

function LowDataAccessDialog({ profile, onClose, onSend }) {
  const [channel, setChannel] = useState("sms");
  const [phone, setPhone] = useState(profile.phone);
  const [ussdOpen, setUssdOpen] = useState(false);

  function send(event) {
    event?.preventDefault();
    if (channel === "sms") onSend("SMS request sent", `Queue options will be sent to ${phone || "your mobile"}.`);
    if (channel === "whatsapp") onSend("WhatsApp demo opened", "Nearby queues and reply options are ready in the chat preview.");
  }

  return (
    <div className="sheet-layer access-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="access-dialog" role="dialog" aria-modal="true" aria-labelledby="access-title">
        <header><div><p className="eyebrow">LOW-DATA ACCESS</p><h2 id="access-title">QueueLess on any phone</h2></div><IconButton label="Close low-data access" onClick={onClose}><X size={19} /></IconButton></header>
        <div className="access-tabs" role="tablist">{[{ id: "sms", label: "SMS" }, { id: "whatsapp", label: "WhatsApp" }, { id: "ussd", label: "USSD" }].map((item) => <button key={item.id} className={channel === item.id ? "active" : ""} onClick={() => setChannel(item.id)} role="tab" aria-selected={channel === item.id}>{item.label}</button>)}</div>

        {channel === "sms" && <form className="channel-demo" onSubmit={send}><span className="channel-icon"><Smartphone size={24} /></span><h3>Get nearby queues by SMS</h3><p>Send <b>QUEUE + suburb</b>. The prototype returns the three shortest waits and numbered reply options.</p><label><span>Mobile number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" required /></label><div className="message-preview"><small>PREVIEW</small><p>QueueLess: Randburg HA 18m. Ferndale Clinic 11m. Ubuntu Bank 26m. Reply 1, 2 or 3 to join.</p></div><button className="primary-button full" type="submit"><Send size={18} /> Send demo SMS</button></form>}
        {channel === "whatsapp" && <div className="channel-demo"><span className="channel-icon whatsapp"><MessageSquare size={24} /></span><h3>WhatsApp queue assistant</h3><p>People can share a suburb, choose a service, join, and receive leave-now alerts in a familiar conversation.</p><div className="chat-preview"><span>Hi QueueLess, find Home Affairs near Randburg.</span><span>Randburg Home Affairs is 18 min. Reply JOIN to reserve your place.</span></div><button className="primary-button full" onClick={send}><MessageSquare size={18} /> Open demo conversation</button></div>}
        {channel === "ussd" && <div className="channel-demo"><span className="channel-icon ussd"><PhoneCall size={24} /></span><h3>Works without mobile data</h3><p>Dial <b>*120*7537#</b> from any mobile phone.</p>{ussdOpen ? <div className="ussd-screen"><strong>QueueLess SA</strong><span>1. Find nearby services</span><span>2. Check my queue</span><span>3. Leave a queue</span><button onClick={() => onSend("USSD selection received", "Nearby service options were returned in the demo session.")}>Choose 1 · Find services</button></div> : <button className="primary-button full" onClick={() => setUssdOpen(true)}><PhoneCall size={18} /> Dial demo code</button>}</div>}
      </section>
    </div>
  );
}

function FallbackDialog({ branch, service, branchList, onClose, onBook, onChooseAlternative }) {
  const [day, setDay] = useState("Tomorrow");
  const [time, setTime] = useState("09:30");
  const alternatives = branchList
    .filter((item) => item.id !== branch.id && item.type === branch.type && branchJoinState(item).canJoin)
    .map((item) => ({ ...item, alternativeDistance: Number(distanceBetween(branch.latitude, branch.longitude, item.latitude, item.longitude).toFixed(1)) }))
    .sort((a, b) => a.alternativeDistance - b.alternativeDistance || a.wait - b.wait)
    .slice(0, 2);

  return (
    <div className="sheet-layer fallback-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="fallback-dialog" role="dialog" aria-modal="true" aria-labelledby="fallback-title">
        <header><div><p className="eyebrow">KEEP YOUR DAY MOVING</p><h2 id="fallback-title">Choose another way to be served</h2></div><IconButton label="Close options" onClick={onClose}><X size={19} /></IconButton></header>
        <div className="fallback-reason"><CalendarDays size={20} /><span><strong>{branch.name} cannot accept another virtual join</strong><small>Your service: {service}</small></span></div>
        <section className="appointment-picker"><div><h3>Book a guaranteed arrival window</h3><small>Your appointment is confirmed instantly in this prototype.</small></div><div className="choice-row">{["Today", "Tomorrow"].map((item) => <button key={item} className={day === item ? "active" : ""} onClick={() => setDay(item)}>{item}</button>)}</div><div className="time-grid">{["09:30", "11:00", "13:30", "14:45"].map((item) => <button key={item} className={time === item ? "active" : ""} onClick={() => setTime(item)}>{item}</button>)}</div><button className="primary-button full" onClick={() => onBook({ branch, service, dateLabel: day, time })}><CalendarDays size={18} /> Confirm {day.toLowerCase()} at {time}</button></section>
        <section className="alternative-branches"><div><h3>Or use the next-nearest centre</h3><small>Open for virtual joins</small></div>{alternatives.length ? alternatives.map((item) => <button key={item.id} onClick={() => onChooseAlternative(item)}><span className={`branch-icon ${item.accent}`}><Building2 size={19} /></span><span><strong>{item.name}</strong><small>{item.alternativeDistance} km away · {item.wait} min wait · verified {formatBranchFreshness(item)}</small></span><ChevronRight size={18} /></button>) : <p>No open alternatives are in this demo network right now.</p>}</section>
      </section>
    </div>
  );
}

function EmptyTicket({ onExplore }) {
  return <main className="empty-ticket view-enter"><span><Ticket size={34} /></span><h1>No active queue</h1><p>Find a nearby branch and join before you leave home.</p><button className="primary-button" onClick={onExplore}>Explore nearby branches <ArrowRight size={18} /></button></main>;
}

export default function QueueLessApp() {
  const [view, setView] = useState("home");
  const [sheet, setSheet] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationPermission, setLocationPermission] = useState("unknown");
  const [userLocation, setUserLocation] = useState(null);
  const [locationHelpOpen, setLocationHelpOpen] = useState(false);
  const [locationRecoveryMessage, setLocationRecoveryMessage] = useState("");
  const [areaSearchOpen, setAreaSearchOpen] = useState(false);
  const [searchArea, setSearchArea] = useState(defaultSearchArea);
  const [locationHistory, setLocationHistory] = useState([]);
  const [locationSearchHydrated, setLocationSearchHydrated] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [appSettings, setAppSettings] = useState(defaultAppSettings);
  const [appSettingsOpen, setAppSettingsOpen] = useState(false);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [branchOperations, setBranchOperations] = useState({});
  const [operationsHydrated, setOperationsHydrated] = useState(false);
  const [lowDataOpen, setLowDataOpen] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [completedVisits, setCompletedVisits] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const notificationIdRef = useRef(2);
  const audioContextRef = useRef(null);
  const locationWatchRef = useRef(null);
  const locationFirstFixRef = useRef(false);
  const operationalBranches = useMemo(() => branches.map((branch) => {
    const merged = { ...branch, ...(branchOperations[branch.id] || {}) };
    const status = merged.operationalStatus === "closed"
      ? "Closed"
      : merged.operationalStatus === "paused" || !merged.virtualJoins
        ? "Joins paused"
        : merged.wait <= 20 ? "Low wait" : merged.wait <= 35 ? "Moderate" : "Busy now";
    return { ...merged, status };
  }), [branchOperations]);
  const activeSearchArea = useMemo(() => searchArea.source === "gps" && userLocation
    ? { ...searchArea, latitude: userLocation.latitude, longitude: userLocation.longitude }
    : searchArea, [searchArea, userLocation]);

  useEffect(() => {
    if (!toast) return;
    playNotificationSound();
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast, soundEnabled]);

  useEffect(() => () => {
    if (locationWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
    }
    if (audioContextRef.current) audioContextRef.current.close();
  }, []);

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem("queueless-profile");
      if (savedProfile) setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
    } catch {
      // The app still works when browser storage is unavailable.
    } finally {
      setProfileHydrated(true);
    }
  }, []);

  useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem("queueless-sidebar-collapsed") === "true");
    } catch {
      // The sidebar still works when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("queueless-sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      // The preference remains active for the current session.
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!profileHydrated) return;
    try {
      window.localStorage.setItem("queueless-profile", JSON.stringify(profile));
    } catch {
      // Profile edits remain available for the current session.
    }
  }, [profile, profileHydrated]);

  useEffect(() => {
    try {
      const savedSettings = window.localStorage.getItem("queueless-app-settings");
      if (savedSettings) setAppSettings({ ...defaultAppSettings, ...JSON.parse(savedSettings) });
    } catch {
      // Accessibility settings remain available for the current session.
    } finally {
      setSettingsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!settingsHydrated) return;
    try {
      window.localStorage.setItem("queueless-app-settings", JSON.stringify(appSettings));
    } catch {
      // Accessibility settings remain available for the current session.
    }
  }, [appSettings, settingsHydrated]);

  useEffect(() => {
    try {
      const savedOperations = window.localStorage.getItem("queueless-branch-operations");
      if (savedOperations) setBranchOperations(JSON.parse(savedOperations));
    } catch {
      // The live operations demo still works for the current session.
    } finally {
      setOperationsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!operationsHydrated) return;
    try {
      window.localStorage.setItem("queueless-branch-operations", JSON.stringify(branchOperations));
    } catch {
      // Published updates remain active for the current session.
    }
  }, [branchOperations, operationsHydrated]);

  useEffect(() => {
    try {
      const savedArea = window.localStorage.getItem("queueless-search-area");
      const savedHistory = window.localStorage.getItem("queueless-location-history");
      if (savedArea) {
        const parsedArea = JSON.parse(savedArea);
        if (Number.isFinite(parsedArea.latitude) && Number.isFinite(parsedArea.longitude)) setSearchArea(parsedArea);
      }
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) setLocationHistory(parsedHistory.slice(0, 12));
      }
    } catch {
      // Location search still works when saved browser data is unavailable.
    } finally {
      setLocationSearchHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!locationSearchHydrated) return;
    try {
      window.localStorage.setItem("queueless-search-area", JSON.stringify(searchArea));
      window.localStorage.setItem("queueless-location-history", JSON.stringify(locationHistory));
    } catch {
      // Location history remains available for the current session.
    }
  }, [locationHistory, locationSearchHydrated, searchArea]);

  useEffect(() => {
    if (!navigator.permissions?.query) return undefined;
    let active = true;
    let permissionStatus;

    function handlePermissionChange() {
      if (!active || !permissionStatus) return;
      const nextState = permissionStatus.state;
      setLocationPermission(nextState);
      if (nextState === "granted") {
        setLocationRecoveryMessage("");
        setLocationHelpOpen(false);
        setLocationStatus((current) => current === "live" ? current : "idle");
        requestPreciseLocation();
      } else if (nextState === "denied") {
        if (locationWatchRef.current !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(locationWatchRef.current);
          locationWatchRef.current = null;
        }
        setLocationStatus("denied");
      }
    }

    navigator.permissions.query({ name: "geolocation" }).then((status) => {
      if (!active) return;
      permissionStatus = status;
      setLocationPermission(status.state);
      status.addEventListener("change", handlePermissionChange);
      if (status.state === "granted") requestPreciseLocation();
      if (status.state === "denied") setLocationStatus("denied");
    }).catch(() => setLocationPermission("unknown"));

    return () => {
      active = false;
      permissionStatus?.removeEventListener("change", handlePermissionChange);
    };
  }, []);

  function primeAudio() {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
  }

  function playNotificationSound() {
    if (!soundEnabled) return;
    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;
    const now = context.currentTime;
    [0, 0.16].forEach((delay, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(index === 0 ? 660 : 880, now + delay);
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.07, now + delay + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.13);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + 0.14);
    });
  }

  function notify(title, body, type = "queue") {
    notificationIdRef.current += 1;
    const notification = {
      id: `notification-${notificationIdRef.current}`,
      title,
      body,
      type,
      time: "Just now",
      read: false,
    };
    setToast(notification);
    setNotifications((current) => [notification, ...current].slice(0, 12));
  }

  function selectSearchArea(area) {
    const latitude = Number(area.latitude);
    const longitude = Number(area.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      notify("Location could not be used", "Choose another search result and try again.", "location");
      return;
    }

    const nextArea = {
      id: area.id || `area-${latitude}-${longitude}`,
      label: area.label || "Selected area",
      secondary: area.secondary || "South Africa",
      latitude,
      longitude,
      source: area.source || "geocoding",
    };
    const historyEntry = {
      ...nextArea,
      historyId: `location-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now(),
    };
    const serviceCount = branchesNear(nextArea, operationalBranches).length;
    setSearchArea(nextArea);
    setLocationHistory((current) => [historyEntry, ...current].slice(0, 12));
    setAreaSearchOpen(false);
    notify(
      `Now searching around ${nextArea.label}`,
      serviceCount
        ? `${serviceCount} QueueLess centres found within ${searchRadiusKm} km.`
        : `No demo-network centres are within ${searchRadiusKm} km yet.`,
      "location",
    );
  }

  function useMyPositionForSearch() {
    if (!userLocation) {
      setAreaSearchOpen(false);
      requestPreciseLocation();
      return;
    }
    selectSearchArea({
      id: `position-${userLocation.source}`,
      label: userLocation.source === "gps" ? "My live position" : "Demo position",
      secondary: `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      source: userLocation.source === "gps" ? "gps" : "demo",
    });
  }

  async function getLocationPermissionState() {
    if (!navigator.permissions?.query) return "unknown";
    try {
      const status = await navigator.permissions.query({ name: "geolocation" });
      setLocationPermission(status.state);
      return status.state;
    } catch {
      return "unknown";
    }
  }

  async function requestPreciseLocation() {
    primeAudio();
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      setLocationRecoveryMessage("This browser does not provide location services. You can still use the demo position below.");
      setLocationHelpOpen(true);
      notify("Location unavailable", "This browser does not support precise location.", "location");
      return;
    }
    const permissionState = await getLocationPermissionState();
    if (permissionState === "denied") {
      setLocationStatus("denied");
      setLocationRecoveryMessage("Location is still set to Block for this site. Change it to Allow, then press the button again.");
      setLocationHelpOpen(true);
      return;
    }
    if (locationStatus === "requesting") return;
    if (locationStatus === "live" && userLocation?.source === "gps") {
      notify(
        "Precise location is live",
        `Updated to within about ${Math.round(userLocation.accuracy)} metres.`,
        "location",
      );
      return;
    }

    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    setLocationStatus("requesting");
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: Date.now(),
          source: "gps",
        };
        setUserLocation(nextLocation);
        setLocationStatus("live");
        setLocationPermission("granted");
        setLocationRecoveryMessage("");
        setLocationHelpOpen(false);
        if (!locationFirstFixRef.current) {
          locationFirstFixRef.current = true;
          notify(
            "Live location connected",
            `Distances will update while QueueLess is open · accuracy ±${Math.round(position.coords.accuracy)} m.`,
            "location",
          );
        }
      },
      (error) => {
        if (locationWatchRef.current !== null) navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
        const denied = error.code === error.PERMISSION_DENIED;
        setLocationStatus(denied ? "denied" : "unavailable");
        if (denied) setLocationPermission("denied");
        setLocationRecoveryMessage(denied
          ? "Location is still set to Block for this site. Change it to Allow, then press the button again."
          : "A precise position was not returned. Check that device location services are on, or use the demo position.");
        setLocationHelpOpen(true);
        notify(
          denied ? "Location permission is off" : "Location could not be updated",
          denied
            ? "Enable location access in your browser to use live distances."
            : "QueueLess is using Johannesburg demo distances for now.",
          "location",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }

  function handleLocationControl() {
    requestPreciseLocation();
  }

  async function retryPreciseLocation() {
    primeAudio();
    const permissionState = await getLocationPermissionState();
    if (permissionState === "denied") {
      setLocationStatus("denied");
      setLocationRecoveryMessage("Location is still set to Block for this site. Change it to Allow in site permissions, then try once more.");
      notify("Location is still blocked", "Allow location in your browser’s site permissions, then try again.", "location");
      return;
    }
    setLocationRecoveryMessage("");
    setLocationHelpOpen(false);
    setLocationStatus("idle");
    locationFirstFixRef.current = false;
    requestPreciseLocation();
  }

  function useDemoLocation() {
    if (locationWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    setUserLocation({ ...demoLocation, updatedAt: Date.now() });
    setLocationStatus("demo");
    setLocationRecoveryMessage("");
    setLocationHelpOpen(false);
    notify("Demo position shown", "The blue-and-gold marker demonstrates how live location appears on the map.", "location");
  }

  function pauseLocationTracking() {
    if (locationWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    setLocationStatus("paused");
    notify("Live GPS paused", "Your last known position remains visible. Resume whenever you are ready.", "location");
  }

  function saveProfile(nextProfile) {
    setProfile(nextProfile);
    setProfileEditorOpen(false);
    notify("Profile updated", "Your QueueLess details have been saved.", "info");
  }

  function saveAppSettings(nextSettings) {
    setAppSettings(nextSettings);
    setAppSettingsOpen(false);
    notify("App settings updated", "Your accessibility preferences have been applied.", "info");
  }

  function updatePreference(name, enabled) {
    notify(`${name} ${enabled ? "on" : "off"}`, "Your queue preference has been updated.", "info");
  }

  function openVisit(item) {
    notify(item.name, `${item.service} · ${item.date} · ${item.saved} saved`, "info");
  }

  function openNotifications() {
    setNotificationsOpen(true);
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }

  function openBranch(branch) {
    setChosen({ branch, service: branch.services[0].name });
    setSheet("branch");
  }

  function confirmQueue() {
    if (ticket) {
      setSheet(null);
      setView("ticket");
      notify("One active ticket at a time", `Your place at ${ticket.branch.name} is already secured.`);
      return;
    }
    const latestBranch = operationalBranches.find((branch) => branch.id === chosen.branch.id) || chosen.branch;
    if (!branchJoinState(latestBranch).canJoin) {
      setChosen({ ...chosen, branch: latestBranch });
      setSheet("fallback");
      notify("This queue just changed", "Choose an appointment or another open branch.");
      return;
    }
    const newTicket = { branch: latestBranch, service: chosen.service, step: 0, checkedIn: false };
    setTicket(newTicket);
    setSheet(null);
    setView("ticket");
    window.scrollTo({ top: 0, behavior: "instant" });
    notify("You’re in queue QL-037", "We’ll notify you when it’s time to leave.");
  }

  function advanceQueue() {
    if (!ticket || ticket.step >= queueSteps.length - 1) return;
    const nextStep = ticket.step + 1;
    setTicket({ ...ticket, step: nextStep });
    if (nextStep === 2) notify("It’s almost your turn", "Leave now to arrive with 3 people ahead.");
    if (nextStep === 3) notify("You’re next", "Check in when you reach the branch.");
  }

  function checkIn() {
    setTicket({ ...ticket, checkedIn: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    notify("Check-in confirmed", "The branch is ready for ticket QL-037.");
  }

  function completeQueue() {
    if (!ticket?.checkedIn) return;

    const branch = operationalBranches.find((item) => item.id === ticket.branch.id) || ticket.branch;
    const savedMinutes = Math.max(branch.wait, 1);
    const Icon = branch.type === "clinic" ? HeartPulse : branch.type === "bank" ? Banknote : Landmark;
    const tone = branch.type === "clinic" ? "coral" : branch.type === "bank" ? "blue" : "teal";
    const completedVisit = {
      id: `completed-${Date.now()}`,
      icon: Icon,
      name: branch.name,
      service: ticket.service,
      date: "Today · Completed just now",
      saved: formatSavedDuration(savedMinutes),
      savedMinutes,
      tone,
    };

    setCompletedVisits((current) => [completedVisit, ...current]);
    setTicket(null);
    setView("activity");
    window.scrollTo({ top: 0, behavior: "smooth" });
    notify("Service completed", `${branch.name} has been added to your Activity.`);
  }

  function cancelQueue() {
    setTicket(null);
    setView("home");
    window.scrollTo({ top: 0, behavior: "instant" });
    notify("You left the queue", "Your place has been released.");
  }

  function navigate(nextView) {
    setView(nextView);
    setSheet(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function publishBranchUpdate(branchId, draft) {
    setBranchOperations((current) => ({
      ...current,
      [branchId]: {
        ...current[branchId],
        ...draft,
        updatedAt: Date.now(),
        dataSource: "Staff dashboard",
      },
    }));
    const branch = operationalBranches.find((item) => item.id === branchId);
    notify("Live branch update published", `${branch?.name || "The branch"} will update across citizen screens now.`, "info");
  }

  function resetOperations() {
    setBranchOperations({});
    notify("Demo data reset", "All branches are back to their original operating conditions.", "info");
  }

  function bookAppointment(nextAppointment) {
    setAppointment(nextAppointment);
    setSheet(null);
    setView("home");
    notify("Appointment confirmed", `${nextAppointment.dateLabel} at ${nextAppointment.time} · ${nextAppointment.branch.name}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseAlternative(branch) {
    setChosen({ branch, service: branch.services[0].name });
    setSheet("branch");
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${appSettings.largeText ? "large-text" : ""} ${appSettings.highContrast ? "high-contrast" : ""} ${appSettings.reducedMotion ? "reduced-motion" : ""}`} onPointerDown={primeAudio} onClickCapture={primeAudio}>
      <AppNavigation view={view} onNavigate={navigate} hasTicket={Boolean(ticket)} profile={profile} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((current) => !current)} />
      <div className="app-stage">
        <TopBar
          onProfile={() => navigate("profile")}
          onNotifications={openNotifications}
          onRequestLocation={handleLocationControl}
          unreadCount={notifications.filter((notification) => !notification.read).length}
          notificationsOpen={notificationsOpen}
          locationStatus={locationStatus}
          userLocation={userLocation}
          profile={profile}
        />
        {view === "home" && <HomeView branchList={operationalBranches} onChooseBranch={openBranch} ticket={ticket} appointment={appointment} onOpenTicket={() => navigate("ticket")} onRequestLocation={handleLocationControl} onPauseLocation={pauseLocationTracking} onOpenAreaSearch={() => setAreaSearchOpen(true)} onOpenLowData={() => setLowDataOpen(true)} onOpenStaff={() => navigate("staff")} locationStatus={locationStatus} userLocation={userLocation} searchArea={activeSearchArea} searchOrigin={activeSearchArea} profile={profile} />}
        {view === "ticket" && (ticket ? <QueueTicket ticket={ticket} branchList={operationalBranches} onAdvance={advanceQueue} onCancel={cancelQueue} onCheckedIn={checkIn} onComplete={completeQueue} userLocation={userLocation} /> : <EmptyTicket onExplore={() => navigate("home")} />)}
        {view === "activity" && <ActivityView onOpenVisit={openVisit} locationHistory={locationHistory} completedVisits={completedVisits} onSelectLocation={(area) => { selectSearchArea(area); navigate("home"); }} />}
        {view === "profile" && <ProfileView soundEnabled={soundEnabled} onSoundChange={setSoundEnabled} userLocation={userLocation} profile={profile} onEditProfile={() => setProfileEditorOpen(true)} onOpenSettings={() => setAppSettingsOpen(true)} onPreferenceChange={updatePreference} />}
        {view === "staff" && <StaffView branchList={operationalBranches} onPublish={publishBranchUpdate} onReset={resetOperations} onCitizenView={() => navigate("home")} onChannelTest={notify} />}
      </div>

      {notificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} onClear={() => setNotifications([])} soundEnabled={soundEnabled} />}
      {locationHelpOpen && <LocationRecoveryDialog onClose={() => setLocationHelpOpen(false)} onRetry={retryPreciseLocation} onUseDemo={useDemoLocation} permissionState={locationPermission} recoveryMessage={locationRecoveryMessage} />}
      {areaSearchOpen && <SearchAreaDialog currentArea={activeSearchArea} recentLocations={locationHistory} userLocation={userLocation} locationStatus={locationStatus} branchList={operationalBranches} onClose={() => setAreaSearchOpen(false)} onSelect={selectSearchArea} onUseMyLocation={useMyPositionForSearch} />}
      {lowDataOpen && <LowDataAccessDialog profile={profile} onClose={() => setLowDataOpen(false)} onSend={notify} />}
      {profileEditorOpen && <EditProfileDialog profile={profile} onClose={() => setProfileEditorOpen(false)} onSave={saveProfile} />}
      {appSettingsOpen && <AppSettingsDialog settings={appSettings} onClose={() => setAppSettingsOpen(false)} onSave={saveAppSettings} />}
      {sheet === "branch" && chosen && <BranchSheet branch={chosen.branch} initialService={chosen.service} onClose={() => setSheet(null)} onContinue={(service) => { setChosen({ ...chosen, service }); setSheet("confirm"); }} onFallback={(service) => { setChosen({ ...chosen, service }); setSheet("fallback"); }} />}
      {sheet === "confirm" && chosen && <JoinConfirmation branch={chosen.branch} service={chosen.service} onBack={() => setSheet("branch")} onConfirm={confirmQueue} />}
      {sheet === "fallback" && chosen && <FallbackDialog branch={chosen.branch} service={chosen.service} branchList={operationalBranches} onClose={() => setSheet(null)} onBook={bookAppointment} onChooseAlternative={chooseAlternative} />}

      {toast && <div className="toast" role="status"><span><BellRing size={20} /></span><div><strong>{toast.title}</strong><small>{toast.body}</small></div><IconButton label="Dismiss notification" onClick={() => setToast(null)}><X size={17} /></IconButton></div>}
    </div>
  );
}
