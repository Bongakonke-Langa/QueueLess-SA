"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Manage, Snapshot } from "./model";

const clients = new Map<string, SupabaseClient>();
function client(desk: boolean) {
  const role = desk ? "desk" : "guest";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "The queue is not connected. Ask the business to configure Supabase.",
    );
  if (!clients.has(role))
    clients.set(
      role,
      createClient(new URL(url, window.location.origin).href, key, {
        auth: {
          storageKey:
            "queueless-" +
            role +
            "-" +
            new URL(url, window.location.origin).host,
          detectSessionInUrl: false,
        },
      }),
    );
  return clients.get(role)!;
}

export function useQueue(slug: string, desk: boolean) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const sequence = useRef(0);
  const working = useRef(false);
  const read = useCallback(async () => {
    const id = ++sequence.current;
    try {
      const result = await client(desk).rpc("queue_snapshot", {
        b: slug,
        desk,
      });
      if (sequence.current !== id) return;
      if (result.error?.code === "42501" && desk) {
        setData(null);
        setLogin(true);
        return;
      }
      if (result.error) throw result.error;
      setData(result.data as Snapshot);
      setLogin(false);
      setError("");
    } catch (e) {
      if (sequence.current === id) setError(message(e));
    }
  }, [slug, desk]);

  useEffect(() => {
    let live = false;
    let disposed = false;
    setData(null);
    setError("");
    setLogin(false);
    setConnected(false);
    void read();
    let db: SupabaseClient;
    try {
      db = client(desk);
    } catch {
      return;
    }
    const channel = db
      .channel("business:" + slug)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queue_businesses",
          filter: "slug=eq." + slug,
        },
        () => {
          if (!disposed) void read();
        },
      )
      .subscribe((state) => {
        if (disposed) return;
        live = state === "SUBSCRIBED";
        setConnected(live);
        if (live) void read(); // Catch changes between the first read and subscription.
      });
    const focus = () => {
      if (!document.hidden) void read();
    };
    const timer = window.setInterval(() => {
      if (!document.hidden && !live) void read();
    }, 5000);
    const clock = window.setInterval(focus, 60000);
    document.addEventListener("visibilitychange", focus);
    const { data: auth } = db.auth.onAuthStateChange((_event) => {
      window.setTimeout(() => {
        if (!disposed) void read();
      }, 0);
    });
    return () => {
      disposed = true;
      sequence.current++;
      clearInterval(timer);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", focus);
      auth.subscription.unsubscribe();
      void db.removeChannel(channel);
    };
  }, [slug, desk, read]);

  async function run(fn: (db: SupabaseClient) => Promise<void>) {
    if (working.current) return false;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      await fn(client(desk));
      await read();
      return true;
    } catch (e) {
      setError(message(e));
      return false;
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function guest(db: SupabaseClient) {
    const { data: session, error } = await db.auth.getSession();
    if (error) throw error;
    if (!session.session) {
      const { error } = await db.auth.signInAnonymously();
      if (error) throw error;
    }
  }
  return {
    data,
    error,
    login,
    busy,
    connected,
    read,
    join: () =>
      run(async (db) => {
        await guest(db);
        const { error } = await db.rpc("queue_join", { b: slug });
        if (error) throw error;
      }),
    manage: (params: Manage) =>
      run(async (db) => {
        if (data?.business.demo) await guest(db);
        const { error } = await db.rpc("queue_manage", { b: slug, ...params });
        if (error) throw error;
      }),
    signIn: (email: string, password: string) =>
      run(async (db) => {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const check = await db.rpc("queue_snapshot", { b: slug, desk: true });
        if (check.error)
          throw new Error("This account cannot manage this business.");
      }),
    signOut: () =>
      run(async (db) => {
        const { error } = await db.auth.signOut({ scope: "local" });
        if (error) throw error;
      }),
  };
}
function message(e: unknown) {
  return typeof e === "object" && e !== null && "message" in e
    ? String(e.message)
    : "The queue could not be updated. Please try again.";
}
