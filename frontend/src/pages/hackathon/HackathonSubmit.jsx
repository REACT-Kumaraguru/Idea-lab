import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios.js";

const HackathonSubmit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialProblemId = useMemo(() => searchParams.get("problemId") || "", [searchParams]);

  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  const [problemId, setProblemId] = useState(initialProblemId);
  const [phase, setPhase] = useState("poc");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/problems");
        setProblems(res.data.problems || []);
      } catch {
        setProblems([]);
      } finally {
        setLoadingProblems(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // If URL param changes, sync
    if (initialProblemId) setProblemId(initialProblemId);
  }, [initialProblemId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("problemId", String(problemId));
      fd.append("phase", phase);
      fd.append("title", title);
      fd.append("description", description || "");

      if (Array.isArray(files) && files.length > 0) {
        for (const f of files) {
          if (phase === "poc") fd.append("pocFiles", f);
          else fd.append("prototypeFiles", f);
        }
      }

      await axiosInstance.post("/hackathon/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/hackathon/status");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProblem = problems.find((p) => String(p.id) === String(problemId));

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Submit PoC / Prototype</h2>
      <p className="text-gray-600 mt-1">Submit files for the selected problem and phase.</p>

      {loadingProblems ? (
        <div className="mt-6 text-gray-600">Loading problems...</div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Problem</label>
              <select
                value={problemId}
                onChange={(e) => setProblemId(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a problem</option>
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>

              {selectedProblem ? (
                <div className="mt-3 text-sm text-gray-700">
                  <div className="font-semibold">{selectedProblem.sector || "Sector"}</div>
                  <div className="text-gray-600">{selectedProblem.prizeAmount ? `Prize: ₹${selectedProblem.prizeAmount}` : "Prize: TBD"}</div>
                </div>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800">Phase</label>
              <select
                value={phase}
                onChange={(e) => {
                  setPhase(e.target.value);
                  setFiles([]);
                }}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="poc">PoC</option>
                <option value="prototype">Prototype</option>
              </select>
              <div className="mt-2 text-xs text-gray-500">
                Upload at least one file for the chosen phase.
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-800">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AI-enabled predictive maintenance for motors"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-800">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Summarize your PoC / prototype approach."
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-800">Upload {phase === "poc" ? "PoC" : "Prototype"} files</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="mt-2 block w-full text-sm text-gray-700"
            />
          </div>

          {error ? <div className="mt-4 text-sm text-red-600 font-medium">{error}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default HackathonSubmit;

