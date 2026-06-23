import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function handleDownloadPDF(students) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("IDEA LAB Hackathon 2026", 14, 15);

  doc.setFontSize(12);
  doc.text("Registered Students List", 14, 25);

  const tableColumn = [
    "Name",
    "Email",
    "Phone Number",
    "Degree",
    "Graduation Year",
    "College",
    "Branch",
  ];

  const tableRows = students.map((s) => {
    const phone = s.phone ?? s.phoneNumber ?? "";
    const year =
      s.graduationYear != null && s.graduationYear !== ""
        ? String(s.graduationYear)
        : "";
    return [
      s.name ?? s.fullName ?? "",
      s.email ?? "",
      phone,
      s.degree ?? "",
      year,
      s.college ?? "",
      s.branch ?? "",
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save("students.pdf");
}
