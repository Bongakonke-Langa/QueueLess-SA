import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
import { buildSlide01 } from "./templates/slide-01.mjs";
import { buildSlide06 } from "./templates/slide-06.mjs";
import { buildSlide08 } from "./templates/slide-08.mjs";
import { buildSlide15 } from "./templates/slide-15.mjs";
import { buildSlide16 } from "./templates/slide-16.mjs";
import { buildSlide17 } from "./templates/slide-17.mjs";

const root = "/Users/langab/Desktop/Bonga-s own projetct/QueueLess-SA";
const buildDir = `${root}/docs/presentation-build/output`;
const finalPptx = `${root}/QueueLess-SA-FINAL-Hackathon-Presentation.pptx`;
const compatibilityPptx = `${root}/QueueLess-SA-Hackathon-Presentation.pptx`;

function textToken(run, fontSize = 24, bold = false, color = "#000000") {
  return {
    runs: [{ run, textStyle: { fontSize: `${fontSize}px`, typeface: "Helvetica Neue", color, bold } }],
    spaceAfter: 800,
    paragraphStyle: { lineSpacingPercent: 105000 },
  };
}

function contentBlock(title, body, titleSize = 24, bodySize = 22) {
  return {
    titleHere: textToken(title, titleSize, true),
    titleGoesHere: textToken(title, titleSize, true),
    loremIpsumDolorSitAmetConsecteturAdipiscing: textToken(body, bodySize),
    quamUtMassaLuctusCursusNullamPharetra: textToken("", bodySize),
  };
}

async function imageBuffer(path) {
  const bytes = await fs.readFile(path);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function addScreenshot(slide, path, position, alt, fit = "contain") {
  return imageBuffer(path).then((blob) => slide.images.add({
    blob,
    contentType: "image/png",
    alt,
    fit,
    position,
    geometry: "rect",
  }));
}

function addNotes(slide, lines) {
  slide.speakerNotes.textFrame.setText(lines.join("\n"));
  slide.speakerNotes.setVisible(true);
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(buildDir, { recursive: true });
  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  const slide1 = buildSlide01(presentation, {
    title: textToken("QUEUELESS SA", 24, true, "#087D6B"),
    title2: textToken("Give people back the time they lose waiting.", 72, true),
    title3: textToken("A working citizen and service-centre queue operating system", 26),
  });
  addNotes(slide1, [
    "Imagine waking up at 4 a.m. just to queue at Home Affairs, only to find hundreds of people already waiting. Some spend half the day there just to renew an ID or collect a document. QueueLess SA gives people back their time by allowing them to join a virtual queue, track their position in real time, and arrive only when they are about to be served.",
    "[Sources]",
    "- QueueLess SA project-authored concept and prototype.",
  ]);

  const slide2 = buildSlide06(presentation, {
    title: textToken("The queue starts costing people before service begins", 42, true),
    body1: contentBlock("LOST INCOME", "Hours away from work, family, or school."),
    body2: contentBlock("CROWDING", "Too many people arrive at the same time."),
    body3: contentBlock("UNCERTAINTY", "People travel without knowing the wait or outcome."),
    footer1: "2",
  });
  addNotes(slide2, [
    "Connect the problem to the lack of visibility before a person travels.",
    "[Sources]",
    "- QueueLess SA hackathon problem statement supplied by the project team.",
  ]);

  const slide3 = buildSlide08(presentation, {
    title: textToken("The queue becomes visible", 42, true),
    body1: contentBlock(
      "Citizens plan with trusted information",
      "Compare verified waits, capacity, services, distance and travel time before leaving. Staff updates and citizen decisions use the same branch state.",
      28,
      22,
    ),
    footer1: "3",
  });
  await addScreenshot(
    slide3,
    `${root}/docs/assets/dashboard-wide.png`,
    { left: 658.17, top: 41.62, width: 581.6, height: 588.14 },
    "QueueLess SA desktop dashboard showing a Pretoria map and nearby service queues",
  );
  addNotes(slide3, [
    "Point to the verified queue list, selected search area, service map, GPS state, and direct Staff demo entry.",
    "[Sources]",
    "- QueueLess SA working prototype screenshot, captured 7 August 2026.",
    "- OpenStreetMap contributors: https://www.openstreetmap.org/copyright",
  ]);

  const slide4 = buildSlide15(presentation, {
    title: textToken("Citizens wait remotely and complete the visit", 42, true),
    body1: contentBlock("", ""),
    label1: textToken("01", 22, true, "#087D6B"),
    body2: textToken("Join remotely", 26, true),
    label2: textToken("02", 22, true, "#087D6B"),
    body3: textToken("Hear the leave-now alert", 26, true),
    label3: textToken("03", 22, true, "#087D6B"),
    body4: textToken("Navigate and check in", 26, true),
    label4: textToken("04", 22, true, "#087D6B"),
    body5: textToken("Complete service; Activity updates", 26, true),
    footer1: "4",
  });
  await addScreenshot(
    slide4,
    `${root}/docs/assets/virtual-queue-mobile.png`,
    { left: 41.33, top: 190, width: 374.67, height: 445 },
    "QueueLess SA mobile virtual queue ticket with people ahead and queue journey",
    "cover",
  );
  addNotes(slide4, [
    "Use the live prototype to join, advance the queue, hear leave-now and next alerts, check in, mark the service complete, and show the updated Activity totals.",
    "[Sources]",
    "- QueueLess SA working prototype screenshot, captured 7 August 2026.",
  ]);

  const slide5 = buildSlide08(presentation, {
    title: textToken("Staff publish live conditions", 42, true),
    body1: contentBlock(
      "A visible source of queue data",
      "Staff publish wait, people, counters, capacity, closures and service availability. Citizen screens update immediately with a verification time.",
      28,
      22,
    ),
    footer1: "5",
  });
  await addScreenshot(
    slide5,
    `${root}/docs/assets/staff-dashboard-wide.png`,
    { left: 658.17, top: 41.62, width: 581.6, height: 588.14 },
    "QueueLess SA staff operations console with queue controls and citizen preview",
    "cover",
  );
  addNotes(slide5, [
    "In the live demo, close Pretoria Home Affairs, publish, and return to the citizen app to show the fresh status.",
    "Explain that synthetic conditions prove the operating model; a pilot would connect a ticketing feed or authenticated staff account.",
    "[Sources]",
    "- QueueLess SA working prototype screenshot and project-authored operating model, captured 7 August 2026.",
  ]);

  const slide6 = buildSlide08(presentation, {
    title: textToken("QueueLess works without data", 42, true),
    body1: contentBlock(
      "One service, three access channels",
      "The same queue journey is demonstrated through SMS, WhatsApp and USSD. Full queues also offer appointments or distance-ranked alternatives.",
      28,
      22,
    ),
    footer1: "6",
  });
  await addScreenshot(
    slide6,
    `${root}/docs/assets/low-data-ussd-mobile.png`,
    { left: 658.17, top: 41.62, width: 581.6, height: 588.14 },
    "QueueLess SA mobile low-data access dialog showing the USSD service menu",
    "contain",
  );
  addNotes(slide6, [
    "Demonstrate the USSD menu and say clearly that production messaging providers are not connected in the prototype.",
    "The creative angle is inclusion: QueueLess is designed for any phone, not only a smartphone with data.",
    "[Sources]",
    "- QueueLess SA working prototype screenshot and project-authored access concept, captured 7 August 2026.",
  ]);

  const slide7 = buildSlide08(presentation, {
    title: textToken("Search areas update live", 42, true),
    body1: contentBlock(
      "Live search with proof",
      "Search a real South African place. QueueLess recentres the map, recalculates nearby services and distances, notifies the user, and records the source and time in Activity.",
      28,
      22,
    ),
    footer1: "7",
  });
  await addScreenshot(
    slide7,
    `${root}/docs/assets/live-location-search-mobile.png`,
    { left: 658.17, top: 41.62, width: 581.6, height: 588.14 },
    "QueueLess SA live location search sheet with popular and recent areas",
    "cover",
  );
  addNotes(slide7, [
    "Use Pretoria as the live demo. The explicit Search button keeps API usage controlled.",
    "[Sources]",
    "- QueueLess SA working prototype screenshot, captured 7 August 2026.",
    "- Nominatim Search API: https://nominatim.org/release-docs/latest/api/Search/",
    "- Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/",
    "- OpenStreetMap contributors: https://www.openstreetmap.org/copyright",
  ]);

  const stack = [
    ["NEXT.JS + REACT", "App and interactions"],
    ["LEAFLET", "Map and markers"],
    ["OPENSTREETMAP", "Tiles and place data"],
    ["NOMINATIM API", "Live place search"],
    ["GEOLOCATION", "Precise position"],
    ["WEB AUDIO", "Sound alerts"],
    ["LOCALSTORAGE", "Device persistence"],
    ["GOOGLE MAPS", "Turn-by-turn directions"],
  ];
  const slide8 = buildSlide16(presentation, {
    title: textToken("Every tool supports something visible in the demo", 42, true),
    ...Object.fromEntries(stack.map(([title, body], index) => [`body${index + 1}`, contentBlock(title, body, 22, 21)])),
    footer1: "8",
  });
  addNotes(slide8, [
    "Keep this slide quick: every technology supports a feature visible in the demo.",
    "[Sources]",
    "- QueueLess SA package.json and application source code.",
    "- Nominatim Search API: https://nominatim.org/release-docs/latest/api/Search/",
    "- OpenStreetMap copyright and attribution: https://www.openstreetmap.org/copyright",
  ]);

  const slide9 = buildSlide17(presentation, {
    title: textToken("One pilot can prove how much time QueueLess returns", 42, true),
    label1: textToken("CONNECT", 18, true, "#087D6B"),
    label2: textToken("PILOT", 18, true, "#087D6B"),
    label3: textToken("PROVE", 18, true, "#087D6B"),
    body1: contentBlock("One trusted queue feed", "Link ticketing data or authenticated staff updates.", 24, 20),
    body2: contentBlock("One high-volume branch", "Train staff and launch citizen and low-data access.", 24, 20),
    body3: contentBlock("One measurable result", "Track waits, crowding, no-shows and hours returned.", 24, 20),
    footer1: "9",
  });
  addNotes(slide9, [
    "Close with a concrete ask: approve one high-volume branch and one pilot period.",
    "Our goal isn't just to reduce queues; it's to give South Africans back their time.",
    "[Sources]",
    "- QueueLess SA project-authored pilot recommendation.",
  ]);

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(`${buildDir}/${stem}.png`, await presentation.export({ slide, format: "png", scale: 1 }));
    await fs.writeFile(`${buildDir}/${stem}.layout.json`, await (await slide.export({ format: "layout" })).text());
  }
  await writeBlob(`${buildDir}/montage.webp`, await presentation.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(finalPptx);
  await fs.copyFile(finalPptx, compatibilityPptx);
  console.log(finalPptx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
