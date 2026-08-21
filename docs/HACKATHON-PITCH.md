# QueueLess SA: Ten-Minute Hackathon Pitch

## Opening

Imagine waking up at 4 a.m. just to queue at Home Affairs, only to find hundreds of people already waiting. Some spend half the day there just to renew an ID or collect a document. QueueLess SA gives people back their time by allowing them to join a virtual queue, track their position in real time, and arrive only when they are about to be served.

That experience affects workers, parents, students, older people, and anyone who depends on an essential public service. The problem begins before they reach the building: they cannot see the wait, whether the service is available, or whether the branch will reach capacity.

## Our Answer

QueueLess SA is an inclusive queue operating system connecting citizens and service centres.

Citizens compare verified waits, join remotely, receive a sound alert when it is time to leave, open directions, and check in near their turn. After service, one tap releases the ticket and records the completed visit and time saved in Activity. Branch staff publish queue conditions, capacity, counter availability, closures, and service outages. If a branch cannot accept another person, the citizen receives a bookable arrival window or the next-nearest open centre.

## Working Demo

Start on the citizen dashboard and show the selected search area, detailed map, three service categories, verified timestamps, GPS status, and the **No mobile data?** entry.

Open **Ubuntu Bank Church Square**, join the virtual queue, and use **Advance queue** to trigger the leave-now and next-in-line sound alerts. Choose **I’m at the branch**, then **Mark service complete**. Activity immediately gains the visit, the completion count increases, the time-saved total updates, and **My queue** is released.

Open **Staff demo**. Select **Pretoria Home Affairs**, change its status to **Closed**, and publish. Return with **Citizen app**. The same branch now says **Closed - just now**.

Open it. Joining is no longer allowed, but the user is not abandoned. QueueLess offers an appointment and distance-ranked alternatives. Confirm tomorrow at 09:30 and show the appointment banner.

Open **No mobile data?**, choose **USSD**, dial the demo code, and select **Find services**. This proves the solution is designed beyond smartphone-only access.

## Why This Is Different

A virtual queue alone does not solve unreliable information. QueueLess connects both sides:

- Staff create a trusted operational update.
- Citizens see when it was verified.
- Fairness rules limit people to one active ticket and release no-shows.
- Service completion closes the ticket lifecycle and turns each visit into visible impact.
- Appointments and alternatives prevent a full queue from becoming a dead end.
- SMS, WhatsApp, and USSD include people with limited data or basic phones.

## Impact

QueueLess returns time people can spend working, caring for family, studying, or running a business. It can also reduce unnecessary crowding, help branches spread demand, and show managers where service capacity is failing.

The pilot should measure physical waiting time, occupancy, abandonment, no-shows, people served, and total citizen time returned.

## How We Built It

The working prototype uses Next.js and React, Leaflet and OpenStreetMap, live Nominatim geocoding, browser GPS and Permissions APIs, Web Audio alerts, Google Maps directions, localStorage persistence, Canvas avatar processing, and Lucide icons. The presentation and prototype were verified through production builds and browser-based desktop and mobile tests.

## Production Path

The prototype uses synthetic queue data and interactive messaging simulations. The next step is a controlled pilot at one high-volume service centre:

1. Connect its ticketing feed or authenticated staff console.
2. Integrate a South African SMS/USSD provider and approved WhatsApp Business flow.
3. Train staff and measure time returned, crowding, no-shows, and service throughput.
4. Expand only after the data proves operational and citizen value.

## Close

Our ask is simple: give us one high-volume branch and one pilot period to prove how much time QueueLess SA can return.

Our goal isn't just to reduce queues; it's to give South Africans back their time.

## Likely Questions

### Where does the live queue data come from?

The prototype proves two paths: direct staff publication in the operations console and future integration with an existing branch ticketing system. Every update has a freshness label so citizens can judge whether it is trustworthy.

### Is the queue information real?

Branch conditions and impact metrics are synthetic in this hackathon prototype. Live geocoding, map tiles, browser GPS, permission handling, and directions use real services.

### How do you prevent queue abuse?

The prototype allows one active ticket, includes an arrival grace period, and automatically releases unattended places. Production would add verified identity, rate limits, audit logs, and branch policy controls.

### What about people without smartphones or data?

The same journey is represented through SMS, WhatsApp, and USSD. The USSD concept requires no mobile data.

### What happens if the queue is full or the branch closes?

QueueLess blocks another join and offers a guaranteed arrival window or the next-nearest open branch.

### How is privacy protected?

GPS is permission-based and separate from the search area. Current prototype history and state stay in the browser. Production would use consent, minimum necessary data, encryption, access controls, and retention limits.

### What would you measure in a pilot?

Average physical waiting time, building occupancy, queue abandonment, no-shows, people served, service throughput, and total citizen hours returned.

### Can it scale beyond Home Affairs?

Yes. The prototype already uses a shared service model for clinics and banks. Licensing centres, municipal offices, universities, pharmacies, and private service desks can use the same operating pattern.
