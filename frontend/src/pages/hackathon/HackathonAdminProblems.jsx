import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios.js";

const HackathonAdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [seedMoneyAmount, setSeedMoneyAmount] = useState("");

  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/hackathon/admin/problems");
        setProblems(res.data.problems || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load problems");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addProblem = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        title,
        description,
        sector,
        prizeAmount: prizeAmount ? Number(prizeAmount) : null,
        seedMoneyAmount: seedMoneyAmount ? Number(seedMoneyAmount) : null,
      };
      const res = await axiosInstance.post("/hackathon/admin/problems", payload);
      setProblems((prev) => [res.data.problem, ...prev]);
      setTitle("");
      setSector("");
      setDescription("");
      setPrizeAmount("");
      setSeedMoneyAmount("");
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to add problem");
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Manage Problems</h2>
      {error ? <div className="mt-3 text-sm text-red-600 font-medium">{error}</div> : null}

      <form onSubmit={addProblem} className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Sector</label>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Digital / Manufacturing"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-800">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Prize Amount</label>
            <input
              value={prizeAmount}
              onChange={(e) => setPrizeAmount(e.target.value)}
              placeholder="60000"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Seed Money Amount</label>
            <input
              value={seedMoneyAmount}
              onChange={(e) => setSeedMoneyAmount(e.target.value)}
              placeholder="e.g., 20000"
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button type="submit" className="mt-5 w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
          Add Problem
        </button>
      </form>

      <div className="mt-6">
        <h3 className="font-bold text-gray-900">Existing Problems</h3>
        <div className="mt-4 space-y-4">
          {problems.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-semibold text-blue-700">{p.sector || "Sector"}</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">{p.title}</div>
                </div>
                <div className="text-xs text-gray-600">
                  Prize: {p.prizeAmount ? `₹${p.prizeAmount}` : "TBD"}
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">{p.description}</div>
            </div>
          ))}
          {problems.length === 0 ? <div className="text-gray-700">No problems yet.</div> : null}
        </div>
      </div>
    </div>
  );
};

export default HackathonAdminProblems;

