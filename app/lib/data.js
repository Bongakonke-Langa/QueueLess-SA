import {
  Banknote,
  Building2,
  CircleUserRound,
  Compass,
  HeartPulse,
  History,
  Home,
  Landmark,
  Settings2,
  Ticket,
} from "lucide-react";

export const categories = [
  { id: "all", label: "All services", icon: Compass },
  { id: "home-affairs", label: "Home Affairs", icon: Landmark },
  { id: "clinic", label: "Clinics", icon: HeartPulse },
  { id: "bank", label: "Banks", icon: Banknote },
];

export const serviceCatalogue = {
  "home-affairs": {
    shortType: "Home Affairs",
    closes: "15:30",
    services: [
      { name: "Smart ID application", duration: "12 min per person" },
      { name: "Passport application", duration: "15 min per person" },
      { name: "Document collection", duration: "5 min per person" },
    ],
  },
  clinic: {
    shortType: "Public clinic",
    closes: "16:00",
    services: [
      { name: "General consultation", duration: "10 min per person" },
      { name: "Medication collection", duration: "4 min per person" },
      { name: "Immunisation", duration: "8 min per person" },
    ],
  },
  bank: {
    shortType: "Bank branch",
    closes: "15:30",
    services: [
      { name: "Account services", duration: "10 min per person" },
      { name: "Card collection", duration: "5 min per person" },
      { name: "Consultant appointment", duration: "15 min per person" },
    ],
  },
};

export function createBranch(branch) {
  return {
    distance: 0,
    travel: 3,
    status: branch.wait <= 20 ? "Low wait" : branch.wait <= 35 ? "Moderate" : "Busy now",
    accent: branch.type === "clinic" ? "coral" : branch.type === "bank" ? "blue" : branch.wait > 35 ? "gold" : "teal",
    counters: branch.type === "home-affairs" ? 5 : 4,
    capacity: branch.type === "home-affairs" ? 45 : 32,
    virtualJoins: true,
    operationalStatus: "open",
    graceMinutes: 10,
    oneTicket: true,
    autoRelease: true,
    priorityAccess: branch.type === "clinic",
    updatedMinutes: (branch.id % 5) + 1,
    dataSource: "Branch staff",
    servedToday: 64 + (branch.id * 3),
    unavailableServices: [],
    ...serviceCatalogue[branch.type],
    ...branch,
  };
}

export const branches = [
  createBranch({ id: 1, type: "home-affairs", name: "Randburg Home Affairs", address: "Malibongwe Drive, Randburg", latitude: -26.0903016, longitude: 27.9816209, wait: 18, people: 12 }),
  createBranch({ id: 2, type: "clinic", name: "Ferndale Community Clinic", address: "Oxford Street, Ferndale", latitude: -26.0954, longitude: 28.0032, wait: 11, people: 7, status: "Moving fast" }),
  createBranch({ id: 3, type: "bank", name: "Ubuntu Bank Rosebank", address: "Cradock Avenue, Rosebank", latitude: -26.1459, longitude: 28.0416, wait: 26, people: 19 }),
  createBranch({ id: 4, type: "home-affairs", name: "Johannesburg Home Affairs", address: "Harrison Street, Marshalltown", latitude: -26.2041, longitude: 28.0416, wait: 54, people: 41 }),
  createBranch({ id: 5, type: "home-affairs", name: "Sandton Civic Services", address: "Rivonia Road, Sandton", latitude: -26.1072, longitude: 28.0562, wait: 22, people: 15 }),
  createBranch({ id: 6, type: "clinic", name: "Sandton Community Clinic", address: "Benmore Road, Sandton", latitude: -26.1041, longitude: 28.0438, wait: 14, people: 9 }),
  createBranch({ id: 7, type: "bank", name: "Ubuntu Bank Sandton", address: "Maude Street, Sandton", latitude: -26.1087, longitude: 28.0578, wait: 9, people: 5, status: "Moving fast" }),
  createBranch({ id: 8, type: "home-affairs", name: "Orlando Home Affairs", address: "Mooki Street, Orlando East", latitude: -26.2328, longitude: 27.9233, wait: 31, people: 23 }),
  createBranch({ id: 9, type: "clinic", name: "Chiawelo Community Clinic", address: "Chris Hani Road, Soweto", latitude: -26.2786, longitude: 27.8502, wait: 17, people: 11 }),
  createBranch({ id: 10, type: "bank", name: "Ubuntu Bank Maponya", address: "Chris Hani Road, Klipspruit", latitude: -26.2581, longitude: 27.9028, wait: 13, people: 8 }),
  createBranch({ id: 11, type: "home-affairs", name: "Pretoria Home Affairs", address: "Sophie de Bruyn Street, Pretoria", latitude: -25.7538, longitude: 28.1877, wait: 29, people: 20 }),
  createBranch({ id: 12, type: "clinic", name: "Tshwane Central Clinic", address: "Sisulu Street, Pretoria", latitude: -25.7472, longitude: 28.2011, wait: 16, people: 10 }),
  createBranch({ id: 13, type: "bank", name: "Ubuntu Bank Church Square", address: "Church Square, Pretoria", latitude: -25.7463, longitude: 28.1881, wait: 12, people: 7 }),
  createBranch({ id: 14, type: "home-affairs", name: "Cape Town Home Affairs", address: "Barrack Street, Cape Town", latitude: -33.9266, longitude: 18.4232, wait: 38, people: 28 }),
  createBranch({ id: 15, type: "clinic", name: "Cape Town Civic Clinic", address: "Buitenkant Street, Cape Town", latitude: -33.9285, longitude: 18.4257, wait: 15, people: 9 }),
  createBranch({ id: 16, type: "bank", name: "Ubuntu Bank Adderley", address: "Adderley Street, Cape Town", latitude: -33.9228, longitude: 18.4226, wait: 19, people: 12 }),
  createBranch({ id: 17, type: "home-affairs", name: "Durban Home Affairs", address: "Commercial Road, Durban Central", latitude: -29.8574, longitude: 31.0244, wait: 34, people: 25 }),
  createBranch({ id: 18, type: "clinic", name: "Warwick Community Clinic", address: "Warwick Avenue, Durban", latitude: -29.8589, longitude: 31.0149, wait: 10, people: 6 }),
  createBranch({ id: 19, type: "bank", name: "Ubuntu Bank Durban Central", address: "Smith Street, Durban", latitude: -29.8597, longitude: 31.0252, wait: 21, people: 14 }),
  createBranch({ id: 20, type: "home-affairs", name: "Gqeberha Home Affairs", address: "Govan Mbeki Avenue, Gqeberha", latitude: -33.9594, longitude: 25.6024, wait: 24, people: 17 }),
  createBranch({ id: 21, type: "clinic", name: "Central Community Clinic", address: "Rink Street, Gqeberha", latitude: -33.9632, longitude: 25.6105, wait: 12, people: 8 }),
  createBranch({ id: 22, type: "bank", name: "Ubuntu Bank Gqeberha", address: "Market Square, Gqeberha", latitude: -33.9617, longitude: 25.6191, wait: 18, people: 11 }),
];

export const searchRadiusKm = 35;

export const defaultSearchArea = {
  id: "default-johannesburg",
  label: "Johannesburg",
  secondary: "Gauteng, South Africa",
  latitude: -26.2041,
  longitude: 28.0473,
  source: "default",
};

export const popularSearchAreas = [
  { id: "preset-randburg", label: "Randburg", secondary: "Gauteng, South Africa", latitude: -26.0936, longitude: 28.0064, source: "preset" },
  { id: "preset-sandton", label: "Sandton", secondary: "Gauteng, South Africa", latitude: -26.1076, longitude: 28.0567, source: "preset" },
  { id: "preset-soweto", label: "Soweto", secondary: "Gauteng, South Africa", latitude: -26.2485, longitude: 27.854, source: "preset" },
  { id: "preset-pretoria", label: "Pretoria", secondary: "Gauteng, South Africa", latitude: -25.7479, longitude: 28.2293, source: "preset" },
  { id: "preset-cape-town", label: "Cape Town", secondary: "Western Cape, South Africa", latitude: -33.9249, longitude: 18.4241, source: "preset" },
  { id: "preset-durban", label: "Durban", secondary: "KwaZulu-Natal, South Africa", latitude: -29.8587, longitude: 31.0218, source: "preset" },
];

export const navItems = [
  { id: "home", label: "Explore", icon: Home },
  { id: "ticket", label: "My queue", icon: Ticket },
  { id: "activity", label: "Activity", icon: History },
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "staff", label: "Branch console", mobileLabel: "Staff", icon: Building2, roles: ["STAFF", "ADMIN"] },
  { id: "admin", label: "Manage branches", mobileLabel: "Admin", icon: Settings2, roles: ["ADMIN"] },
];

export const defaultProfile = {
  name: "Bonga M.",
  phone: "082 555 0142",
  city: "Johannesburg",
  province: "Gauteng",
  avatar: "",
};

export const defaultAppSettings = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
};

export const demoLocation = {
  latitude: -26.1048,
  longitude: 28.0017,
  accuracy: 250,
  updatedAt: null,
  source: "demo",
};

export function branchTypeIcon(type) {
  return type === "clinic" ? HeartPulse : type === "bank" ? Banknote : Landmark;
}

export function branchTypeTone(type) {
  return type === "clinic" ? "coral" : type === "bank" ? "blue" : "teal";
}
