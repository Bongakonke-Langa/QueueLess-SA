// Run against the disposable Supabase CLI project, never a hosted database.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const origin = "http://127.0.0.1:54321";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const adminKey = process.env.SUPABASE_TEST_SERVICE_KEY;
const container = "supabase_db_QueueLess-SA";
const sql = (query) =>
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      container,
      "psql",
      "-U",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-q",
    ],
    { input: query },
  );
const db = (k = key) =>
  createClient(origin, k, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
const ok = ({ data, error }) => {
  assert.equal(error?.message, undefined);
  return data;
};

test("live queue on local Supabase", { timeout: 45000 }, async (t) => {
  assert.ok(
    key && adminKey,
    "Supply local publishable and test service keys; see README",
  );
  const b = "test-" + randomUUID(),
    other = b + "-other";
  const admin = db(adminKey),
    staff = db(),
    a = db(),
    c = db(),
    visitor = db();
  const users = [],
    clients = [admin, staff, a, c, visitor];
  const snap = (who, desk = false, slug = b) =>
    who.rpc("queue_snapshot", { b: slug, desk });
  const manage = (params, who = staff, slug = b) =>
    who.rpc("queue_manage", { b: slug, ...params });
  const join = (who) => who.rpc("queue_join", { b });
  try {
    const password = randomUUID(),
      email = b + "@example.test";
    const merchant = ok(
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      }),
    ).user;
    users.push(merchant.id);
    ok(await staff.auth.signInWithPassword({ email, password }));
    for (const user of [a, c])
      users.push(ok(await user.auth.signInAnonymously()).user.id);
    sql(`insert into public.queue_businesses(slug,name,location) values ('${b}','Test','Test'),('${other}','Other','Other');
      insert into queue_private.merchants(business,account) values ('${b}','${merchant.id}');`);
    await t.test(
      "guests cannot manage or read staff data; merchant scope is enforced",
      async () => {
        assert.ok((await snap(a, true)).error);
        assert.ok((await manage({ action: "average", minutes: 2 }, a)).error);
        assert.ok(
          (await manage({ action: "average", minutes: 2 }, staff, other)).error,
        );
        assert.ok(
          (
            await visitor
              .from("queue_businesses")
              .update({ demo: true })
              .eq("slug", b)
          ).error,
        );
        assert.ok((await join(visitor)).error);
        assert.equal(ok(await snap(visitor)).line, null);
      },
    );
    await t.test(
      "concurrent retries issue one ticket; customers see only their own",
      async () => {
        const pair = (await Promise.all([join(a), join(a)])).map(ok);
        assert.deepEqual(pair, [1, 1]);
        assert.equal(ok(await join(c)), 2);
        const guest = ok(await snap(c));
        assert.equal(guest.mine.number, 2);
        assert.equal(guest.position, 2);
        assert.equal(guest.estimate, 5);
        assert.equal(guest.waiting, 2);
        assert.ok(guest.mine.joined_at);
        assert.equal(guest.mine.owner_id, undefined);
        assert.equal(ok(await snap(visitor)).mine, null);
      },
    );
    await t.test(
      "Realtime delivers a business revision and priority changes positions",
      async () => {
        let notify;
        const change = new Promise((resolve) => {
          notify = resolve;
        });
        const channel = a
          .channel(b)
          .on(
            "postgres_changes",
            {
              schema: "public",
              table: "queue_businesses",
              event: "UPDATE",
              filter: "slug=eq." + b,
            },
            notify,
          );
        await new Promise((resolve, reject) => {
          channel.subscribe((status) => {
            if (status === "SUBSCRIBED") resolve();
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
              reject(new Error(status));
          });
        });
        ok(
          await manage({ action: "priority", ticket: 2, category: "elderly" }),
        );
        const event = await change;
        assert.equal(event.new.slug, b);
        assert.equal(ok(await snap(a)).position, 2);
        assert.deepEqual(
          ok(await snap(staff, true)).line.map((t) => t.number),
          [2, 1],
        );
        ok(
          await manage({ action: "priority", ticket: 2, category: "standard" }),
        );
        assert.equal(ok(await snap(a)).position, 1);
        await a.removeChannel(channel);
      },
    );
    await t.test(
      "service duration, stale calls, completion and no-show follow queue state",
      async () => {
        assert.ok((await manage({ action: "average", minutes: 0 })).error);
        ok(await manage({ action: "average", minutes: 8 }));
        assert.equal(ok(await snap(c)).estimate, 8);
        assert.ok((await manage({ action: "call", ticket: 2 })).error);
        const race = await Promise.all([
          manage({ action: "call", ticket: 1 }),
          manage({ action: "call", ticket: 1 }),
        ]);
        assert.equal(race.filter((r) => r.error === null).length, 1);
        assert.equal(ok(await snap(a)).mine.status, "called");
        assert.equal(ok(await snap(c)).position, 1);
        assert.ok((await manage({ action: "call", ticket: 2 })).error);
        ok(await manage({ action: "completed", ticket: 1 }));
        ok(await manage({ action: "call", ticket: 2 }));
        ok(await manage({ action: "no_show", ticket: 2 }));
        assert.equal(ok(await snap(a)).mine.status, "completed");
        assert.equal(ok(await snap(c)).mine.status, "no_show");
        const desk = ok(await snap(staff, true));
        assert.equal(desk.completed, 1);
        assert.equal(desk.waiting, 0);
        assert.equal(desk.history.length, 2);
        assert.equal(ok(await join(c)), 3);
      },
    );
  } finally {
    for (const client of clients) await client.removeAllChannels();
    sql(
      `delete from public.queue_businesses where slug in ('${b}','${other}');`,
    );
    for (const id of users) await admin.auth.admin.deleteUser(id);
  }
});
