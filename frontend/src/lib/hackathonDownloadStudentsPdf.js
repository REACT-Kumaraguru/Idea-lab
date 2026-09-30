import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function handleDownloadPDF(students, hackathonName = "All Hackathons") {
  const doc = new jsPDF("landscape");

  const titleText = `Hackathon: ${hackathonName || "All Hackathons"}`;
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); // Dark blue #1E3A8A
  doc.text(titleText, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray #6B7280
  doc.text(`Report: Registered Teams & Students List  |  Generated: ${new Date().toLocaleDateString()}  |  Total Students: ${students.length}`, 14, 23);

  doc.setDrawColor(229, 231, 235);
  doc.line(14, 26, 283, 26);

  const tableColumn = [
    "S.No.",
    "Hackathon Name",
    "Team Name",
    "Theme",
    "Topic (Title)",
    "Description",
    "Student Name",
    "Role",
    "Email",
    "Phone Number",
    "College",
    "Branch",
  ];

  const tableRows = students.map((s, idx) => {
    const phone = s.phone ?? s.phoneNumber ?? "";
    return [
      idx + 1,
      s.hackathonName ?? hackathonName ?? "All Hackathons",
      s.teamName ?? "—",
      s.theme ?? "—",
      s.topic ?? s.title ?? "—",
      s.description ?? "—",
      s.name ?? s.fullName ?? "—",
      s.isLeader ? "Leader" : "Member",
      s.email ?? "—",
      phone || "—",
      s.college ?? "—",
      s.branch ?? "—",
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    columnStyles: { 0: { cellWidth: 12, halign: "center" }, 5: { cellWidth: 35 } },
  });

  const cleanTitle = (hackathonName || "All Hackathons").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`teams_${cleanTitle}_${dateStr}.pdf`);
}

export function handleDownloadSubmissionsPDF(submissions, hackathonName = "All Hackathons") {
  const doc = new jsPDF("landscape");

  const titleText = `Hackathon: ${hackathonName || "All Hackathons"}`;
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text(titleText, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Report: Project Submissions List  |  Generated: ${new Date().toLocaleDateString()}  |  Total Submissions: ${submissions.length}`, 14, 23);

  doc.setDrawColor(229, 231, 235);
  doc.line(14, 26, 283, 26);

  const tableColumn = [
    "S.No.",
    "Hackathon Name",
    "Team Name",
    "Theme",
    "Problem Statement",
    "Description",
    "Phase",
    "Status",
    "Mentor Approval",
    "Tech Used",
  ];

  const tableRows = submissions.map((s, idx) => [
    idx + 1,
    s.hackathonName ?? s.team?.hackathonName ?? hackathonName ?? "All Hackathons",
    s.team?.teamName ?? `Team #${s.teamId}`,
    s.theme ?? s.team?.theme ?? "—",
    s.problem?.title ?? s.title ?? "—",
    s.description || "—",
    (s.submissionPhase || "—").toUpperCase(),
    s.status || "—",
    s.mentorApproved ? "Approved" : "Pending",
    s.plannedTech || "—",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    columnStyles: { 0: { cellWidth: 12, halign: "center" }, 4: { cellWidth: 40 } },
  });

  const cleanTitle = (hackathonName || "All Hackathons").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`submissions_${cleanTitle}_${dateStr}.pdf`);
}

export function handleDownloadPaymentsPDF(paymentDetails, hackathonName = "All Hackathons") {
  const doc = new jsPDF("landscape");

  const titleText = `Hackathon: ${hackathonName || "All Hackathons"}`;
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text(titleText, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Report: Payment Details List  |  Generated: ${new Date().toLocaleDateString()}  |  Total Records: ${paymentDetails.length}`, 14, 23);

  doc.setDrawColor(229, 231, 235);
  doc.line(14, 26, 283, 26);

  const tableColumn = [
    "S.No.",
    "Hackathon Name",
    "Team Name",
    "Paid Person Name",
    "Payment Email",
    "Phone",
    "Payment ID",
    "Status",
    "Submitted Date",
  ];

  const tableRows = paymentDetails.map((p, idx) => [
    idx + 1,
    p.hackathonName ?? p.team?.hackathonName ?? hackathonName ?? "All Hackathons",
    p.team?.teamName ?? "—",
    p.paidPersonName ?? "—",
    p.paymentEmail ?? "—",
    p.phone ?? "—",
    p.paymentId ?? "—",
    p.status ?? "—",
    p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    columnStyles: { 0: { cellWidth: 14, halign: "center" } },
  });

  const cleanTitle = (hackathonName || "All Hackathons").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`payments_${cleanTitle}_${dateStr}.pdf`);
}

export function handleDownloadMentorsPDF(mentors, hackathonName = "All Hackathons") {
  const doc = new jsPDF("landscape");

  const titleText = `Hackathon: ${hackathonName || "All Hackathons"}`;
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text(titleText, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Report: Technical Mentors Roster  |  Generated: ${new Date().toLocaleDateString()}  |  Total Mentors: ${mentors.length}`, 14, 23);

  doc.setDrawColor(229, 231, 235);
  doc.line(14, 26, 283, 26);

  const tableColumn = [
    "S.No.",
    "Hackathon Name",
    "Mentor Name",
    "Email",
    "Expertise / Domain",
    "Assigned Teams",
  ];

  const tableRows = mentors.map((m, idx) => {
    const assignedTeamsStr = Array.isArray(m.assignedTeams) && m.assignedTeams.length > 0
      ? m.assignedTeams.map((t) => t.teamName || t).join(", ")
      : "—";
    return [
      idx + 1,
      m.hackathonName ?? hackathonName ?? "All Hackathons",
      m.user?.fullName || m.fullName || "—",
      m.user?.email || m.email || "—",
      m.expertise || "General Mentor",
      assignedTeamsStr,
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    columnStyles: { 0: { cellWidth: 14, halign: "center" } },
  });

  const cleanTitle = (hackathonName || "All Hackathons").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`mentors_${cleanTitle}_${dateStr}.pdf`);
}

export function handleDownloadEvaluationSheetsPDF(teams, hackathonName = "AICTE IDEA Lab Hackathon") {
  const doc = new jsPDF("portrait", "mm", "a4");

  if (!teams || teams.length === 0) {
    doc.text("No teams found for evaluation sheet generation.", 14, 20);
    doc.save("evaluation_sheets_empty.pdf");
    return;
  }

  teams.forEach((team, index) => {
    if (index > 0) doc.addPage("a4", "portrait");

    // Header Banner
    doc.setFillColor(24, 24, 27); // Dark zinc
    doc.rect(0, 0, 210, 24, "F");

    doc.setFontSize(10);
    doc.setTextColor(251, 191, 36); // Amber
    doc.text("AICTE IDEA LAB  •  KUMARAGURU COLLEGE OF TECHNOLOGY", 14, 9);

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("FACULTY EVALUATION & JURY SCORING SHEET", 14, 17);

    doc.setFontSize(9);
    doc.setTextColor(209, 213, 219);
    doc.text(`Event: ${hackathonName}`, 145, 9);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 17);

    // Team Meta Box
    const bench = team.benchNumber || team.bench || "UNASSIGNED";
    doc.setDrawColor(209, 213, 219);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, 28, 182, 34, 2, 2, "FD");

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(`Team: ${team.teamName || team.name || "Untitled Team"}`, 18, 36);

    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`Bench / Table No: ${bench}`, 130, 36);
    doc.text(`Team Code: ${team.inviteCode || team.teamCode || "—"}`, 130, 43);

    const topicStr = (team.topic || team.title || "Custom Problem").slice(0, 55);
    doc.text(`Topic / Theme: ${topicStr}`, 18, 43);

    const membersStr = Array.isArray(team.members)
      ? team.members.map((m) => m.fullName || m.name || m.email).slice(0, 4).join(", ")
      : team.leaderName || "Roster Registered";
    doc.text(`Members: ${membersStr}`, 18, 50);

    // Scoring Rubrics Table
    const rubricCols = ["Criteria", "Description", "Max Marks", "Awarded Marks"];
    const rubricRows = [
      ["1. Novelty & Innovation", "Originality of the concept, problem clarity, and innovative approach.", "20", ""],
      ["2. Technical Rigor & Prototype", "Hardware/software functional working model, code architecture, circuits.", "30", ""],
      ["3. Practical Feasibility", "Real-world scalability, deployment readiness, and societal relevance.", "20", ""],
      ["4. Lab Equipment Utilization", "Effective utilization of AICTE IDEA Lab 3D printers, CNC, laser, IoT kits.", "15", ""],
      ["5. Presentation & Q&A", "Clarity of demonstration, team communication, and jury question defense.", "15", ""],
      ["TOTAL SCORE", "Cumulative evaluated marks across all 5 parameters", "100", ""],
    ];

    autoTable(doc, {
      head: [rubricCols],
      body: rubricRows,
      startY: 66,
      theme: "grid",
      headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 4, textColor: [17, 24, 39] },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: "bold" },
        1: { cellWidth: 84 },
        2: { cellWidth: 24, halign: "center", fontStyle: "bold" },
        3: { cellWidth: 28, halign: "center" },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Evaluator Remarks Box
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text("Evaluator Qualitative Feedback & Technical Recommendations:", 14, finalY);

    doc.setDrawColor(156, 163, 175);
    doc.rect(14, finalY + 3, 182, 34);

    // Signature Area
    const signY = finalY + 48;
    doc.line(14, signY, 74, signY);
    doc.text("Faculty Evaluator Signature", 14, signY + 5);

    doc.line(122, signY, 196, signY);
    doc.text("Evaluator Name & Department", 122, signY + 5);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("AICTE IDEA Lab Confidential Judging Record • Kumaraguru College of Technology", 14, 287);
    doc.text(`Page ${index + 1} of ${teams.length}`, 180, 287);
  });

  const cleanTitle = (hackathonName || "hackathon").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  doc.save(`evaluation_sheets_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

