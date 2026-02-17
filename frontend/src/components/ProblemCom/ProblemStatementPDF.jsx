import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Letter size: 8.5" x 11" = 612 x 792 points
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
  },
  statusPending: { backgroundColor: "#fef3c7", color: "#92400e" },
  statusApproved: { backgroundColor: "#d1fae5", color: "#065f46" },
  statusRejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
  statusDraft: { backgroundColor: "#e5e7eb", color: "#374151" },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: "38%",
    color: "#6b7280",
    flexShrink: 0,
  },
  value: {
    flex: 1,
    color: "#111827",
  },
  blockValue: {
    marginBottom: 6,
    color: "#111827",
    textAlign: "justify",
    lineHeight: 1.4,
  },
  reviewBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  reviewTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ProblemStatementPDF({ data }) {
  const statusStyles = {
    pending: styles.statusPending,
    approved: styles.statusApproved,
    rejected: styles.statusRejected,
    draft: styles.statusDraft,
  };
  const statusLabel = (data?.status || "pending").toUpperCase();

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>REACT Problem Statement</Text>
          <Text style={styles.subtitle}>
            IDEA Lab Portal · Kumaraguru College of Technology
          </Text>
          <Text style={styles.subtitle}>
            Submitted on {formatDate(data?.createdAt)} · ID: #{data?.id}
          </Text>
          <View style={[styles.statusBadge, statusStyles[data?.status] || styles.statusPending]}>
            <Text>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section A: Organisation Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Organisation Name:</Text>
            <Text style={styles.value}>{data?.organisationName || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{data?.organisationType || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>
              {[data?.cityRegion, data?.state, data?.country].filter(Boolean).join(", ") || "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Primary Contact:</Text>
            <Text style={styles.value}>{data?.primaryContactName || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email / Phone:</Text>
            <Text style={styles.value}>
              {data?.contactEmail || "—"} · {data?.contactPhone || "—"}
            </Text>
          </View>
          <Text style={styles.label}>Short Description</Text>
          <Text style={styles.blockValue}>{data?.shortDescription || "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section B: Problem Statement</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Problem Title:</Text>
            <Text style={styles.value}>{data?.problemTitle || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>One-line Summary:</Text>
            <Text style={styles.value}>{data?.oneLineSummary || "—"}</Text>
          </View>
          <Text style={styles.label}>Detailed Description</Text>
          <Text style={styles.blockValue}>{data?.detailedDescription || "—"}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Geographic Context:</Text>
            <Text style={styles.value}>{data?.geographicContext || "—"}</Text>
          </View>
          <Text style={styles.label}>Who is affected</Text>
          <Text style={styles.blockValue}>{data?.whoIsAffected || "—"}</Text>
          <Text style={styles.label}>Expected impact</Text>
          <Text style={styles.blockValue}>{data?.expectedImpact || "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section C: SDG & Thematic Alignment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Sector:</Text>
            <Text style={styles.value}>{data?.sectorCategory || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Beneficiary Groups:</Text>
            <Text style={styles.value}>{data?.beneficiaryGroups || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Relevant SDGs:</Text>
            <Text style={styles.value}>
              {Array.isArray(data?.relevantSDGs) ? data.relevantSDGs.join(", ") : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section F: Expectations from REACT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Support Type:</Text>
            <Text style={styles.value}>
              {Array.isArray(data?.supportType) ? data.supportType.join(", ") : "—"}
            </Text>
          </View>
          <Text style={styles.label}>Expected Outcomes</Text>
          <Text style={styles.blockValue}>{data?.expectedOutcomes || "—"}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Preferred Timeline:</Text>
            <Text style={styles.value}>{data?.preferredTimeline || "—"}</Text>
          </View>
        </View>

        {(data?.reviewedAt || data?.adminNotes) && (
          <View style={styles.reviewBox}>
            <Text style={styles.reviewTitle}>Review Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Reviewed On:</Text>
              <Text style={styles.value}>{formatDate(data?.reviewedAt)}</Text>
            </View>
            {data?.adminNotes && (
              <>
                <Text style={styles.label}>Admin Notes</Text>
                <Text style={styles.blockValue}>{data.adminNotes}</Text>
              </>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          This document was generated from IDEA Lab Portal. Confidential information may have been omitted in this summary.
        </Text>
      </Page>
    </Document>
  );
}
