import React, { useState } from 'react';
import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import AmbientBackground from "../AmbientBackground";

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    retypePassword: ''
  });

  const { signup, isSigningUp } = useAuthStore();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';

      case 'mobile':
        if (!value.trim()) return 'Mobile number is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit mobile number';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';

      case 'retypePassword':
        if (!value) return 'Please retype your password';
        if (value !== formData.password) return 'Passwords do not match';
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

    if (name === 'password' && touched.retypePassword) {
      const retypeError = formData.retypePassword !== value ? 'Passwords do not match' : '';
      setErrors(prev => ({ ...prev, retypePassword: retypeError }));
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
      name: true,
      mobile: true,
      email: true,
      password: true,
      retypePassword: true
    });

    if (Object.keys(newErrors).length === 0) {
      // Map frontend fields to backend expected fields
      const backendData = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.mobile,
      };
      signup(backendData);
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

      <div className="serene-glass-card rounded-3xl border border-amber-500/30 w-full max-w-md p-8 md:p-10 shadow-2xl relative z-10 my-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-stone-100 uppercase tracking-wider mb-1 font-normal">Create Account</h1>
          <p className="text-xs font-dancing text-amber-200/90">Join the sanctuary of innovation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter your full name"
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Mobile Number Field */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="10"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${errors.mobile && touched.mobile ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter 10-digit mobile number"
            />
            {errors.mobile && touched.mobile && (
              <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter your email"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Create a strong password"
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Retype Password Field */}
          <div>
            <label htmlFor="retypePassword" className="block text-sm font-medium text-gray-700 mb-1">
              Retype Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="retypePassword"
              name="retypePassword"
              value={formData.retypePassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${errors.retypePassword && touched.retypePassword ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Retype your password"
            />
            {errors.retypePassword && touched.retypePassword && (
              <p className="mt-1 text-sm text-red-500">{errors.retypePassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg flex justify-center items-center"
            disabled={isSigningUp}
          >
            {isSigningUp ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};