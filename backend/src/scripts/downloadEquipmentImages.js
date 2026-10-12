import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, sequelize } from "../lib/db.js";
import Equipment from "../models/EquipmentModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/equipment");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Queries targeted for each equipment item
const EQUIPMENT_QUERIES = {
  1: "Laser-and-CNC-Control",
  2: "Cutting plotter vinyl",
  3: "Prusa Mini 3D printer",
  4: "3d printer Bambu Lab H2S",
  5: "VIUscan handheld 3D scanner",
  6: "CNC wood router",
  7: "AXIOM 3D printer",
  8: "Conventional-lathe",
  9: "Drillpress",
  10: "Bosch GBH5-40 LargeDrill",
  11: "Bench Grinder Brush 1",
  12: "Soldering station",
  13: "Hakko 936 soldering station",
  14: "Minerva Sewing Machine Prague",
  15: "Woodturning lathe",
  16: "Repair tool kit",
  17: "Soldadora inverter",
  18: "laboratory refrigerator",
  19: "Microwave oven flashon",
  20: "Electronics workbench magnifier",
  21: "digital microscope USB",
  22: "digital oscilloscope Rigol",
  23: "Tektronix Oscilloscope 475A",
  24: "BK Precision 4078 waveform generator",
  25: "Bench power supply",
  26: "HP 34401A Multimeter",
  27: "HP LaserJet printer",
  28: "PCB milling machine",
  // Common IoT / mechanical tools
  "Raspberry Pi 4 Kit": "Raspberry Pi 4 Model B",
  "Raspberry Pi 5 Kit": "Raspberry Pi 5 Model B",
  "Arduino UNO R3": "Arduino Uno R3",
  "Arduino Mega 2560": "Arduino Mega 2560 R3",
  "Arduino Nano": "Arduino Nano v3",
  "ESP32 Wroom 32E Dev Board": "ESP-WROOM-32 ESP32",
  "NodeMCU ESP8266": "ESP8266 NodeMCU",
  "NVIDIA Jetson Nano Board": "NVIDIA Jetson Nano",
  "Jigsaw Machine": "Jigsaw Bosch",
  "Power Circular Saw": "Circular saw",
  "Solderless Breadboard (830 Points)": "breadboard electronics",
};

async function searchCommonsThumb(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=" +
    encodeURIComponent(query + " filetype:bitmap") +
    "&gsrlimit=3&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json";

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "IdeaLabApp/1.0 (contact@kct.ac.in)" },
      signal: AbortSignal.timeout(8000),
    });
    const d = await r.json();
    const pages = Object.values(d.query?.pages || {});
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      const thumb = info?.thumburl || info?.url;
      if (thumb && !thumb.endsWith(".ogv") && !thumb.endsWith(".webm") && !thumb.endsWith(".svg")) {
        return thumb;
      }
    }
  } catch (err) {
    // ignore and fallback
  }
  return null;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "IdeaLabApp/1.0 (contact@kct.ac.in)",
      "Accept": "image/*,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

export async function downloadAndSeedImages() {
  await connectDB();
  console.log("[EquipmentImages] Starting automated image ingestion...");

  const allEquipments = await Equipment.findAll({ order: [["id", "ASC"]] });
  console.log(`[EquipmentImages] Processing ${allEquipments.length} equipment items.`);

  let updatedCount = 0;

  for (const item of allEquipments) {
    const query = EQUIPMENT_QUERIES[item.id] || EQUIPMENT_QUERIES[item.equipmentName];
    if (!query) continue;

    const filename = `equipment_${item.id}.jpg`;
    const localFilePath = path.join(UPLOAD_DIR, filename);
    const dbRelativePath = `/uploads/equipment/${filename}`;

    try {
      if (!fs.existsSync(localFilePath) || fs.statSync(localFilePath).size < 1000) {
        console.log(`[EquipmentImages] Querying Wikimedia for ID ${item.id}: "${item.equipmentName}" (query: "${query}")...`);
        const thumbUrl = await searchCommonsThumb(query);
        if (!thumbUrl) {
          console.warn(`[EquipmentImages] No image found on Wikimedia for ID ${item.id} (${item.equipmentName})`);
          continue;
        }

        console.log(`[EquipmentImages] Downloading thumb for ID ${item.id} from ${thumbUrl.slice(0, 80)}...`);
        await downloadFile(thumbUrl, localFilePath);
      }

      await item.update({ image: dbRelativePath });
      updatedCount++;
      console.log(`[EquipmentImages] Saved ID ${item.id} (${item.equipmentName}) -> ${dbRelativePath}`);
    } catch (err) {
      console.error(`[EquipmentImages] Error for ID ${item.id} (${item.equipmentName}):`, err.message);
    }
  }

  console.log(`[EquipmentImages] Ingestion complete! Updated ${updatedCount} equipment records.`);
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("downloadEquipmentImages.js")) {
  downloadAndSeedImages()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
