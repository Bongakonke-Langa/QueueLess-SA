# QueueLess SA

QueueLess SA is a polished, mobile-first queue operating system for citizens and service centres. Citizens can compare verified waits, join remotely, receive leave-now alerts, navigate to a branch, check in, complete the service, and see the visit recorded in Activity. Staff can publish queue conditions, capacity, closures, and service availability. Full queues offer appointments or distance-ranked alternatives, while SMS, WhatsApp, and USSD concepts extend access beyond mobile data.

## Hosted prototype

**Primary Netlify link:** [https://queueless-sa.netlify.app/](https://queueless-sa.netlify.app/)

**Backup Vercel link:** [https://queueless-sa.vercel.app/](https://queueless-sa.vercel.app/)

> **Note:** these URLs currently serve an earlier, database-free build. Redeploy
> using the steps below before presenting so the live site matches this code
> (OTP sign-in, live queue state, Staff console).

## Run locally

The app stores users, sessions, and queue state in PostgreSQL. Start a local
database first:

```bash
docker compose up -d      # local Postgres 16 on port 5432
npm install               # runs `prisma generate` automatically
npm run db:prepare        # applies migrations and seeds the demo network
npm run dev
```

No Docker? Point `DATABASE_URL` and `DIRECT_URL` in `.env` at any PostgreSQL
instance — a free Neon or Supabase database works — then run `npm run db:prepare`.

Production check:

```bash
npm run build
npm run start
```

Open `http://127.0.0.1:3000/`.

## Deploying

Set these environment variables on the host (Netlify UI or Vercel project
settings):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | **Pooled** PostgreSQL connection string (Neon: the host containing `-pooler`) |
| `DIRECT_URL` | **Direct** connection string — migrations cannot run through a pooler |
| `NEXT_PUBLIC_DEMO_MODE` | `1` to keep the demo affordances on |

With a pooler in front of the database, append `?pgbouncer=true&connection_limit=1`
to `DATABASE_URL` and use the unpooled host for `DIRECT_URL`. Both variables are
required; migrations target `DIRECT_URL` while the app uses `DATABASE_URL`.

Then deploy normally:

- **Vercel** picks up the `vercel-build` script automatically, which runs
  `prisma migrate deploy`, seeds the demo network, and builds.
- **Netlify** uses the committed `netlify.toml`, which runs the same sequence.

`prisma generate` runs on install via the `postinstall` script, so the correct
query engine for the host platform is always present.


The detailed map and live place search require internet access. Precise GPS requires browser Location permission; **Use demo position** provides a reliable judging fallback.

Live search can find locations across South Africa. When a selected area falls outside the synthetic branch network, the dashboard confirms that the location changed and explains that no demo centres are available within 35 km instead of appearing to fail.

## Golden demo

1. Start on **Explore** and show the verified waits, map, GPS status, and low-data entry.
2. Join **Ubuntu Bank Church Square**, confirm the ticket, and press **Advance queue** three times.
3. Choose **I’m at the branch**, then **Mark service complete**.
4. Show the new visit, updated completion count, and time-saved total in **Activity**.
5. Open **Staff demo**, select **Pretoria Home Affairs**, set it to **Closed**, and publish.
6. Return through **Citizen app** and show the fresh closed-state label.
7. Open the branch, choose **Appointments and alternatives**, and confirm tomorrow at 09:30.
8. Open **No mobile data?**, choose **USSD**, and complete **Find services**.
9. Before repeating the demo, choose **Reset demo data** and reload.

## Other demo paths

- Search `Cape Town Civic Centre` to show live OpenStreetMap geocoding.
- Join an open branch, use **Advance queue** to trigger alerts, check in, then choose **Mark service complete** to move the visit into Activity.
- Open **Get directions** to launch Google Maps.
- Use **Profile** for avatar upload and accessibility settings.
- Collapse the desktop sidebar to expand the working area; mobile navigation remains unchanged.

## Deliverables

- [Final product and technical documentation](docs/PROJECT-DOCUMENTATION.md)
- [Ten-minute pitch and judging Q&A](docs/HACKATHON-PITCH.md)
- [Final timed presentation and demo runbook](docs/FINAL-PRESENTATION-RUNBOOK.md)
- `QueueLess-SA-FINAL-Hackathon-Presentation.pptx`

`QueueLess-SA-Hackathon-Presentation.pptx` is kept as an identical compatibility copy so either presentation filename contains the final nine-slide story.

Branch names, queue conditions, impact metrics, appointments, messages, and completed visits are demonstration data. Geocoding and map tiles come from OpenStreetMap services with attribution displayed in the product.
