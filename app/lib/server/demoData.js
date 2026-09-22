/**
 * Single source of truth for the synthetic demo network.
 *
 * Both `prisma/seed.js` (initial setup) and the "Reset demo data" flow
 * (`app/api/demo/reset/route.js`) read from here, so the baseline a presenter
 * resets to can never drift away from what the seed originally created.
 */

export const serviceCatalogue = {
  "home-affairs": {
    closes: "15:30",
    services: [
      { name: "Smart ID application", duration: "12 min per person" },
      { name: "Passport application", duration: "15 min per person" },
      { name: "Document collection", duration: "5 min per person" },
    ],
  },
  clinic: {
    closes: "16:00",
    services: [
      { name: "General consultation", duration: "10 min per person" },
      { name: "Medication collection", duration: "4 min per person" },
      { name: "Immunisation", duration: "8 min per person" },
    ],
  },
  bank: {
    closes: "15:30",
    services: [
      { name: "Account services", duration: "10 min per person" },
      { name: "Card collection", duration: "5 min per person" },
      { name: "Consultant appointment", duration: "15 min per person" },
    ],
  },
};

export const rawBranches = [
  { id: 1, type: "home-affairs", name: "Randburg Home Affairs", address: "Malibongwe Drive, Randburg", latitude: -26.0903016, longitude: 27.9816209, wait: 18, people: 12 },
  { id: 2, type: "clinic", name: "Ferndale Community Clinic", address: "Oxford Street, Ferndale", latitude: -26.0954, longitude: 28.0032, wait: 11, people: 7, status: "Moving fast" },
  { id: 3, type: "bank", name: "Ubuntu Bank Rosebank", address: "Cradock Avenue, Rosebank", latitude: -26.1459, longitude: 28.0416, wait: 26, people: 19 },
  { id: 4, type: "home-affairs", name: "Johannesburg Home Affairs", address: "Harrison Street, Marshalltown", latitude: -26.2041, longitude: 28.0416, wait: 54, people: 41 },
  { id: 5, type: "home-affairs", name: "Sandton Civic Services", address: "Rivonia Road, Sandton", latitude: -26.1072, longitude: 28.0562, wait: 22, people: 15 },
  { id: 6, type: "clinic", name: "Sandton Community Clinic", address: "Benmore Road, Sandton", latitude: -26.1041, longitude: 28.0438, wait: 14, people: 9 },
  { id: 7, type: "bank", name: "Ubuntu Bank Sandton", address: "Maude Street, Sandton", latitude: -26.1087, longitude: 28.0578, wait: 9, people: 5, status: "Moving fast" },
  { id: 8, type: "home-affairs", name: "Orlando Home Affairs", address: "Mooki Street, Orlando East", latitude: -26.2328, longitude: 27.9233, wait: 31, people: 23 },
  { id: 9, type: "clinic", name: "Chiawelo Community Clinic", address: "Chris Hani Road, Soweto", latitude: -26.2786, longitude: 27.8502, wait: 17, people: 11 },
  { id: 10, type: "bank", name: "Ubuntu Bank Maponya", address: "Chris Hani Road, Klipspruit", latitude: -26.2581, longitude: 27.9028, wait: 13, people: 8 },
  { id: 11, type: "home-affairs", name: "Pretoria Home Affairs", address: "Sophie de Bruyn Street, Pretoria", latitude: -25.7538, longitude: 28.1877, wait: 29, people: 20 },
  { id: 12, type: "clinic", name: "Tshwane Central Clinic", address: "Sisulu Street, Pretoria", latitude: -25.7472, longitude: 28.2011, wait: 16, people: 10 },
  { id: 13, type: "bank", name: "Ubuntu Bank Church Square", address: "Church Square, Pretoria", latitude: -25.7463, longitude: 28.1881, wait: 12, people: 7 },
  { id: 14, type: "home-affairs", name: "Cape Town Home Affairs", address: "Barrack Street, Cape Town", latitude: -33.9266, longitude: 18.4232, wait: 38, people: 28 },
  { id: 15, type: "clinic", name: "Cape Town Civic Clinic", address: "Buitenkant Street, Cape Town", latitude: -33.9285, longitude: 18.4257, wait: 15, people: 9 },
  { id: 16, type: "bank", name: "Ubuntu Bank Adderley", address: "Adderley Street, Cape Town", latitude: -33.9228, longitude: 18.4226, wait: 19, people: 12 },
  { id: 17, type: "home-affairs", name: "Durban Home Affairs", address: "Commercial Road, Durban Central", latitude: -29.8574, longitude: 31.0244, wait: 34, people: 25 },
  { id: 18, type: "clinic", name: "Warwick Community Clinic", address: "Warwick Avenue, Durban", latitude: -29.8589, longitude: 31.0149, wait: 10, people: 6 },
  { id: 19, type: "bank", name: "Ubuntu Bank Durban Central", address: "Smith Street, Durban", latitude: -29.8597, longitude: 31.0252, wait: 21, people: 14 },
  { id: 20, type: "home-affairs", name: "Gqeberha Home Affairs", address: "Govan Mbeki Avenue, Gqeberha", latitude: -33.9594, longitude: 25.6024, wait: 24, people: 17 },
  { id: 21, type: "clinic", name: "Central Community Clinic", address: "Rink Street, Gqeberha", latitude: -33.9632, longitude: 25.6105, wait: 12, people: 8 },
  { id: 22, type: "bank", name: "Ubuntu Bank Gqeberha", address: "Market Square, Gqeberha", latitude: -33.9617, longitude: 25.6191, wait: 18, people: 11 },
];

/** Expand a raw seed row into the full branch record stored in the database. */
export function toBranchRecord(raw) {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    address: raw.address,
    latitude: raw.latitude,
    longitude: raw.longitude,
    wait: raw.wait,
    people: raw.people,
    status: raw.status || "",
    closes: serviceCatalogue[raw.type].closes,
    accent: raw.type === "clinic" ? "coral" : raw.type === "bank" ? "blue" : raw.wait > 35 ? "gold" : "teal",
    counters: raw.type === "home-affairs" ? 5 : 4,
    capacity: raw.type === "home-affairs" ? 45 : 32,
    virtualJoins: true,
    operationalStatus: "open",
    graceMinutes: 10,
    priorityAccess: raw.type === "clinic",
    updatedMinutes: (raw.id % 5) + 1,
    dataSource: "Branch staff",
    servedToday: 64 + raw.id * 3,
    unavailableServices: "[]",
  };
}

export const demoUsers = [
  { phone: "+27820000001", name: "QueueLess Admin", role: "ADMIN", branchId: null },
  { phone: "+27820000002", name: "Thabo Mokoena", role: "STAFF", branchId: 11 }, // Pretoria Home Affairs
];

/** Insert or refresh every demo branch plus its service catalogue. */
export async function seedBranches(prisma) {
  for (const raw of rawBranches) {
    const record = toBranchRecord(raw);
    const { id, ...fields } = record;
    await prisma.branch.upsert({
      where: { id: raw.id },
      update: fields,
      create: { id, ...fields },
    });

    const existingServices = await prisma.branchService.findMany({ where: { branchId: raw.id } });
    if (!existingServices.length) {
      await prisma.branchService.createMany({
        data: serviceCatalogue[raw.type].services.map((service) => ({
          branchId: raw.id,
          name: service.name,
          duration: service.duration,
        })),
      });
    }
  }
}

/** Insert or refresh the seeded staff and administrator accounts. */
export async function seedUsers(prisma) {
  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { phone: user.phone },
      update: { role: user.role, branchId: user.branchId },
      create: user,
    });
  }
}

/**
 * Return the whole operations demo to its opening state: queue conditions
 * reset, active tickets and appointments cleared, notification feed emptied.
 * Citizen accounts are kept so saved logins and names survive between runs.
 */
export async function resetDemoState(prisma) {
  const now = new Date();

  for (const raw of rawBranches) {
    const { id, ...fields } = toBranchRecord(raw);
    await prisma.branch.update({ where: { id: raw.id }, data: fields }).catch(() => {});
  }

  const [tickets, appointments, notifications] = await prisma.$transaction([
    prisma.queueTicket.updateMany({
      where: { status: { in: ["WAITING", "CALLED", "SERVING"] } },
      data: { status: "CANCELLED", cancelledAt: now },
    }),
    prisma.appointment.updateMany({
      where: { status: "CONFIRMED" },
      data: { status: "CANCELLED" },
    }),
    prisma.notification.deleteMany({}),
  ]);

  return {
    branchesReset: rawBranches.length,
    ticketsReleased: tickets.count,
    appointmentsCancelled: appointments.count,
    notificationsCleared: notifications.count,
  };
}

