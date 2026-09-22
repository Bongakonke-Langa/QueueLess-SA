"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { defaultSearchArea, searchRadiusKm } from "../lib/data";
import { formatBranchFreshness } from "../lib/queue";

export default function ServiceMap({ visibleBranches, selectedId, onSelect, onRequestLocation, locationStatus, userLocation, searchArea, lowDataMode }) {
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
        crossOrigin: true,
        ...(lowDataMode && { attribution: false }),
      });
      tiles.on("load", () => setTileStatus("ready"));
      tiles.on("tileerror", () => setTileStatus((current) => current === "loading" ? "error" : current));
      tiles.addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.setView([defaultSearchArea.latitude, defaultSearchArea.longitude], 11, { animate: false });
      if (lowDataMode) {
        setMapReady(true);
        setTileStatus("skipped");
        return;
      }
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
