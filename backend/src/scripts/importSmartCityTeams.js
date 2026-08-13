import fs from "fs";
import bcrypt from "bcryptjs";
import { sequelize } from "../lib/db.js";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";
import HackathonTeam from "../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../models/hackathon/HackathonTeamMemberModel.js";
import HackathonRegistration from "../models/hackathon/HackathonRegistrationModel.js";
import { setupHackathonAssociations } from "../models/hackathon/associations.js";

setupHackathonAssociations();

const HACKATHON_ID = 2; // Smart City Hackathon 2026
const CSV_FILE_PATH = "C:\\Users\\user\\Documents\\Idea-lab\\students_details\\Registration - SMART CITY HACKATHON.csv";
const OUTPUT_CSV_PATH = "C:\\Users\\user\\Documents\\Idea-lab\\students_details\\smart_city_team_credentials.csv";
const OUTPUT_JSON_PATH = "C:\\Users\\user\\Documents\\Idea-lab\\students_details\\smart_city_team_credentials.json";

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
  const prefix = String(teamName || "TEAM")
    .replace(/[^A-Z0-9]/gi, "")
    .substring(0, 4)
    .toUpperCase();
  const num = String(idx).padStart(4, "0");
  return `${prefix || "TEAM"}${num}`;
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
  await sequelize.authenticate();
  await sequelize.sync();

  const allRows = parseCSVFile(CSV_FILE_PATH);
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

  for (let i = 0; i < dataRows.length; i++) {
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
    const leadPasswordHash = await bcrypt.hash(leadPasswordPlain, 10);

    let [leadUser, createdLead] = await HackathonUser.findOrCreate({
      where: { email: rawLeadEmail },
      defaults: {
        fullName: rawLeadName || "Team Lead",
        name: rawLeadName || "Team Lead",
        phoneNumber: rawLeadPhone || "0000000000",
        phone: rawLeadPhone || "0000000000",
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

    // 2. Create or Find Team Entry
    const inviteCode = generateInviteCode(rawTeamName, i + 1);

    let team = await HackathonTeam.findOne({
      where: { leaderUserId: leadUser.id, hackathonId: HACKATHON_ID },
    });

    if (!team) {
      team = await HackathonTeam.create({
        teamName: rawTeamName,
        inviteCode,
        leaderUserId: leadUser.id,
        status: "approved",
        hackathonId: HACKATHON_ID,
        theme: theme || "Smart City",
        description: problemStatement,
        topic: problemStatement ? problemStatement.substring(0, 100) : null,
      });
      teamsCreated++;
    } else {
      await team.update({
        teamName: rawTeamName,
        theme: theme || team.theme,
        description: problemStatement || team.description,
      });
    }

    await HackathonTeamMember.findOrCreate({
      where: { teamId: team.id, userId: leadUser.id },
      defaults: { isLeader: true },
    });

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
      const mPasswordHash = await bcrypt.hash(mPasswordPlain, 10);

      let [mUser, createdM] = await HackathonUser.findOrCreate({
        where: { email: mEmail },
        defaults: {
          fullName: mName,
          name: mName,
          phoneNumber: "0000000000",
          phone: "0000000000",
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

      await HackathonTeamMember.findOrCreate({
        where: { teamId: team.id, userId: mUser.id },
        defaults: { isLeader: false },
      });
      membersLinked++;

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
