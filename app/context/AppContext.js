"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import usePersistentState from "../hooks/usePersistentState";
import {
  defaultAppSettings,
  defaultSearchArea,
  demoLocation,
  searchRadiusKm,
} from "../lib/data";
import { branchJoinState, branchesNear } from "../lib/queue";
import { toastManager } from "../components/ui/toast";

const AppContext = createContext(null);

const POLL_MS = 10000;

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

export function AppProvider({ children }) {
  // --- auth + live server state ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stateLoading, setStateLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [completedVisits, setCompletedVisits] = useState([]);
  const [totalSavedMinutes, setTotalSavedMinutes] = useState(0);

  // --- local UI state ---
  const [view, setView] = useState("home");
  const [sheet, setSheet] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationPermission, setLocationPermission] = useState("unknown");
  const [userLocation, setUserLocation] = useState(null);
  const [locationHelpOpen, setLocationHelpOpen] = useState(false);
  const [locationRecoveryMessage, setLocationRecoveryMessage] = useState("");
  const [areaSearchOpen, setAreaSearchOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [appSettingsOpen, setAppSettingsOpen] = useState(false);
  const [lowDataOpen, setLowDataOpen] = useState(false);

  // --- per-device preferences (persisted on this device) ---
  const [queuePrefs, setQueuePrefs] = usePersistentState(
    "queueless-queue-preferences",
    { sms: true, lowWait: true },
  );
  const [searchArea, setSearchArea] = usePersistentState(
    "queueless-search-area",
    defaultSearchArea,
    { validate: (parsed) => Number.isFinite(parsed?.latitude) && Number.isFinite(parsed?.longitude) },
  );
  const [locationHistory, setLocationHistory] = usePersistentState(
    "queueless-location-history",
    [],
    { validate: (parsed) => Array.isArray(parsed) },
  );
  const [appSettings, setAppSettings] = usePersistentState(
    "queueless-app-settings",
    defaultAppSettings,
    { deserialize: (raw) => ({ ...defaultAppSettings, ...JSON.parse(raw) }) },
  );
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState(
    "queueless-sidebar-collapsed",
    false,
    { serialize: (value) => String(value), deserialize: (raw) => raw === "true" },
  );

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
  const audioContextRef = useRef(null);
  const locationWatchRef = useRef(null);
  const locationFirstFixRef = useRef(false);
  const userRef = useRef(null);
  userRef.current = user;
  // Once the user dismisses the location-recovery dialog, stop re-opening it
  // automatically on later GPS failures until they explicitly retry.
  const recoveryDismissedRef = useRef(false);

  // --- live state polling ---
  async function fetchState() {
    try {
      const response = await fetch("/api/state");
      if (response.status === 401) {
        setUser(null);
        return;
      }
      if (!response.ok) return;
      const data = await response.json();
      setUser(data.user);
      setBranches(data.branches || []);
      setTicket(data.ticket || null);
      setNotifications(data.notifications || []);
      setAppointment(data.appointment || null);
      setCompletedVisits(data.visits || []);
      setTotalSavedMinutes(data.totalSavedMinutes || 0);
    } catch {
      // Offline or restarting server: keep showing the last known state.
    }
  }

  useEffect(() => {
    let active = true;
    async function boot() {
      await fetchState();
      if (!active) return;
      // Branch users land straight in their console; citizens in the explorer.
      const bootUser = userRef.current;
      if (bootUser?.role === "ADMIN") setView("admin");
      else if (bootUser?.role === "STAFF") setView("staff");
      setStateLoading(false);
      setAuthLoading(false);
    }
    boot();
    const timer = window.setInterval(() => {
      if (userRef.current && document.visibilityState === "visible") fetchState();
    }, POLL_MS);
    const handleVisible = () => {
      if (userRef.current && document.visibilityState === "visible") fetchState();
    };
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    window.location.href = "/login";
  }

  // --- derived state ---
  const operationalBranches = useMemo(() => branches.map((branch) => ({
    ...branch,
    status: branch.operationalStatus === "closed"
      ? "Closed"
      : branch.operationalStatus === "paused" || !branch.virtualJoins
        ? "Joins paused"
        : branch.wait <= 20 ? "Low wait" : branch.wait <= 35 ? "Moderate" : "Busy now",
  })), [branches]);

  const activeSearchArea = useMemo(() => searchArea.source === "gps" && userLocation
    ? { ...searchArea, latitude: userLocation.latitude, longitude: userLocation.longitude }
    : searchArea, [searchArea, userLocation]);

  const profile = user
    ? { name: user.name || "", phone: user.phone, city: user.city || "Johannesburg", province: user.province || "Gauteng", avatar: user.avatar || "" }
    : { name: "", phone: "", city: "Johannesburg", province: "Gauteng", avatar: "" };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  // --- audio + toasts ---
  useEffect(() => () => {
    if (locationWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
    }
    if (audioContextRef.current) audioContextRef.current.close();
  }, []);

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

  // Transient feedback via the in-house toast stack; durable notifications live
  // on the server. Plain React state under the hood — safe to call anywhere.
  function notify(title, body, type = "queue") {
    const toastType = type === "queue" ? "success" : "info";
    playNotificationSound();
    toastManager.add({ title, description: body, type: toastType });
  }

  async function markNotificationsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    }).catch(() => {});
  }

  function openNotifications() {
    setNotificationsOpen(true);
    if (unreadCount) markNotificationsRead();
  }

  async function clearNotifications() {
    setNotifications([]);
    await fetch("/api/notifications", { method: "DELETE" }).catch(() => {});
  }

  // --- location ---
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
        : `No centres are within ${searchRadiusKm} km of ${nextArea.label} yet.`,
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
      if (!recoveryDismissedRef.current) setLocationHelpOpen(true);
      notify("Location unavailable", "This browser does not support precise location.", "location");
      return;
    }
    const permissionState = await getLocationPermissionState();
    if (permissionState === "denied") {
      setLocationStatus("denied");
      setLocationRecoveryMessage("Location is still set to Block for this site. Change it to Allow, then press the button again.");
      if (!recoveryDismissedRef.current) setLocationHelpOpen(true);
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
        if (!recoveryDismissedRef.current) setLocationHelpOpen(true);
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
    recoveryDismissedRef.current = false;
    requestPreciseLocation();
  }

  function dismissLocationHelp() {
    recoveryDismissedRef.current = true;
    setLocationHelpOpen(false);
  }

  async function retryPreciseLocation() {
    primeAudio();
    recoveryDismissedRef.current = false;
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
    recoveryDismissedRef.current = true;
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

  // --- profile + settings ---
  async function saveProfile(nextProfile) {
    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextProfile.name,
        city: nextProfile.city,
        province: nextProfile.province,
        avatar: nextProfile.avatar || "",
      }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok && payload?.user) {
      setUser(payload.user);
      setProfileEditorOpen(false);
      notify("Profile updated", "Your QueueLess details have been saved.", "info");
    } else {
      notify("Could not save profile", payload?.error || "Check your connection and try again.", "info");
    }
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
    notify(item.name, `${item.service} · ${item.date} · ${Math.round(item.savedMinutes || 0)} min saved`, "info");
  }

  // --- queue flow (server-backed) ---
  function openBranch(branch) {
    setChosen({ branch, service: branch.services[0].name });
    setSheet("branch");
  }

  async function confirmQueue() {
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
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId: chosen.branch.id, serviceName: chosen.service }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (!response?.ok) {
      setSheet(null);
      notify("Could not join the queue", payload?.error || "Check your connection and try again.");
      return;
    }
    setSheet(null);
    setView("ticket");
    window.scrollTo({ top: 0, behavior: "instant" });
    await fetchState();
    notify(`You’re in queue ${payload.ticket.code}`, "We’ll notify you when it’s time to leave.");
  }

  async function advanceQueue() {
    if (!ticket || ticket.status !== "WAITING") return;
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "call" }),
    }).catch(() => null);
    if (response?.ok) {
      await fetchState();
      notify("You’re next", "Check in when you reach the branch.");
    } else {
      notify("Could not advance the queue", "Try again in a moment.");
    }
  }

  async function checkIn() {
    if (!ticket) return;
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check-in" }),
    }).catch(() => null);
    if (response?.ok) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      await fetchState();
      notify("Check-in confirmed", `The branch is ready for ticket ${ticket.code}.`);
    } else {
      notify("Could not check in", "Try again in a moment.");
    }
  }

  async function completeQueue() {
    if (!ticket) return;
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      setTicket(null);
      setView("activity");
      window.scrollTo({ top: 0, behavior: "smooth" });
      await fetchState();
      notify("Service completed", `${payload?.ticket?.branch?.name || "The branch"} has been added to your Activity.`);
    } else {
      notify("Could not complete the visit", payload?.error || "Try again in a moment.");
    }
  }

  async function cancelQueue() {
    if (!ticket) return;
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    }).catch(() => {});
    setTicket(null);
    setView("home");
    window.scrollTo({ top: 0, behavior: "instant" });
    await fetchState();
    notify("You left the queue", "Your place has been released.");
  }

  function navigate(nextView) {
    setView(nextView);
    setSheet(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- staff console (server-backed) ---
  async function saveBranchSettings(branchId, settings) {
    const response = await fetch("/api/staff/branch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId, ...settings }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      await fetchState();
      const branch = branches.find((item) => item.id === branchId);
      notify("Live branch update published", `${branch?.name || "The branch"} now shows the new settings on citizen screens.`, "info");
      return true;
    }
    notify("Could not publish the update", payload?.error || "Check your connection and try again.", "info");
    return false;
  }

  /** Return the operations demo to its opening state (queue, appointments, branches). */
  async function resetDemo() {
    const response = await fetch("/api/demo/reset", { method: "POST" }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      await fetchState();
      notify("Demo data reset", payload?.message || "The queue, appointments, and branch settings are back to baseline.", "info");
      return true;
    }
    notify("Could not reset the demo data", payload?.error || "Try again in a moment.", "info");
    return false;
  }


  async function staffTicketAction(ticketId, action) {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      await fetchState();
      return true;
    }
    notify("That action did not go through", payload?.error || "The queue may have changed — try again.", "info");
    return false;
  }

  // --- admin branch management (server-backed) ---
  async function adminCreateBranch(draft) {
    const response = await fetch("/api/admin/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      await fetchState();
      notify("Branch created", `${payload?.branch?.name || "The new branch"} is now live on the map.`, "info");
      return true;
    }
    notify("Could not create the branch", payload?.error || "Check the details and try again.", "info");
    return false;
  }

  async function adminUpdateBranch(branchId, draft) {
    const response = await fetch(`/api/admin/branches/${branchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      await fetchState();
      notify("Branch updated", "The new branch details are live across the network.", "info");
      return true;
    }
    notify("Could not update the branch", payload?.error || "Check the details and try again.", "info");
    return false;
  }

  async function adminDeleteBranch(branchId) {
    const response = await fetch(`/api/admin/branches/${branchId}`, { method: "DELETE" }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      await fetchState();
      notify("Branch removed", "The centre has been retired from the network.", "info");
      return true;
    }
    notify("Could not remove the branch", payload?.error || "Try again in a moment.", "info");
    return false;
  }

  async function bookAppointment(nextAppointment) {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId: nextAppointment.branch.id,
        serviceName: nextAppointment.service,
        day: nextAppointment.day,
        time: nextAppointment.time,
      }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (response?.ok) {
      setSheet(null);
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      await fetchState();
      const when = new Date(payload.appointment.slotAt);
      notify(
        "Appointment confirmed",
        `${when.toLocaleDateString("en-ZA", { weekday: "long" })} at ${when.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })} · ${nextAppointment.branch.name}.`,
      );
    } else {
      notify("Could not book the appointment", payload?.error || "Try again in a moment.");
    }
  }

  function chooseAlternative(branch) {
    setChosen({ branch, service: branch.services[0].name });
    setSheet("branch");
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => !current);
  }

  const value = {
    view, setView,
    sheet, setSheet,
    chosen, setChosen,
    ticket,
    notifications,
    notificationsOpen, setNotificationsOpen,
    unreadCount,
    openNotifications,
    clearNotifications,
    soundEnabled, setSoundEnabled,
    queuePrefs, setQueuePrefs,
    locationStatus,
    locationPermission,
    userLocation,
    locationHelpOpen, setLocationHelpOpen, dismissLocationHelp,
    locationRecoveryMessage,
    areaSearchOpen, setAreaSearchOpen,
    searchArea,
    locationHistory,
    profile,
    profileEditorOpen, setProfileEditorOpen,
    appSettings, setAppSettings,
    appSettingsOpen, setAppSettingsOpen,
    lowDataOpen, setLowDataOpen,
    appointment,
    completedVisits,
    totalSavedMinutes,
    demoMode,
    sidebarCollapsed, toggleSidebar,
    user, authLoading, stateLoading, logout,
    operationalBranches,
    activeSearchArea,
    primeAudio,
    notify,
    fetchState,
    selectSearchArea,
    useMyPositionForSearch,
    requestPreciseLocation,
    handleLocationControl,
    retryPreciseLocation,
    useDemoLocation,
    pauseLocationTracking,
    saveProfile,
    saveAppSettings,
    updatePreference,
    openVisit,
    openBranch,
    confirmQueue,
    advanceQueue,
    checkIn,
    completeQueue,
    cancelQueue,
    navigate,
    saveBranchSettings,
    staffTicketAction,
    resetDemo,
    adminCreateBranch,
    adminUpdateBranch,
    adminDeleteBranch,
    bookAppointment,
    chooseAlternative,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
