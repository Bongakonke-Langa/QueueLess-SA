export type Priority = "standard" | "appointment" | "elderly" | "emergency";
export type Ticket = {
  number: number;
  joined_at: string;
  called_at: string | null;
  ended_at: string | null;
  priority: Priority;
  status: "waiting" | "called" | "completed" | "no_show";
};
export type Business = {
  slug: string;
  name: string;
  location: string;
  timezone: string;
  average_minutes: number;
  demo: boolean;
};
export type Snapshot = {
  business: Business;
  waiting: number;
  remaining: number;
  newWait: number;
  mine: Ticket | null;
  position: number | null;
  estimate: number;
  called: Ticket | null;
  line: Ticket[] | null;
  completed: number | null;
  history: Ticket[] | null;
};
export type Manage = {
  action: "call" | "completed" | "no_show" | "priority" | "average";
  ticket?: number;
  category?: Priority;
  minutes?: number;
};
export const numberLabel = (n: number) => "#" + String(n).padStart(3, "0");
export const time = (iso: string, zone: string) =>
  new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone,
  }).format(new Date(iso));
export const priorities: Priority[] = [
  "standard",
  "appointment",
  "elderly",
  "emergency",
];
