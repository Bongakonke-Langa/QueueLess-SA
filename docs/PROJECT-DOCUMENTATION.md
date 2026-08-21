# QueueLess SA: Final Product And Technical Documentation

## 1. Problem

People can lose hours or a full working day at Home Affairs offices, clinics, banks, and other service centres. Before travelling, they often cannot see congestion, expected waiting time, service availability, or whether they will be served that day. The result is lost income, overcrowding, unnecessary travel, and people leaving unserved.

**Design question:** How might we give people back the time they lose waiting in queues?

## 2. Solution

QueueLess SA is an inclusive queue operating system for citizens and service centres.

- Citizens search any South African area, compare verified queue conditions, join remotely, travel close to their turn, and record the completed visit in Activity.
- Branch staff publish queue length, estimated wait, counter capacity, closures, service availability, and access rules.
- When a queue cannot accept another person, the system offers a bookable arrival window or the next-nearest open branch.
- People without mobile data can use simulated SMS, WhatsApp, or USSD channels.

The prototype separates a user's device position from the area they choose to search. A person can therefore find services near their current GPS position or plan ahead for another suburb or city.

## 3. Implemented Citizen Experience

### Service discovery

- Home Affairs, public clinic, and bank categories.
- Search by branch, address, or service type.
- Live South African place search through OpenStreetMap Nominatim.
- Popular judging locations for Randburg, Sandton, Soweto, Pretoria, Cape Town, and Durban.
- Twenty-two synthetic service centres across five metropolitan areas.
- Nearby filtering within a 35 km radius.
- Distance and travel-time recalculation from the selected search area.
- Staff verification timestamps on maps, branch cards, and branch details.

### Map and location intelligence

- Interactive Leaflet map with OpenStreetMap tiles and attribution.
- Queue markers showing service type and estimated wait.
- Separate markers for the service search area and user position.
- GPS accuracy circle and location freshness indicators.
- High-accuracy browser GPS with pause and resume controls.
- Permission recovery instructions and a clearly labelled demo position.
- Branch popups, zoom controls, and Google Maps directions.

### Virtual queue journey

- Branch details with queue size, capacity, wait, closing time, travel estimate, and service availability.
- Service selection, confirmation, and active queue ticket.
- Queue progression simulator for a reliable hackathon demonstration.
- Sound-enabled leave-now and next-in-line notifications.
- Arrival check-in, service completion with an Activity record, and queue cancellation.
- One active ticket per person in the prototype.
- Configurable arrival grace period and automatic no-show release policy.

### Capacity and appointment fallback

- Branches can be open, paused, or closed.
- Virtual joining can be switched off independently.
- Capacity limits prevent another remote join when a queue is full.
- Closed and limited branches are visibly labelled in citizen results.
- Citizens can book a simulated arrival window.
- Alternatives are ranked by geographic distance and show live wait and verification time.

### Low-data access

- SMS demo returns nearby branches and numbered join options.
- WhatsApp demo shows a conversational branch search and join flow.
- USSD demo uses `*120*7537#` and works without mobile data in the concept.
- Staff can trigger demo status messages for all three channels.

### Notifications, accessibility, and profile

- Clickable notification centre with unread states and a clear action.
- Web Audio two-tone alerts after browser interaction.
- Large-text, high-contrast, and reduced-motion settings.
- Mobile, tablet, and desktop responsive layouts.
- Editable profile details and browser-side avatar crop/compression.
- Collapsible desktop sidebar with a preference saved on the device.

## 4. Staff Operations Console

The **Staff demo** view proves where trusted queue data can come from.

Staff can:

- Select any branch in the synthetic network.
- Publish open, paused, or closed operating status.
- Adjust estimated wait, people waiting, open counters, and capacity.
- Enable or disable virtual joining and priority assistance.
- Set an arrival grace period.
- Mark individual services available or unavailable.
- Preview exactly what a citizen will see before publishing.
- Review demonstration metrics for people served, active counters, queue movement, and citizen time returned.
- Reset the full operations demo to baseline data.

Published updates are stored locally and immediately update the citizen map, cards, branch details, verification time, and join eligibility.

## 5. Architecture

### Application flow

```text
Citizen or staff action
        |
        v
React application state
        |
        +--> Citizen discovery, map, ticket, appointments, alerts
        |
        +--> Staff operations and shared branch conditions
        |
        +--> localStorage persistence for device-level demo state
        |
        +--> Next.js /api/geocode proxy --> Nominatim Search API
```

### Live geocoding

The browser calls the local route:

```text
GET /api/geocode?q=Pretoria
```

The Next.js route validates the query and requests:

```text
https://nominatim.openstreetmap.org/search
```

The request uses JSON output, address details, a South Africa country filter, a five-result limit, a QueueLess SA user agent, response caching, and provider request pacing. Searches run only when the user presses **Search**.

The public Nominatim instance is suitable only for this low-volume prototype. A production pilot should use a managed provider or self-hosted deployment.

## 6. Technology And Tools

| Tool | Purpose |
| --- | --- |
| Next.js 15 | Application framework, production build, and geocoding route |
| React 18 | Citizen and staff state, queue simulation, dialogs, and persistence |
| Leaflet 1.9 | Interactive map, markers, popups, bounds, and location circles |
| OpenStreetMap | Map tiles and geographic attribution |
| Nominatim Search API | Live South African place geocoding |
| Browser Geolocation API | High-accuracy user position updates |
| Permissions API | Location permission state and recovery detection |
| Web Audio API | Notification tones without an audio asset dependency |
| Google Maps directions URL | Turn-by-turn navigation in a new tab |
| localStorage | Profile, accessibility, search, history, staff updates, and sidebar preference |
| Canvas API | Profile-photo crop and compression |
| Lucide React | Familiar and accessible interface icons |
| PowerPoint artifact tooling | Editable judging presentation and rendered QA |
| Codex browser testing | Responsive, persistence, live API, and end-to-end verification |

## 7. Data, Trust, And Privacy

- GPS and selected search area are separate concepts.
- GPS is requested only through browser permission.
- Pausing GPS stops the active watch and keeps the last known position visible.
- Search history and prototype operational state stay in the current browser.
- Verification timestamps tell citizens when branch conditions were last published.
- One-ticket, grace-period, and auto-release rules reduce remote queue abuse.
- No account, ID number, GPS trail, or queue record is sent to a QueueLess SA production backend because this prototype has no production backend.
- Branch names, waits, queue counts, impact metrics, appointments, and completed visits are demonstration data.

## 8. Final Verification

Completed on the production build at `http://127.0.0.1:3000/`:

- `npm run build` compiles, lints, validates, and generates all application routes.
- Sidebar collapse, expansion, content resizing, and reload persistence pass on desktop.
- Mobile bottom navigation remains unchanged at 390 x 844.
- Staff updates immediately appear on citizen cards with a fresh verification time.
- Closed branches prevent queue joining and open appointment and alternative options.
- Appointment confirmation creates an upcoming-appointment banner.
- SMS, WhatsApp, and USSD demo actions produce responses and notifications.
- Live Nominatim search returns South African results.
- Area search guides result selection, clears stale service filters, and distinguishes a successful location update from unavailable demo-network coverage.
- Blocked GPS opens recovery guidance; the demo position appears separately on the map.
- A normal virtual queue can be joined, advanced, directed to Google Maps, checked in, completed, and recorded in Activity.
- Leave-now, next, check-in, service-completion, sound state, notification centre, and clear actions pass.
- Profile editor, avatar control, and accessibility settings open and remain functional.
- Temporary judging state can be cleared through **Reset demo data** and page reload.

## 9. Golden Judging Demo

1. Start on **Explore** and point out verified waits, the map, search area, GPS status, and low-data entry.
2. Join **Ubuntu Bank Church Square** and confirm the virtual ticket.
3. Press **Advance queue** three times to trigger the leave-now and next-in-line alerts.
4. Press **I’m at the branch**, then **Mark service complete**.
5. Show the new Activity visit, updated completion count, updated time-saved total, and released active ticket.
6. Open **Staff demo**, choose **Pretoria Home Affairs**, set it to **Closed**, and publish.
7. Press **Citizen app** and show **Closed - just now** on the branch result.
8. Open the branch, choose **Appointments and alternatives**, and confirm tomorrow at 09:30.
9. Open **No mobile data?** and demonstrate the USSD menu.
10. Before any second demo, return to **Staff demo**, press **Reset demo data**, and reload.

Reliable fallback: if GPS permission is blocked, use **Use demo position**. If internet is unavailable, select one of the built-in popular areas instead of live geocoding.

## 10. Judging Alignment

| Criterion | Evidence |
| --- | --- |
| Impact | Returns productive time, reduces unnecessary crowding and travel, and helps fewer people leave unserved |
| Working demo | Citizen, staff, map, full ticket lifecycle, Activity impact, appointment, alert, directions, accessibility, and low-data flows run live |
| Creativity | Two-sided operations, verified data, fair-queue rules, appointments, and basic-phone access extend beyond a typical virtual queue |
| Presentation | A short golden path demonstrates cause, response, citizen outcome, inclusion, and measurable pilot potential |

## 11. Prototype Boundaries

- Branch queue information and impact metrics are simulated.
- Production SMS, WhatsApp, and USSD providers are represented by interactive demos, not external messaging integrations.
- There is no production identity, authentication, database, or branch ticketing integration.
- The synthetic network is not a complete directory of South African service centres.
- GPS depends on device services and browser permission.
- Public map and geocoding services require internet access and production-scale replacements.

## 12. Production Pilot Roadmap

1. Connect one branch ticketing system or staff-authenticated queue feed.
2. Add secure citizen and operator identity with consent and audit logs.
3. Integrate a South African SMS/USSD provider and an approved WhatsApp Business flow.
4. Pilot one high-volume service centre with staff training and clear fallback procedures.
5. Measure waiting time, physical occupancy, abandonment, no-shows, people served, and citizen time returned.
6. Add multilingual access beginning with the languages most used in the pilot area.
7. Expand only after the pilot proves data quality, inclusion, and operational value.

## 13. Local Commands

```bash
npm install
npm run dev
npm run build
npm run start
```

Default URL: `http://127.0.0.1:3000/`

## 14. External Service References

- Nominatim Search API: https://nominatim.org/release-docs/latest/api/Search/
- Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
- OpenStreetMap attribution: https://www.openstreetmap.org/copyright
