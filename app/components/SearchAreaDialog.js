"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight, History, LocateFixed, MapPin, Search, ShieldCheck, X } from "lucide-react";
import { popularSearchAreas } from "../lib/data";
import { branchesNear, formatSearchTime } from "../lib/queue";
import Dialog from "./Dialog";
import { IconButton } from "./ui";

export default function SearchAreaDialog({ currentArea, recentLocations, userLocation, locationStatus, branchList, onClose, onSelect, onUseMyLocation }) {
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
        ? "Location found. Select a result below to update the map and nearby services"
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
    <Dialog
      layerClassName="sheet-layer area-search-layer"
      sectionClassName="area-search-dialog"
      labelledBy="area-search-title"
      onClose={onClose}
    >
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
    </Dialog>
  );
}
