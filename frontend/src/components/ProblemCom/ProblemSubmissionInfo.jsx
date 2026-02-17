import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, FileText, Shield, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Navbar from "../Navbar";

const ProblemSubmissionInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Problem Statement Submission
            </h1>
            <p className="text-gray-600">
              Submit your problem statement for REACT collaboration
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Review Process</h3>
                <p className="text-sm text-yellow-700">
                  Your problem statement will be reviewed by our admin team. Once approved, 
                  it will be listed publicly for students and collaborators to view and engage with.
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Process</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Fill Out the Form</h3>
                  <p className="text-sm text-gray-600">
                    Complete all required sections with accurate information about your organization 
                    and the problem you're facing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Admin Review</h3>
                  <p className="text-sm text-gray-600">
                    Our admin team will review your submission to ensure it meets our guidelines 
                    and aligns with REACT objectives.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Approval & Publication</h3>
                  <p className="text-sm text-gray-600">
                    Once approved, your problem statement will be published and visible to students 
                    and collaborators who can engage with your project.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Confidential Information</h3>
                <p className="text-sm text-gray-600">
                  Sensitive information marked as "Confidential" will only be visible to admins 
                  and approved collaborators.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Review Timeline</h3>
                <p className="text-sm text-gray-600">
                  Typical review time is 3-5 business days. You'll be notified via email 
                  once your submission is reviewed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Edit After Submission</h3>
                <p className="text-sm text-gray-600">
                  You can edit your submission before it's approved. After approval, 
                  contact admin for changes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Comprehensive Form</h3>
                <p className="text-sm text-gray-600">
                  The form includes multiple sections covering organization details, 
                  problem context, SDG alignment, and more.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/upload-problem/form")}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span>Continue to Form</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/products"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <span>Back to Equipment</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-700 mb-4">
            If you have questions about the submission process or need assistance filling out 
            the form, please contact our support team.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> support@idealab.edu | <strong>Phone:</strong> +91-XXX-XXX-XXXX
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemSubmissionInfo;
