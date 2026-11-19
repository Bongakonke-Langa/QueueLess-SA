/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "/queue-backend") return [];
    // Same-origin access to the local CLI stack, including the Realtime WebSocket.
    return [
      "auth/v1/signup", "auth/v1/token", "auth/v1/user", "auth/v1/logout",
      "rest/v1/rpc/queue_snapshot", "rest/v1/rpc/queue_join", "rest/v1/rpc/queue_manage",
      "realtime/v1/websocket",
    ].map(path => ({
      source: "/queue-backend/" + path,
      destination: "http://127.0.0.1:54321/" + path,
    }));
  },
};

export default nextConfig;
