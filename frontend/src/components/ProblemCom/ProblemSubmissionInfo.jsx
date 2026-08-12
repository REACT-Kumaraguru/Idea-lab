import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, FileText, Shield, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Navbar from "../Navbar";
import AmbientBackground from "../AmbientBackground";

const ProblemSubmissionInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      <AmbientBackground height="fixed inset-0" />
      <Navbar />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="serene-glass-card rounded-3xl border border-amber-500/30 p-8 md:p-10 shadow-2xl mb-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-2xl mb-4 text-amber-300">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-stone-100 uppercase tracking-wider font-normal mb-2">
              Problem Statement Submission
            </h1>
            <p className="text-xs font-dancing text-amber-200/90">
              Submit your industrial challenge for REACT collaboration & prototyping
            </p>
          </div>

          {/* Important Notice */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-lg text-amber-300 uppercase tracking-wide mb-1">Review & Verification Process</h3>
                <p className="text-xs font-sans text-stone-300 font-light leading-relaxed">
                  Your problem statement will be reviewed by our faculty admin team. Once approved, 
                  it will be listed publicly for students and industrial collaborators to view and engage with.
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-10">
            <h2 className="font-serif text-2xl text-stone-100 uppercase tracking-wide mb-6">Submission Process</h2>
            <div className="space-y-4 font-sans text-xs">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-900/80 border border-amber-500/15">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono font-bold flex items-center justify-center">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base text-stone-100 uppercase tracking-wide mb-1">Fill Out the Specification Form</h3>
                  <p className="text-stone-400 font-light leading-relaxed">
                    Complete all required sections with accurate information about your organization 
                    and the industry challenge you are facing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-900/80 border border-amber-500/15">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono font-bold flex items-center justify-center">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base text-stone-100 uppercase tracking-wide mb-1">Admin Faculty Review</h3>
                  <p className="text-stone-400 font-light leading-relaxed">
                    Our faculty admin team will review your submission to ensure it meets our guidelines 
                    and aligns with AICTE IDEA Lab objectives.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-900/80 border border-amber-500/15">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono font-bold flex items-center justify-center">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base text-stone-100 uppercase tracking-wide mb-1">Approval & Publication</h3>
                  <p className="text-stone-400 font-light leading-relaxed">
                    Once approved, your problem statement will be published and visible to students 
                    and collaborators who can engage with your project.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 font-sans text-xs">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-900/60 border border-amber-500/15">
              <Shield className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-serif text-base text-stone-100 uppercase tracking-wider mb-1">Confidential Protection</h3>
                <p className="text-stone-400 font-light leading-relaxed">
                  Sensitive information marked as "Confidential" will only be visible to admins 
                  and approved collaborators.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-900/60 border border-amber-500/15">
              <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-serif text-base text-stone-100 uppercase tracking-wider mb-1">Review Timeline</h3>
                <p className="text-stone-400 font-light leading-relaxed">
                  Typical review time is 3-5 business days. You'll be notified via email 
                  once your submission is reviewed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-amber-500/20 font-sans text-xs">
            <button
              onClick={() => navigate("/upload-problem/form")}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-bold uppercase tracking-[0.2em] py-3.5 px-6 rounded-full hover:brightness-110 shadow-lg cursor-pointer transition-all"
            >
              <span>Continue to Specification Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/products"
              className="flex-1 flex items-center justify-center gap-2 border border-amber-500/30 bg-stone-900 text-stone-300 font-bold uppercase tracking-wider py-3.5 px-6 rounded-full hover:text-amber-300 transition-colors"
            >
              <span>Back to Hardware Catalog</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="serene-glass-card rounded-2xl border border-amber-500/20 p-6 text-xs font-sans">
          <h3 className="font-serif text-lg text-amber-300 uppercase tracking-wider mb-2">Need Guidance?</h3>
          <p className="text-stone-400 font-light leading-relaxed mb-3">
            If you have questions about the submission process or need assistance filling out 
            the form, please contact our support team.
          </p>
          <p className="text-stone-300">
            <strong>Email:</strong> support@idealab.edu | <strong>Phone:</strong> +91 9361883441
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemSubmissionInfo;
