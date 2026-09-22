"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  CircleUserRound,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { branchTypeIcon, serviceCatalogue } from "../lib/data";
import Dialog from "./Dialog";
import NumberControl from "./NumberControl";
import { IconButton } from "./ui";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "./ui/select";

const typeOptions = [
  { label: "Home Affairs", value: "home-affairs" },
  { label: "Clinic", value: "clinic" },
  { label: "Bank", value: "bank" },
];

function blankDraft() {
  return {
    name: "",
    type: "home-affairs",
    address: "",
    latitude: null,
    longitude: null,
    closes: serviceCatalogue["home-affairs"].closes,
    wait: 15,
    counters: 4,
    capacity: 32,
    services: serviceCatalogue["home-affairs"].services.map((service) => ({ ...service })),
  };
}

function draftFromBranch(branch) {
  return {
    name: branch.name,
    type: branch.type,
    address: branch.address,
    latitude: branch.latitude,
    longitude: branch.longitude,
    closes: branch.closes,
    wait: branch.wait,
    counters: branch.counters,
    capacity: branch.capacity,
    services: branch.services.map((service) => ({ name: service.name, duration: service.duration })),
  };
}

export default function AdminView({ branchList, onCreateBranch, onUpdateBranch, onDeleteBranch, onCitizenView }) {
  const [editing, setEditing] = useState(null); // null | { branchId, draft }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function saveDraft() {
    setSaving(true);
    const ok = editing.branchId
      ? await onUpdateBranch(editing.branchId, editing.draft)
      : await onCreateBranch(editing.draft);
    setSaving(false);
    if (ok) setEditing(null);
  }

  async function removeBranch(branch) {
    const ok = await onDeleteBranch(branch.id);
    if (ok) setConfirmDeleteId(null);
  }

  return (
    <main className="staff-view admin-view view-enter">
      <section className="staff-heading">
        <div>
          <p className="eyebrow">NETWORK ADMINISTRATION</p>
          <h1>Manage branches</h1>
          <p>Add, update or retire QueueLess centres — changes reach every citizen’s map instantly.</p>
        </div>
        <div className="staff-heading-actions">
          <button className="secondary-button" onClick={onCitizenView}><CircleUserRound size={18} /> Citizen app</button>
          <button className="primary-button" onClick={() => setEditing({ branchId: null, draft: blankDraft() })}><Plus size={18} /> Add branch</button>
        </div>
      </section>

      <section className="admin-table" aria-label="Branch network">
        <div className="admin-table-head"><span>Branch</span><span>Type</span><span>Hours</span><span>Live queue</span><span>Services</span><span /></div>
        {branchList.map((branch) => {
          const Icon = branchTypeIcon(branch.type);
          const deleting = confirmDeleteId === branch.id;
          return (
            <div key={branch.id} className="admin-table-row">
              <span className="admin-branch-cell">
                <span className={`branch-icon ${branch.accent}`}><Icon size={19} /></span>
                <span className="admin-branch-copy"><strong>{branch.name}</strong><small>{branch.address}</small></span>
              </span>
              <span className="admin-chip">{typeOptions.find((t) => t.value === branch.type)?.label || branch.type}</span>
              <span className="admin-hours">Until {branch.closes}</span>
              <span className="admin-queue-cell">
                <strong>{branch.people}/{branch.capacity}</strong>
                <i className={`queue-chip ${branch.operationalStatus === "closed" ? "off" : branch.status === "Low wait" ? "waiting" : "called"}`}>{branch.operationalStatus === "closed" ? "Closed" : branch.status}</i>
              </span>
              <span className="admin-services-count">{branch.services.length}</span>
              <span className="admin-row-actions">
                <IconButton label={`Edit ${branch.name}`} onClick={() => setEditing({ branchId: branch.id, draft: draftFromBranch(branch) })}><Pencil size={16} /></IconButton>
                {deleting ? (
                  <span className="admin-confirm-delete">
                    <button className="staff-action quiet" onClick={() => removeBranch(branch)}><Trash2 size={14} /> Confirm delete</button>
                    <IconButton label="Cancel delete" onClick={() => setConfirmDeleteId(null)}><X size={15} /></IconButton>
                  </span>
                ) : (
                  <IconButton label={`Delete ${branch.name}`} onClick={() => setConfirmDeleteId(branch.id)}><Trash2 size={16} /></IconButton>
                )}
              </span>
            </div>
          );
        })}
      </section>

      {editing && (
        <BranchEditor
          isNew={!editing.branchId}
          draft={editing.draft}
          saving={saving}
          onChange={(next) => setEditing((current) => ({ ...current, draft: next }))}
          onSave={saveDraft}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}

function BranchEditor({ isNew, draft, saving, onChange, onSave, onClose }) {
  const [geoQuery, setGeoQuery] = useState("");
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  function update(field, value) {
    onChange({ ...draft, [field]: value });
  }

  function changeType(type) {
    update("type", type);
    update("closes", serviceCatalogue[type].closes);
  }

  function useStandardServices() {
    update("services", serviceCatalogue[draft.type].services.map((service) => ({ ...service })));
  }

  function updateService(index, field, value) {
    update("services", draft.services.map((service, i) => (i === index ? { ...service, [field]: value } : service)));
  }

  async function searchLocation(event) {
    event.preventDefault();
    if (geoQuery.trim().length < 3) {
      setGeoError("Type at least a street and town, e.g. 'Rivonia Road Sandton'.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(geoQuery.trim())}`);
      const payload = await response.json();
      if (!response.ok) {
        setGeoError(payload?.error || "Location search failed. Try again.");
        setGeoResults([]);
      } else {
        setGeoResults(payload.results || []);
        if (!payload.results?.length) setGeoError("No South African places matched that search.");
      }
    } catch {
      setGeoError("Location search failed. Check your connection.");
    }
    setGeoLoading(false);
  }

  function pickPlace(place) {
    onChange({
      ...draft,
      address: `${place.label}, ${place.secondary}`,
      latitude: place.latitude,
      longitude: place.longitude,
    });
    setGeoResults([]);
    setGeoQuery("");
    setGeoError("");
  }

  const coordinatesSet = Number.isFinite(draft.latitude) && Number.isFinite(draft.longitude);

  return (
    <Dialog layerClassName="sheet-layer admin-editor-layer" sectionClassName="admin-editor" labelledBy="admin-editor-title" onClose={onClose}>
      <header className="profile-editor-header">
        <div><p className="eyebrow">{isNew ? "NEW CENTRE" : "EDIT CENTRE"}</p><h2 id="admin-editor-title">{isNew ? "Add a branch" : `Edit ${draft.name || "branch"}`}</h2></div>
        <IconButton label="Close branch editor" onClick={onClose}><X size={20} /></IconButton>
      </header>

      <form
        className="admin-editor-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className="admin-editor-grid">
          <label><span>Branch name</span><input value={draft.name} onChange={(event) => update("name", event.target.value)} required minLength={3} maxLength={80} placeholder="e.g. Midrand Home Affairs" /></label>
          <label><span>Branch type</span>
            <Select items={typeOptions} value={draft.type} onValueChange={changeType}>
              <SelectTrigger aria-label="Branch type"><SelectValue /></SelectTrigger>
              <SelectPopup>{typeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectPopup>
            </Select>
          </label>
          <label className="admin-time-field"><span>Closing time</span><input type="time" value={draft.closes} onChange={(event) => update("closes", event.target.value)} required /></label>
          <NumberControl label="Opening wait estimate" value={draft.wait} min={0} max={120} suffix=" min" onChange={(value) => update("wait", value)} />
          <NumberControl label="Counters" value={draft.counters} min={1} max={12} onChange={(value) => update("counters", value)} />
          <NumberControl label="Queue capacity" value={draft.capacity} min={5} max={150} onChange={(value) => update("capacity", value)} />
        </div>

        <div className="admin-editor-location">
          <label><span>Address</span><input value={draft.address} onChange={(event) => update("address", event.target.value)} required minLength={3} maxLength={140} placeholder="Street and town" /></label>
          <div className="admin-geo-search">
            <input value={geoQuery} onChange={(event) => setGeoQuery(event.target.value)} placeholder="Search OpenStreetMap to pin the location…" aria-label="Search location" />
            <button type="button" className="secondary-button" onClick={searchLocation} disabled={geoLoading}>
              {geoLoading ? <Loader2 size={17} className="spin" /> : <Search size={17} />} Find
            </button>
          </div>
          {geoError && <p className="admin-geo-error" role="alert">{geoError}</p>}
          {geoResults.length > 0 && (
            <ul className="admin-geo-results">
              {geoResults.map((place) => (
                <li key={place.id}>
                  <button type="button" onClick={() => pickPlace(place)}>
                    <MapPin size={15} />
                    <span><strong>{place.label}</strong><small>{place.secondary}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className={`admin-coordinates ${coordinatesSet ? "set" : ""}`}>
            <MapPin size={14} /> {coordinatesSet ? `Pinned at ${draft.latitude.toFixed(4)}, ${draft.longitude.toFixed(4)}` : "No map coordinates yet — use Find to pin this branch."}
          </p>
        </div>

        <div className="admin-services-editor">
          <div className="admin-services-editor-head">
            <div><h3>Services offered</h3><small>Each service can be toggled off per branch during operations</small></div>
            <button type="button" className="secondary-button" onClick={useStandardServices}><Check size={15} /> Use standard {typeOptions.find((t) => t.value === draft.type)?.label} set</button>
          </div>
          {draft.services.map((service, index) => (
            <div key={index} className="admin-service-row">
              <label><span>Service</span><input value={service.name} onChange={(event) => updateService(index, "name", event.target.value)} required minLength={2} maxLength={80} /></label>
              <label><span>Duration</span><input value={service.duration} onChange={(event) => updateService(index, "duration", event.target.value)} required minLength={2} maxLength={40} placeholder="e.g. 10 min per person" /></label>
              <IconButton
                label={`Remove ${service.name}`}
                onClick={() => update("services", draft.services.filter((_, i) => i !== index))}
                disabled={draft.services.length <= 1}
              >
                <Trash2 size={15} />
              </IconButton>
            </div>
          ))}
          {draft.services.length < 8 && (
            <button type="button" className="secondary-button" onClick={() => update("services", [...draft.services, { name: "", duration: "10 min per person" }])}><Plus size={15} /> Add service</button>
          )}
        </div>

        <div className="profile-editor-footer">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving || !coordinatesSet}>
            <Building2 size={18} /> {saving ? "Saving…" : isNew ? "Create branch" : "Save changes"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
