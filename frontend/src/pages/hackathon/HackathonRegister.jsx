import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useHackathonAuthStore } from "../../store/useHackathonAuthStore";
import IdeaLabLogo from "../../assets/idea-lab.png";
import KctLogo from "../../assets/kctlogo.png";

const HackathonRegister = () => {
  const navigate = useNavigate();
  const { register, isSigningUp } = useHackathonAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [degree, setDegree] = useState("BE");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim() || !degree || !graduationYear || !password) {
      setError("Please fill all required fields");
      return;
    }

    if (!/^\d+$/.test(phone.trim())) {
      setError("Phone must be a number");
      return;
    }

    try {
      await register({
        name,
        email,
        phone,
        degree,
        branch: branch ? branch : null,
        graduation_year: graduationYear,
        password,
      });
      navigate("/hackathon/dashboard");
    } catch {
      // errors handled by store/toast
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 items-stretch">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Hackathon Register</h2>
                <p className="text-gray-600 mt-2">Create your hackathon account.</p>
              </div>

              <form onSubmit={onSubmit}>
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-800">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-800">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-800">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="number"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-800">Degree</label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BE">BE</option>
                      <option value="BTech">BTech</option>
                      <option value="BSc">BSc</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-800">Graduation Year</label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-800">Branch (optional)</label>
                  <input
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science / Mechanical / Electronics"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-800">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-800">Confirm Password</label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error ? <div className="mb-4 text-sm text-red-600 font-medium">{error}</div> : null}

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSigningUp ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="size-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Register"
                  )}
                </button>

                <div className="mt-4 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/hackathon/login" className="text-blue-700 font-semibold hover:underline">
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden md:flex rounded-3xl overflow-hidden relative border border-indigo-500/10 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.28),transparent_50%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.18),transparent_55%)]" />
          <div className="relative w-full p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <img src={KctLogo} alt="KCT" className="h-10 w-auto" />
                <img src={IdeaLabLogo} alt="IDEA Lab" className="h-10 w-auto" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">Welcome to Hackathon 2026</h2>
              <p className="mt-3 text-gray-600">
                Register as a student, form your team, pick a problem, and submit your PoC/Prototype.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-gray-800">Dashboard shows team, selected problem, and submission status.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="text-gray-800">Submission is allowed only after approval.</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="rounded-2xl bg-white/70 backdrop-blur p-4 border border-white/60">
                <p className="text-sm font-semibold text-gray-900">₹500 registration fee</p>
                <p className="mt-1 text-xs text-gray-700">Fee is required only after team and problem approval by admin.</p>
              </div>
              <p className="mt-3 text-xs text-gray-600">
                Secure student registration with session-based login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonRegister;

