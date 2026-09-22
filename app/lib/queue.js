import { branches, searchRadiusKm } from "./data";

export function distanceBetween(latitudeA, longitudeA, latitudeB, longitudeB) {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB))
    * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function withLiveDistance(branch, userLocation) {
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

export function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "QL";
}

export function branchesNear(location, branchList = branches) {
  if (!location) return [];
  return branchList.filter((branch) => distanceBetween(
    location.latitude,
    location.longitude,
    branch.latitude,
    branch.longitude,
  ) <= searchRadiusKm);
}

export function formatBranchFreshness(branch, now = Date.now()) {
  if (branch.updatedAt) {
    const minutes = Math.max(0, Math.floor((now - branch.updatedAt) / 60000));
    if (minutes === 0) return "just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} min ago`;
  }
  return `${branch.updatedMinutes || 1} min ago`;
}

export function branchJoinState(branch) {
  if (branch.operationalStatus === "closed") return { canJoin: false, reason: "Branch closed", detail: "Book a time or choose another centre." };
  if (branch.operationalStatus === "paused") return { canJoin: false, reason: "Virtual queue paused", detail: "The branch is clearing its current queue." };
  if (!branch.virtualJoins) return { canJoin: false, reason: "Online joins are paused", detail: "Book a time or use a nearby branch." };
  if (branch.people >= branch.capacity) return { canJoin: false, reason: "Queue at capacity", detail: "Choose an appointment or a quieter branch." };
  return { canJoin: true, reason: "Open for virtual joins", detail: `${Math.max(branch.capacity - branch.people, 0)} places available` };
}

export function formatSearchTime(timestamp) {
  if (!timestamp) return "Recently";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatTime(minutesFromNow) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutesFromNow);
  return now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatSavedDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatLocationFreshness(updatedAt, now) {
  if (!updatedAt) return "Waiting";
  const seconds = Math.max(0, Math.round((now - updatedAt) / 1000));
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

export function relativeTime(ms, now = Date.now()) {
  if (!ms) return "";
  const minutes = Math.floor(Math.max(0, now - ms) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(ms).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

export function getDirectionsUrl(branch, userLocation) {
  const destination = `${branch.name}, ${branch.address}, Johannesburg, South Africa`;
  const origin = userLocation
    ? `&origin=${encodeURIComponent(`${userLocation.latitude},${userLocation.longitude}`)}`
    : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${origin}&travelmode=driving&dir_action=navigate`;
}
