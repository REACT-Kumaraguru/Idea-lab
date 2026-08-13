import fs from "fs";
import bcrypt from "bcryptjs";
import { sequelize } from "../lib/db.js";
import Hackathon from "../models/hackathon/HackathonModel.js";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";
import HackathonTeam from "../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../models/hackathon/HackathonTeamMemberModel.js";
import HackathonRegistration from "../models/hackathon/HackathonRegistrationModel.js";
import { setupHackathonAssociations } from "../models/hackathon/associations.js";

setupHackathonAssociations();

const HACKATHON_ID = 2; // Smart City Hackathon 2026

const CSV_CANDIDATES = [
  process.env.CSV_PATH,
  "C:\\Users\\user\\Documents\\Idea-lab\\students_details\\Registration - SMART CITY HACKATHON.csv",
  "/opt/Idea-lab/Registration_SMART_CITY_HACKATHON.csv",
  "/app/Registration_SMART_CITY_HACKATHON.csv",
  "/app/uploads/Registration_SMART_CITY_HACKATHON.csv",
  "./Registration_SMART_CITY_HACKATHON.csv",
].filter(Boolean);

const RESOLVED_CSV_PATH = CSV_CANDIDATES.find((p) => fs.existsSync(p));

const OUTPUT_CSV_PATH = process.platform === "win32"
  ? "C:\\Users\\user\\Documents\\Idea-lab\\students_details\\smart_city_team_credentials.csv"
  : "/app/uploads/smart_city_team_credentials.csv";
const OUTPUT_JSON_PATH = process.platform === "win32"
  ? "C:\\Users\\user\\Documents\\Idea-lab\\students_details\\smart_city_team_credentials.json"
  : "/app/uploads/smart_city_team_credentials.json";

let phoneCounter = 10000;

async function getUniquePhoneNumber(rawPhone, userEmail) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  let candidate = digits.length >= 10 && digits !== "0000000000" ? digits.substring(0, 15) : null;

  if (candidate) {
    const existing = await HackathonUser.findOne({ where: { phoneNumber: candidate } });
    if (!existing || existing.email === userEmail) {
      return candidate;
    }
  }

  phoneCounter++;
  return `900${String(phoneCounter).padStart(7, "0")}`;
}

function normalizeTheme(raw, problem = "") {
  const combined = `${String(raw || "")} ${String(problem || "")}`.toLowerCase().trim();
  if (combined.includes("disaster") || combined.includes("flood") || combined.includes("earthquake")) {
    return "Disaster Resilience";
  }
  if (combined.includes("waste") || combined.includes("recycl") || combined.includes("garbage")) {
    return "Waste Management";
  }
  if (combined.includes("energy") || combined.includes("power") || combined.includes("grid") || combined.includes("battery") || combined.includes("electricity")) {
    return "Energy Solutions";
  }
  if (combined.includes("agri") || combined.includes("farm") || combined.includes("crop") || combined.includes("weed") || combined.includes("rodent") || combined.includes("coffee")) {
    return "Smart Agriculture";
  }
  if (combined.includes("pollut") || combined.includes("air quality") || combined.includes("ecopulse") || combined.includes("climate") || combined.includes("environment")) {
    return "Pollution Control";
  }
  if (combined.includes("health") || combined.includes("medic") || combined.includes("wound") || combined.includes("drip") || combined.includes("hospital") || combined.includes("disease") || combined.includes("doctor") || combined.includes("hemoglobin")) {
    return "Smart Healthcare";
  }
  if (combined.includes("mobil") || combined.includes("park") || combined.includes("traffic") || combined.includes("transport") || combined.includes("bus") || combined.includes("rail") || combined.includes("vehicle") || combined.includes("road") || combined.includes("helmet") || combined.includes("crane") || combined.includes("navigate")) {
    return "Smart Mobility & Parking";
  }
  return "Smart Mobility & Parking";
}

function getCleanEmail(val) {
  if (!val) return "";
  return String(val).trim().toLowerCase();
}

function getEmailPrefix(email) {
  const clean = getCleanEmail(email);
  if (!clean || !clean.includes("@")) return "password123";
  return clean.split("@")[0].toLowerCase();
}

function generateInviteCode(teamName, idx) {
  const prefix = String(teamName || "SCT")
    .replace(/[^A-Z0-9]/gi, "")
    .substring(0, 4)
    .toUpperCase();
  const num = String(idx).padStart(4, "0");
  return `${prefix || "SCT"}${num}`;
}

function parseCSVLine(text) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSVFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const rawLines = content.split(/\r?\n/);
  const rows = [];
  let multilineAcc = "";
  let inQuotes = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const quoteCount = (line.match(/"/g) || []).length;
    if (!inQuotes) {
      if (quoteCount % 2 !== 0) {
        inQuotes = true;
        multilineAcc = line;
      } else {
        if (line.trim()) rows.push(parseCSVLine(line));
      }
    } else {
      multilineAcc += "\n" + line;
      if (quoteCount % 2 !== 0) {
        inQuotes = false;
        rows.push(parseCSVLine(multilineAcc));
        multilineAcc = "";
      }
    }
  }
  return rows;
}

async function runImport() {
  console.log("=== STARTING SMART CITY HACKATHON TEAMS & ACCOUNTS IMPORT ===");
  if (!RESOLVED_CSV_PATH) {
    console.error("CSV file not found in candidates:", CSV_CANDIDATES);
    return;
  }
  console.log("Using CSV File:", RESOLVED_CSV_PATH);
  await sequelize.authenticate();
  await sequelize.sync();

  await Hackathon.findOrCreate({
    where: { id: HACKATHON_ID },
    defaults: {
      id: HACKATHON_ID,
      name: "Smart City Hackathon 2026",
      slug: "smart-city-2026",
      organizedBy: "AICTE IDEA Lab, KCT & IEEE Smart Cities",
      tagline: "An Initiative under IEEE Smart Cities Ambassadors Program",
      venue: "MGATE, KCT, COIMBATORE",
      status: "completed",
      prizes: "₹ 15,000",
      description: "Solving Local Urban Challenges — Build Innovative Solutions for Smarter, Sustainable Cities.",
    },
  });

  await HackathonTeam.destroy({ where: { hackathonId: HACKATHON_ID } });

  const allRows = parseCSVFile(RESOLVED_CSV_PATH);
  if (allRows.length < 2) {
    console.error("No data rows found in CSV.");
    return;
  }

  const headers = allRows[0];
  const dataRows = allRows.slice(1);
  console.log(`Parsed ${dataRows.length} data rows from CSV.`);

  let teamsCreated = 0;
  let usersCreated = 0;
  let membersLinked = 0;
  const credentialsExport = [];
  const passwordHashCache = new Map();

  async function getHashedPassword(plainText) {
    if (passwordHashCache.has(plainText)) {
      return passwordHashCache.get(plainText);
    }
    const hash = await bcrypt.hash(plainText, 8);
    passwordHashCache.set(plainText, hash);
    return hash;
  }

  for (let i = 0; i < dataRows.length; i++) {
    if (i % 20 === 0 || i === dataRows.length - 1) {
      console.log(`[Import Progress] Processing team ${i + 1}/${dataRows.length}...`);
    }
    const row = dataRows[i];
    if (row.length < 5) continue;

    const rawTeamName = String(row[1] || "").trim();
    const rawLeadName = String(row[2] || "").trim();
    const rawLeadEmail = getCleanEmail(row[3]);
    const rawLeadPhone = String(row[4] || "0000000000").trim();
    const collegeName = String(row[8] || "").trim();
    const theme = String(row[9] || "").trim();
    const problemStatement = String(row[10] || "").trim();

    if (!rawLeadEmail || !rawTeamName) continue;

    // 1. Create or Find Team Leader Account
    const leadPasswordPlain = getEmailPrefix(rawLeadEmail);
    const leadPasswordHash = await getHashedPassword(leadPasswordPlain);

    const leadPhone = await getUniquePhoneNumber(rawLeadPhone, rawLeadEmail);

    let [leadUser, createdLead] = await HackathonUser.findOrCreate({
      where: { email: rawLeadEmail },
      defaults: {
        fullName: rawLeadName || "Team Lead",
        name: rawLeadName || "Team Lead",
        phoneNumber: leadPhone,
        phone: leadPhone,
        degree: "UG",
        college: collegeName,
        graduationYear: 2026,
        password: leadPasswordHash,
        role: "student",
      },
    });

    if (createdLead) usersCreated++;
    await leadUser.update({ password: leadPasswordHash });

    await HackathonRegistration.findOrCreate({
      where: { userId: leadUser.id, hackathonId: HACKATHON_ID },
    });

    // 2. Create distinct Team Entry for every CSV row
    const canonicalTheme = normalizeTheme(theme, problemStatement);
    const safeTeamName = rawTeamName ? String(rawTeamName).substring(0, 245) : "Team";
    const inviteCode = generateInviteCode(rawTeamName, i + 1);

    const team = await HackathonTeam.create({
      teamName: safeTeamName,
      inviteCode,
      leaderUserId: leadUser.id,
      status: "approved",
      hackathonId: HACKATHON_ID,
      theme: canonicalTheme,
      description: problemStatement,
      topic: problemStatement ? problemStatement.substring(0, 100) : null,
    });
    teamsCreated++;

    const existingLeaderMember = await HackathonTeamMember.findOne({ where: { userId: leadUser.id } });
    if (!existingLeaderMember) {
      await HackathonTeamMember.create({ teamId: team.id, userId: leadUser.id, isLeader: true });
    }

    const teamCredentialsRecord = {
      sNo: i + 1,
      teamName: rawTeamName,
      inviteCode: team.inviteCode,
      theme: theme,
      leaderName: leadUser.fullName,
      leaderEmail: leadUser.email,
      leaderPassword: leadPasswordPlain,
      leaderPhone: leadUser.phoneNumber,
      college: collegeName,
      members: [],
    };

    // 3. Process Team Members
    const rawMemberNames = String(row[5] || "");
    const rawMemberEmails = String(row[6] || "");

    const memberEmails = rawMemberEmails
      .split(/[\n,;]+/)
      .map((e) => getCleanEmail(e))
      .filter((e) => e && e !== rawLeadEmail && e.includes("@"));

    const memberNames = rawMemberNames
      .split(/[\n,;]+/)
      .map((n) => String(n).trim())
      .filter(Boolean);

    for (let mIdx = 0; mIdx < memberEmails.length; mIdx++) {
      const mEmail = memberEmails[mIdx];
      const mName = memberNames[mIdx] || `Member ${mIdx + 1}`;
      const mPasswordPlain = getEmailPrefix(mEmail);
      const mPasswordHash = await getHashedPassword(mPasswordPlain);

      const mPhone = await getUniquePhoneNumber("", mEmail);

      let [mUser, createdM] = await HackathonUser.findOrCreate({
        where: { email: mEmail },
        defaults: {
          fullName: mName,
          name: mName,
          phoneNumber: mPhone,
          phone: mPhone,
          degree: "UG",
          college: collegeName,
          graduationYear: 2026,
          password: mPasswordHash,
          role: "student",
        },
      });

      if (createdM) usersCreated++;
      await mUser.update({ password: mPasswordHash });

      await HackathonRegistration.findOrCreate({
        where: { userId: mUser.id, hackathonId: HACKATHON_ID },
      });

      const existingMember = await HackathonTeamMember.findOne({ where: { userId: mUser.id } });
      if (!existingMember) {
        await HackathonTeamMember.create({ teamId: team.id, userId: mUser.id, isLeader: false });
        membersLinked++;
      }

      teamCredentialsRecord.members.push({
        name: mUser.fullName,
        email: mUser.email,
        password: mPasswordPlain,
      });
    }

    credentialsExport.push(teamCredentialsRecord);
  }

  // Save JSON export
  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(credentialsExport, null, 2), "utf-8");

  // Save CSV export
  const csvHeader = "S.No,Team Name,Invite Code,Theme,Leader Name,Leader Email,Leader Password,Leader Phone,College,Member Credentials\n";
  const csvLines = credentialsExport.map((t) => {
    const memberStr = t.members.map((m) => `${m.email}:${m.password}`).join(" | ");
    const safeTeam = `"${t.teamName.replace(/"/g, '""')}"`;
    const safeCollege = `"${t.college.replace(/"/g, '""')}"`;
    const safeTheme = `"${t.theme.replace(/"/g, '""')}"`;
    const safeLeader = `"${t.leaderName.replace(/"/g, '""')}"`;
    const safeMembers = `"${memberStr.replace(/"/g, '""')}"`;
    return `${t.sNo},${safeTeam},${t.inviteCode},${safeTheme},${safeLeader},${t.leaderEmail},${t.leaderPassword},${t.leaderPhone},${safeCollege},${safeMembers}`;
  });

  fs.writeFileSync(OUTPUT_CSV_PATH, csvHeader + csvLines.join("\n"), "utf-8");

  console.log(`=== IMPORT COMPLETED SUCCESSFULLY ===`);
  console.log(`Teams Created/Updated: ${teamsCreated}`);
  console.log(`Users Created/Updated: ${usersCreated}`);
  console.log(`Members Linked: ${membersLinked}`);
  console.log(`Credentials CSV Exported to: ${OUTPUT_CSV_PATH}`);
  console.log(`Credentials JSON Exported to: ${OUTPUT_JSON_PATH}`);
}

runImport()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error during import execution:", err);
    process.exit(1);
  });
