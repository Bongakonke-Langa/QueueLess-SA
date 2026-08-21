# QueueLess SA: Final Ten-Minute Presentation Runbook

## Core Message

QueueLess SA is not only a virtual ticket. It is an inclusive queue operating system that connects trusted branch conditions to better citizen decisions, including for people without mobile data.

## Timing At A Glance

| Time | Material | Purpose |
| --- | --- | --- |
| 0:00-0:40 | Slide 1 | Human hook and promise |
| 0:40-1:25 | Slide 2 | Problem and stakes |
| 1:25-2:05 | Slide 3 | Two-sided solution |
| 2:05-5:40 | Live demo | Prove the full citizen, staff, and inclusion workflow |
| 5:40-6:10 | Slide 4 | Summarise the complete queue journey |
| 6:10-6:40 | Slide 5 | Establish trusted data source |
| 6:40-7:10 | Slide 6 | Establish inclusive access |
| 7:10-7:40 | Slide 7 | Show location intelligence |
| 7:40-8:05 | Slide 8 | Explain the practical technology |
| 8:05-9:00 | Slide 9 | Pilot, measurement, and ask |
| 9:00-9:35 | Close | Return to the human outcome |
| 9:35-10:00 | Buffer | Transition to questions |

## Before Presenting

- Open `QueueLess-SA-FINAL-Hackathon-Presentation.pptx`. The shorter filename is now an identical compatibility copy.
- Confirm the app is open at `http://127.0.0.1:3000/`.
- Confirm the search area is Pretoria and the desktop sidebar is expanded.
- Open **Staff demo**, choose **Reset demo data**, then reload.
- Confirm no active queue or appointment banner is visible.
- Check device volume. The first click in the app enables browser audio.
- Keep PowerPoint and the browser as the only two presentation windows.
- Do not use live GPS or live geocoding in the core demo. They remain available for questions.

## Word-For-Word Story

### Slide 1: Give People Back Their Time

> Imagine waking up at 4 a.m. just to queue at Home Affairs, only to find hundreds of people already waiting. Some spend half the day there just to renew an ID or collect a document. QueueLess SA gives people back their time by allowing them to join a virtual queue, track their position in real time, and arrive only when they are about to be served.

### Slide 2: The Cost Starts Before Service

> The queue starts costing people before service begins. A person leaves work, school, or family responsibilities without knowing the waiting time, whether the service is available, or whether the branch will reach capacity. When too many people make the same blind trip, we get lost income, overcrowding, unnecessary travel, and people leaving unserved.

> The real problem is therefore not only a long queue. It is the absence of trusted information and a way to act on it.

### Slide 3: The Queue Becomes Visible

> QueueLess SA connects both sides of that problem. Citizens compare verified waits, services, capacity, distance, and travel time. Branch staff publish the operating conditions that citizens need. Both sides use the same branch state, and every update shows when it was verified.

> Let me show you the working system rather than describe it.

## Live Demo: 3 Minutes 35 Seconds

### 1. Establish The Citizen View

**Action:** Switch to the browser on **Explore**.

> This is the citizen dashboard. We are searching around Pretoria. The map, service list, verified timestamps, GPS state, and low-data entry are all visible before the user commits to a trip.

### 2. Complete A Citizen Visit

**Action:** Open **Ubuntu Bank Church Square** and choose **Join virtual queue**.

**Action:** Confirm, then press **Advance queue** three times.

> QueueLess keeps the citizen's place while they use their time elsewhere. The sound alerts tell them when to leave and when they are next.

**Action:** Press **I’m at the branch**, then **Mark service complete**.

> The active ticket is released, the completed visit moves into Activity, and the time-saved and completion totals update immediately. This closes the full queue lifecycle in the working demo.

### 3. Publish A Real Operational Change

**Action:** Open **Staff demo**.

> The important judging question is: where does the queue data come from? Here, an authorised branch operator can publish the wait, number of people, counters, capacity, closures, virtual-join status, grace period, and available services.

**Action:** Select **Pretoria Home Affairs**.

**Action:** Choose **Closed**.

**Action:** Press **Publish live update**.

**Important:** Pause for one second and point to the success notification before continuing.

> That update has now been published to the citizen experience.

### 4. Show The Citizen Outcome

**Action:** Press **Citizen app**.

> Pretoria Home Affairs now says closed, verified just now. QueueLess does not allow the citizen to take a place in a queue that cannot serve them.

**Action:** Open **Pretoria Home Affairs**.

**Action:** Select **Appointments and alternatives**.

> Instead of becoming a dead end, the closed branch offers a guaranteed arrival window and ranks the next open centres by distance, wait, and verification time.

**Action:** Confirm **Tomorrow at 09:30**.

> The citizen now has a confirmed plan rather than a wasted trip.

### 5. Prove Inclusion

**Action:** Open **No mobile data?**

**Action:** Select **USSD**, then **Dial demo code**.

**Action:** Choose **1 - Find services**.

> QueueLess is designed beyond smartphones. The same journey can be delivered through SMS, WhatsApp, or USSD, so limited data does not have to mean limited access.

**Action:** Close the dialog and return to PowerPoint.

## Slide 4: The Normal Virtual Queue

> When a branch is open, the journey is complete: the citizen joins remotely, hears the leave-now alert, navigates and checks in, then closes the ticket after service. Activity turns that completed visit into visible time returned. Fairness rules allow one active ticket and release unattended places after the branch's grace period.

## Slide 5: Staff Publish Live Conditions

> This staff console is what makes QueueLess operational rather than informational. It creates a visible source of truth, gives branches control, and lets staff preview what citizens will see before publishing. In production, this can connect to an existing ticketing feed or use authenticated staff updates where no modern ticketing system exists.

## Slide 6: QueueLess Works Without Data

> Inclusion is our creative angle. The smartphone app is the richest experience, but it is not the only door. SMS can return numbered options, WhatsApp can guide the conversation, and USSD can work without mobile data. The prototype demonstrates these interactions honestly; production messaging providers would be connected during the pilot.

## Slide 7: Search Areas Update Live

> Location is also flexible. The user's GPS position and chosen search area are separate. A person can search where they are, plan for another suburb, or use built-in locations when connectivity is weak. Live OpenStreetMap search recentres the map and recalculates nearby services and distances.

## Slide 8: Practical Technology

> Every technology supports something visible in the demo: Next.js and React run the application, Leaflet and OpenStreetMap power the map, Nominatim provides South African place search, browser geolocation and permissions manage location, Web Audio produces alerts, local storage preserves prototype state, and Google Maps provides directions.

> We chose a web prototype because it is quick to pilot across phones and desktops without requiring an app-store installation.

## Slide 9: Pilot And Ask

> The prototype proves the citizen journey and the branch operating model. The next step is not a national rollout. It is one measurable pilot.

> First, connect one trusted queue feed through ticketing data or authenticated staff updates. Second, launch at one high-volume branch with staff training and low-data access. Third, measure physical waiting time, crowding, abandonment, no-shows, people served, and total citizen hours returned.

> Our ask is one high-volume service centre and one pilot period to prove the operational and human value.

## Close

> That time goes back to work, family, education, and opportunity. Our ask is one high-volume service centre and one pilot period to prove the operational and human value.

> Our goal isn't just to reduce queues; it's to give South Africans back their time.

## Demo Recovery Paths

### If Staff Data Was Changed Before Presenting

Open **Staff demo**, choose **Reset demo data**, and reload.

### If GPS Is Blocked

Do not troubleshoot browser settings on stage. Choose **Use demo position** and explain that it is clearly labelled.

### If Internet Is Unavailable

Do not use live geocoding. Choose the built-in **Pretoria** popular area. The queue, staff, appointment, notification, and low-data demos remain local.

### If The Live Demo Must Be Abandoned

Return to slides 4, 5, and 6. They contain real screenshots of the verified prototype and preserve the same story.

### If A Second Demo Is Requested

Reset demo data first. Pause briefly after **Publish live update** before pressing **Citizen app**.

## Likely Judging Questions

### 1. Is the queue information real?

The queue conditions, appointments, messages, and impact metrics are synthetic in this hackathon prototype. Live geocoding, maps, GPS permission handling, and Google Maps directions use real services. A pilot would connect one trusted ticketing feed or authenticated staff account.

### 2. Where does queue data come from?

The prototype proves a staff-publishing path. Production can combine authenticated operator updates with existing ticketing-system integrations. Every update should retain a source, timestamp, and audit history.

### 3. What prevents someone from joining many queues?

The prototype enforces one active ticket. It also demonstrates arrival grace periods and automatic no-show release. Production would add verified identity, rate limits, device and account abuse detection, and operator audit logs.

### 4. Why would branch staff use another system?

The console is deliberately small: staff update the conditions that are not already available automatically. A ticketing integration can remove most manual work. The branch benefits through better-arranged arrivals, lower crowding, fewer repeated enquiries, and clearer capacity visibility.

### 5. What if staff publish incorrect information?

Citizens see freshness and source information. Production should add stale-data warnings, anomaly detection, supervisor review, update reminders, and automatic comparison with ticketing events.

### 6. How does this help someone without a smartphone?

The same service model is represented through SMS, WhatsApp, and USSD. USSD requires no mobile data. Production would connect approved messaging providers and test the language and menu design with real users.

### 7. Are SMS, WhatsApp, and USSD already live?

No. They are working interactive prototype flows, not connected production channels. We demonstrate the complete interaction concept without pretending external messaging infrastructure is already deployed.

### 8. How do you protect personal information?

GPS is permission-based and separate from the selected search area. Prototype state remains in the browser. Production would apply POPIA principles: explicit purpose and consent, minimum necessary data, encryption, access controls, audit logs, and strict retention limits.

### 9. Is GPS required?

No. Users can search a suburb, town, address, postcode, or built-in area. GPS only improves nearby distance and arrival timing.

### 10. What happens when a branch closes or reaches capacity?

QueueLess prevents another remote join and offers a bookable arrival window or distance-ranked open alternatives. The user receives a next action instead of discovering the problem after travelling.

### 11. How is this different from an appointment-booking app?

Appointments are one fallback. The core product manages live walk-in demand: verified queue conditions, virtual places, leave-now timing, check-in, staff capacity controls, no-show rules, and inclusive access channels.

### 12. Virtual queues already exist. What is creative here?

The differentiation is the complete operating model: staff-published trust, citizen timing, fair-queue controls, automatic alternatives, appointment fallback, and basic-phone access in one cross-industry service.

### 13. How will you prove impact?

Measure average physical waiting time, building occupancy, abandonment, no-shows, people served, service throughput, and citizen hours returned. Compare a pilot branch's baseline period with the QueueLess pilot period.

### 14. What is the business or sustainability model?

A realistic model is department or enterprise licensing per branch or service network, including operations software, messaging usage, integrations, support, and analytics. The pilot should validate value before pricing is finalised.

### 15. Can this scale beyond Home Affairs?

Yes. The prototype already applies the same model to clinics and banks. Licensing centres, municipal offices, universities, pharmacies, and private service desks share the same demand, capacity, and arrival problem.

### 16. What would you build next?

Secure operator authentication, a real queue or ticketing integration, production SMS/USSD and WhatsApp providers, multilingual access, audit logs, and pilot analytics.

### 17. What is the biggest implementation risk?

Data quality and operational adoption, not the interface. That is why the first pilot should focus on one branch, one trusted feed, staff training, stale-data monitoring, and measurable service outcomes.

### 18. Why is a web application appropriate?

A responsive web app reaches phones and desktops quickly, avoids app-store installation, and is easier to pilot. SMS and USSD extend access where browser data is not practical.

## Short Answers To Remember

- **Product:** An inclusive queue operating system, not only a virtual ticket.
- **Data:** Synthetic queue data today; staff or ticketing integration in the pilot.
- **Inclusion:** Smartphone, SMS, WhatsApp, and USSD.
- **Fairness:** One ticket, grace period, no-show release, and audit controls.
- **Privacy:** Permission, minimum data, clear purpose, and POPIA-aligned controls.
- **Impact:** Less physical waiting, crowding, abandonment, and lost productive time.
- **Ask:** One trusted feed, one high-volume branch, one measurable pilot.
