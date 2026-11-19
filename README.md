# QueueLess SA

QueueLess SA is a polished, mobile-first queue operating system for citizens and service centres. Citizens can compare verified waits, join remotely, receive leave-now alerts, navigate to a branch, check in, complete the service, and see the visit recorded in Activity. Staff can publish queue conditions, capacity, closures, and service availability. Full queues offer appointments or distance-ranked alternatives, while SMS, WhatsApp, and USSD concepts extend access beyond mobile data.

## Virtual queue MVP

### Live merchant desk and guest tickets

The independent Next.js / TypeScript queue MVP lives at **`/desk/<business>`**
and **`/join/<business>`**. The original citizen app remains at `/`.
Customers need no contact details. Their anonymous Supabase session restores their
ticket in the same browser. Each business has one counter; priority tickets
come first, FIFO within each group. Estimates count the remaining service time
at the counter plus one configured service interval per waiting person ahead.

**Local demo** (Node 22+, Docker, Supabase CLI):

1. Run `npm ci` and `supabase start`. The migration and local seed create the
   fictional Ubuntu Bank queue. No Prisma database is needed for these two views.
2. In `.env.local`, set `NEXT_PUBLIC_SUPABASE_URL=/queue-backend`,
   `NEXT_PUBLIC_QUEUE_BUSINESS=ubuntu-bank`, and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the **publishable key** from
   `supabase status`. Never use a service-role or secret key in client variables.
3. Run `npm run dev` and open `/desk/ubuntu-bank`. **Customer view** opens
   a separate guest session. A phone scanning the poster must be able to reach
   the URL you used to open the desk (use a LAN address, not localhost).
4. Join, change a ticket’s priority, finish the current ticket, and call the next.
   Both screens subscribe to Supabase Realtime; they catch up on reconnect or focus.
   Sound alerts require a tap to enable and an open page.

**Production:** Use a dedicated Supabase project (not the original Prisma
database). Enable anonymous sign-ins under Authentication, apply the SQL
migration using the CLI or SQL editor, and set the public URL to your hosted
Supabase HTTPS origin. Create the merchant in Supabase Auth and provision it
using an administrator SQL session:

```sql
insert into public.queue_businesses (slug, name, location, timezone)
values ('my-business', 'My Business', 'Main branch', 'Africa/Johannesburg');
insert into queue_private.merchants (business, account)
values ('my-business', '<merchant-auth-user-uuid>');
```

Set `NEXT_PUBLIC_QUEUE_BUSINESS=my-business`, then build and deploy Next.js.
Run `npm run build` directly for a queue-only deployment; the legacy
`vercel-build` script also expects Prisma credentials. The join page is public;
the desk requires the assigned merchant’s email and password. **Never load
the local seed into production**: its `demo=true` business is deliberately
manageable by any guest. Leave this flag false for real queues.
Review anonymous auth rate limits, abuse protection and retention before launch.

**Integration test:** with the local CLI stack running and the public key in
`.env.local`, run the following from the project root. It creates and removes
isolated businesses and auth users and checks actual WebSocket delivery.

```sh
SUPABASE_TEST_SERVICE_KEY="$(supabase status -o env | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"$/\1/p')" \
  node --env-file=.env.local --test scripts/test-live-queue.mjs
```

### Earlier hosted prototype

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
