import React, { useState } from 'react';
import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import Arduino from '../../assets/arduino mega.webp'
import AmbientBackground from "../AmbientBackground";

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login, isLoggingIn } = useAuthStore();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });

    if (Object.keys(newErrors).length === 0) {
      // Pass the login type (user or admin) to the login function
      console.log("Login submitted with activeTab:", activeTab);
      login({ ...formData, loginType: activeTab });
    }
  };

  const handleGoBack = (e) => {
    if (e) e.preventDefault();
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 flex items-center justify-center p-6 relative font-sans selection:bg-amber-400 selection:text-stone-950 overflow-hidden">
      <AmbientBackground height="h-full inset-0" />

      {/* Top Left Navigation - Go Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          to="/"
          onClick={(e) => {
            if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
              e.preventDefault();
              navigate(-1);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-stone-900/80 text-xs font-sans uppercase font-bold tracking-widest text-stone-300 hover:text-amber-300 hover:border-amber-400/60 hover:bg-stone-900 transition-all shadow-xl backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Go Back</span>
        </Link>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10 py-8">
        
        {/* Left Side - Logo and Branding */}
        <Link to="/" className="flex flex-col items-center justify-center text-center p-4 group cursor-pointer">
          <img
            src={Arduino}
            alt="Arduino Mega"
            className="w-72 sm:w-96 md:w-[420px] lg:w-[460px] max-w-full h-auto mb-6 filter drop-shadow-[0_20px_50px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform duration-500"
          />
          <h2 className="font-serif text-3xl lg:text-4xl text-stone-100 uppercase tracking-widest mb-1 font-normal group-hover:text-amber-300 transition-colors">AICTE IDEA LAB</h2>
          <p className="font-dancing text-amber-200 text-xl">Sanctuary of Innovation</p>
        </Link>

        {/* Right Side - Login Form */}
        <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-8 md:p-10 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="font-serif text-4xl text-stone-100 uppercase tracking-wider mb-2 font-normal">Portal Access</h1>
            <p className="text-xs font-sans text-stone-400">
              Do not have an account?{' '}
              <Link to="/signup" className="text-amber-300 hover:text-amber-200 font-bold uppercase tracking-wider">
                Sign-Up
              </Link>
            </p>
          </div>

          {/* Tab Selection */}
          <div className="mb-6 border-b border-amber-500/20">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('user')}
                className={`flex-1 pb-3 font-sans text-xs uppercase font-bold tracking-widest transition-all ${activeTab === 'user'
                    ? 'text-amber-300 border-b-2 border-amber-400 -mb-0.5'
                    : 'text-stone-500 hover:text-stone-300'
                  }`}
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`flex-1 pb-3 font-sans text-xs uppercase font-bold tracking-widest transition-all ${activeTab === 'admin'
                    ? 'text-amber-300 border-b-2 border-amber-400 -mb-0.5'
                    : 'text-stone-500 hover:text-stone-300'
                  }`}
              >
                Admin Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-sans uppercase tracking-widest text-stone-300 mb-2 font-semibold">
                Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-amber-400/70" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-4 py-3 bg-stone-900/80 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition ${errors.email && touched.email ? 'border-rose-500' : 'border-amber-500/30'
                    }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1.5 text-xs text-rose-400 font-sans">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-sans uppercase tracking-widest text-stone-300 mb-2 font-semibold">
                Password <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-amber-400/70" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-11 py-3 bg-stone-900/80 border rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition ${errors.password && touched.password ? 'border-rose-500' : 'border-amber-500/30'
                    }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-amber-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1.5 text-xs text-rose-400 font-sans">{errors.password}</p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between font-sans text-xs">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-amber-400 bg-stone-900 border-amber-500/30 rounded accent-amber-400 focus:ring-amber-400"
                />
                <label htmlFor="rememberMe" className="ml-2 text-stone-300">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-amber-300 hover:text-amber-200 uppercase tracking-wider text-[11px] font-semibold">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans text-xs uppercase font-bold tracking-[0.2em] hover:brightness-110 hover:shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg mt-2 flex justify-center items-center"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                activeTab === 'admin' ? "Admin Access Login" : "Authenticate & Enter"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};