import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAllowedSubmissionFile, validateSubmissionFiles } from "../src/lib/hackathonSubmissionFileTypes.js";

describe("Frontend Core Utilities & Validation Suite", () => {
  describe("Submission File Type Validation", () => {
    it("permits valid PDF files (.pdf)", () => {
      assert.equal(isAllowedSubmissionFile({ name: "idea_pitch.pdf" }), true);
      assert.equal(isAllowedSubmissionFile({ name: "RESEARCH_DOCUMENT.PDF" }), true);
    });

    it("permits valid Word documents (.docx)", () => {
      assert.equal(isAllowedSubmissionFile({ name: "abstract.docx" }), true);
      assert.equal(isAllowedSubmissionFile({ name: "REPORT.DOCX" }), true);
    });

    it("rejects malicious or disallowed formats (.exe, .js, .py, .zip)", () => {
      assert.equal(isAllowedSubmissionFile({ name: "exploit.exe" }), false);
      assert.equal(isAllowedSubmissionFile({ name: "script.sh" }), false);
      assert.equal(isAllowedSubmissionFile({ name: "payload.js" }), false);
      assert.equal(isAllowedSubmissionFile({ name: "archive.zip" }), false);
      assert.equal(isAllowedSubmissionFile({ name: "doc_without_extension" }), false);
    });

    it("batch validation returns clean error message on invalid files", () => {
      const files = [
        { name: "good_paper.pdf" },
        { name: "bad_script.bat" }
      ];
      const err = validateSubmissionFiles(files);
      assert.ok(err !== null);
      assert.ok(err.includes("bad_script.bat"));
      assert.ok(err.includes("Only PDF or DOCX"));
    });

    it("batch validation returns null when all files are compliant", () => {
      const files = [
        { name: "paper1.pdf" },
        { name: "presentation.docx" }
      ];
      const err = validateSubmissionFiles(files);
      assert.equal(err, null);
    });
  });
});
