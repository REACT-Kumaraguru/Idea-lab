/** Allowed extensions for hackathon PoC / prototype / final uploads (UI only; backend does not enforce). */
export function isAllowedSubmissionFile(file) {
  if (!file?.name) return false;
  const lower = String(file.name).toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".docx");
}

/** @returns {string | null} error message or null */
export function validateSubmissionFiles(files) {
  if (!files?.length) return null;
  const bad = files.filter((f) => !isAllowedSubmissionFile(f));
  if (!bad.length) return null;
  return `Only PDF or DOCX files are allowed. Invalid: ${bad.map((f) => f.name).join(", ")}`;
}
