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
