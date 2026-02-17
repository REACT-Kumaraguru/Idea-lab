import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, ArrowRight, Upload, X, CheckCircle } from "lucide-react";
import Navbar from "../Navbar";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

const ProjectForm = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section A: Basic Organisation Details
    // Public
    organisationName: "",
    organisationType: "",
    country: "",
    state: "",
    cityRegion: "",
    website: "",
    primaryContactName: "",
    contactEmail: "",
    contactPhone: "",
    shortDescription: "",
    keyFocusAreas: "",
    // Confidential
    registrationNumber: "",
    yearsOfOperation: "",
    teamSize: "",
    fundingSources: "",
    previousCollaborations: "",
    sensitivities: "",

    // Section B: Problem Statement Overview
    // Public
    problemTitle: "",
    oneLineSummary: "",
    detailedDescription: "",
    whoIsAffected: "",
    geographicContext: "",
    whyImportantNow: "",
    expectedImpact: "",
    // Confidential
    rootCauses: "",
    previousAttempts: "",
    hiddenConstraints: "",
    stakeholderConflicts: "",
    risks: "",

    // Section C: SDG and Thematic Alignment
    // Public
    relevantSDGs: [],
    sectorCategory: "",
    beneficiaryGroups: "",
    // Confidential
    realPriority: "",
    politicalAlignment: "",

    // Section D: Field Context and Access
    // Public
    fieldLocations: "",
    siteVisitsAvailable: "",
    localCoordinatorAvailable: "",
    languagesSpoken: "",
    numberOfBeneficiaries: "",
    // Confidential
    safetyConsiderations: "",
    culturalProtocols: "",
    localPowerStructures: "",
    restrictedAreas: "",

    // Section E: Data and Resources
    // Public
    dataTypesAvailable: "",
    toolsInfrastructure: "",
    longTermCollaboration: "",
    // Confidential
    dataSensitivityLevel: "",
    ndaRequired: "",
    internalDatasets: "",

    // Section F: Expectations from REACT
    // Public
    supportType: [],
    expectedOutcomes: "",
    preferredTimeline: "",
    // Confidential
    budgetExpectations: "",
    decisionMakingAuthority: "",
    internalExpectations: "",

    // Section G: Ethics and Consent
    // Public
    consentShareWithStudents: "",
    consentPublishOutcomes: "",
    // Confidential
    legalEthicalApprovals: "",
    sensitiveCommunities: "",

    // Section H: Supporting Materials
    // Public
    images: [],
    reports: [],
    mediaLinks: "",
    // Confidential
    internalReports: "",
    fieldNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const sections = [
    { title: "Basic Organisation Details", key: "A" },
    { title: "Problem Statement Overview", key: "B" },
    { title: "SDG and Thematic Alignment", key: "C" },
    { title: "Field Context and Access", key: "D" },
    { title: "Data and Resources", key: "E" },
    { title: "Expectations from REACT", key: "F" },
    { title: "Ethics and Consent", key: "G" },
    { title: "Supporting Materials", key: "H" },
  ];

  const organisationTypes = [
    "NGO",
    "Government",
    "Startup",
    "Community Group",
    "Individual",
    "Other",
  ];

  const geographicContexts = [
    "Rural",
    "Urban",
    "Tribal",
    "Coastal",
    "Forest",
    "Industrial",
  ];

  const sdgOptions = [
    "No Poverty",
    "Zero Hunger",
    "Good Health and Well-being",
    "Quality Education",
    "Gender Equality",
    "Clean Water and Sanitation",
    "Affordable and Clean Energy",
    "Decent Work and Economic Growth",
    "Industry, Innovation and Infrastructure",
    "Reduced Inequalities",
    "Sustainable Cities and Communities",
    "Responsible Consumption and Production",
    "Climate Action",
    "Life Below Water",
    "Life on Land",
    "Peace, Justice and Strong Institutions",
    "Partnerships for the Goals",
  ];

  const supportTypes = [
    "Research",
    "Engineering",
    "Policy",
    "Design",
    "Systems Analysis",
    "Documentation",
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      if (name === "images") {
        setFormData((prev) => ({
          ...prev,
          images: Array.from(files),
        }));
      } else if (name === "reports") {
        setFormData((prev) => ({
          ...prev,
          reports: Array.from(files),
        }));
      }
    } else if (type === "checkbox") {
      const fieldName = name.includes("SDG") ? "relevantSDGs" : "supportType";
      const currentArray = formData[fieldName] || [];
      if (e.target.checked) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: [...currentArray, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: currentArray.filter((item) => item !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Helper function to count words accurately
  const countWords = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateSection = (sectionIndex) => {
    const newErrors = {};
    const section = sections[sectionIndex];

    // Section A validations
    if (sectionIndex === 0) {
      if (!formData.organisationName.trim())
        newErrors.organisationName = "Organisation name is required";
      if (!formData.organisationType)
        newErrors.organisationType = "Organisation type is required";
      if (!formData.country.trim())
        newErrors.country = "Country is required";
      if (!formData.state.trim())
        newErrors.state = "State is required";
      if (!formData.cityRegion.trim())
        newErrors.cityRegion = "City/Region is required";
      if (!formData.primaryContactName.trim())
        newErrors.primaryContactName = "Primary contact name is required";
      if (!formData.contactEmail.trim())
        newErrors.contactEmail = "Contact email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail))
        newErrors.contactEmail = "Invalid email address";
      if (!formData.contactPhone.trim())
        newErrors.contactPhone = "Contact phone is required";
      if (!formData.shortDescription.trim())
        newErrors.shortDescription = "Short description is required";
      else {
        const trimmed = formData.shortDescription.trim();
        const wordCount = trimmed ? trimmed.split(/\s+/).filter(word => word.length > 0).length : 0;
        if (wordCount < 100 || wordCount > 150)
          newErrors.shortDescription =
            `Description must be between 100-150 words (currently ${wordCount} words)`;
      }
    }

    // Section B validations
    if (sectionIndex === 1) {
      if (!formData.problemTitle.trim())
        newErrors.problemTitle = "Problem title is required";
      if (!formData.oneLineSummary.trim())
        newErrors.oneLineSummary = "One line summary is required";
      if (!formData.detailedDescription.trim())
        newErrors.detailedDescription = "Detailed description is required";
      else {
        const trimmed = formData.detailedDescription.trim();
        const wordCount = trimmed ? trimmed.split(/\s+/).filter(word => word.length > 0).length : 0;
        if (wordCount < 300 || wordCount > 500)
          newErrors.detailedDescription =
            `Description must be between 300-500 words (currently ${wordCount} words)`;
      }
      if (!formData.whoIsAffected.trim())
        newErrors.whoIsAffected = "This field is required";
      if (!formData.geographicContext)
        newErrors.geographicContext = "Geographic context is required";
      if (!formData.whyImportantNow.trim())
        newErrors.whyImportantNow = "This field is required";
      if (!formData.expectedImpact.trim())
        newErrors.expectedImpact = "Expected impact is required";
    }

    // Section C validations
    if (sectionIndex === 2) {
      if (formData.relevantSDGs.length === 0)
        newErrors.relevantSDGs = "At least one SDG must be selected";
      if (!formData.sectorCategory.trim())
        newErrors.sectorCategory = "Sector category is required";
      if (!formData.beneficiaryGroups.trim())
        newErrors.beneficiaryGroups = "Beneficiary groups are required";
    }

    // Section F validations
    if (sectionIndex === 5) {
      if (formData.supportType.length === 0)
        newErrors.supportType = "At least one support type must be selected";
      if (!formData.expectedOutcomes.trim())
        newErrors.expectedOutcomes = "Expected outcomes are required";
      if (!formData.preferredTimeline.trim())
        newErrors.preferredTimeline = "Preferred timeline is required";
    }

    // Section G validations
    if (sectionIndex === 6) {
      if (!formData.consentShareWithStudents)
        newErrors.consentShareWithStudents = "Consent is required";
      if (!formData.consentPublishOutcomes)
        newErrors.consentPublishOutcomes = "Consent is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const removeFile = (type, index) => {
    if (type === "image") {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else if (type === "report") {
      setFormData((prev) => ({
        ...prev,
        reports: prev.reports.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all sections
    let isValid = true;
    for (let i = 0; i < sections.length; i++) {
      if (!validateSection(i)) {
        isValid = false;
        setCurrentSection(i);
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      }
    }

    if (!isValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "images" || key === "reports") {
          // Handle file arrays
          formData[key].forEach((file) => {
            submitData.append(key, file);
          });
        } else if (key === "relevantSDGs" || key === "supportType") {
          // Handle arrays
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      const response = await axiosInstance.post("/problems/submit", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Problem statement submitted successfully! It will be reviewed by admin.");
        navigate("/my-submissions");
      } else {
        toast.error(response.data.message || "Failed to submit problem statement");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message ||
          "Error submitting problem statement. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSectionA = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
        <p className="text-sm text-blue-700">
          This information will be visible to students and collaborators once approved.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organisation Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organisationName"
            value={formData.organisationName}
            onChange={handleChange}
            onBlur={() => handleBlur("organisationName")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.organisationName
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.organisationName && (
            <p className="text-red-500 text-xs mt-1">{errors.organisationName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organisation Type <span className="text-red-500">*</span>
          </label>
          <select
            name="organisationType"
            value={formData.organisationType}
            onChange={handleChange}
            onBlur={() => handleBlur("organisationType")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.organisationType
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          >
            <option value="">Select type</option>
            {organisationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.organisationType && (
            <p className="text-red-500 text-xs mt-1">{errors.organisationType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            onBlur={() => handleBlur("country")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.country
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            onBlur={() => handleBlur("state")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.state
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City / Region <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="cityRegion"
            value={formData.cityRegion}
            onChange={handleChange}
            onBlur={() => handleBlur("cityRegion")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.cityRegion
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.cityRegion && (
            <p className="text-red-500 text-xs mt-1">{errors.cityRegion}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website or Public Profile
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Contact Person Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="primaryContactName"
            value={formData.primaryContactName}
            onChange={handleChange}
            onBlur={() => handleBlur("primaryContactName")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.primaryContactName
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.primaryContactName && (
            <p className="text-red-500 text-xs mt-1">{errors.primaryContactName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            onBlur={() => handleBlur("contactEmail")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.contactEmail
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.contactEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            onBlur={() => handleBlur("contactPhone")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.contactPhone
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.contactPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Short Organisation Description (100 to 150 words){" "}
            <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs ${
            countWords(formData.shortDescription) < 100 || countWords(formData.shortDescription) > 150
              ? "text-red-500"
              : countWords(formData.shortDescription) >= 100 && countWords(formData.shortDescription) <= 150
              ? "text-green-600"
              : "text-gray-500"
          }`}>
            {countWords(formData.shortDescription)} / 100-150 words
          </span>
        </div>
        <textarea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          onBlur={() => handleBlur("shortDescription")}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.shortDescription
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="Describe your organisation in 100-150 words..."
        />
        {errors.shortDescription && (
          <p className="text-red-500 text-xs mt-1">{errors.shortDescription}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Key Focus Areas (Health, Agriculture, Energy, Education, Environment, Social
          Welfare, etc.)
        </label>
        <input
          type="text"
          name="keyFocusAreas"
          value={formData.keyFocusAreas}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Health, Education, Environment"
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          This information will only be visible to admins and approved collaborators.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number / Legal Status
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Operation
            </label>
            <input
              type="text"
              name="yearsOfOperation"
              value={formData.yearsOfOperation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Size
            </label>
            <input
              type="text"
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funding Sources (Grant / CSR / Govt Scheme / Self Funded)
            </label>
            <input
              type="text"
              name="fundingSources"
              value={formData.fundingSources}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Previous collaborations with academia or research groups
          </label>
          <textarea
            name="previousCollaborations"
            value={formData.previousCollaborations}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Any political, legal, or community sensitivities to be aware of
          </label>
          <textarea
            name="sensitivities"
            value={formData.sensitivities}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderSectionB = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Problem Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="problemTitle"
          value={formData.problemTitle}
          onChange={handleChange}
          onBlur={() => handleBlur("problemTitle")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.problemTitle
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.problemTitle && (
          <p className="text-red-500 text-xs mt-1">{errors.problemTitle}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          One Line Problem Summary <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="oneLineSummary"
          value={formData.oneLineSummary}
          onChange={handleChange}
          onBlur={() => handleBlur("oneLineSummary")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.oneLineSummary
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.oneLineSummary && (
          <p className="text-red-500 text-xs mt-1">{errors.oneLineSummary}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Detailed Problem Description (300 to 500 words){" "}
            <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs ${
            countWords(formData.detailedDescription) < 300 || countWords(formData.detailedDescription) > 500
              ? "text-red-500"
              : countWords(formData.detailedDescription) >= 300 && countWords(formData.detailedDescription) <= 500
              ? "text-green-600"
              : "text-gray-500"
          }`}>
            {countWords(formData.detailedDescription)} / 300-500 words
          </span>
        </div>
        <textarea
          name="detailedDescription"
          value={formData.detailedDescription}
          onChange={handleChange}
          onBlur={() => handleBlur("detailedDescription")}
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.detailedDescription
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.detailedDescription && (
          <p className="text-red-500 text-xs mt-1">{errors.detailedDescription}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Who is affected by this problem? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="whoIsAffected"
          value={formData.whoIsAffected}
          onChange={handleChange}
          onBlur={() => handleBlur("whoIsAffected")}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.whoIsAffected
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.whoIsAffected && (
          <p className="text-red-500 text-xs mt-1">{errors.whoIsAffected}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Geographic Context <span className="text-red-500">*</span>
        </label>
        <select
          name="geographicContext"
          value={formData.geographicContext}
          onChange={handleChange}
          onBlur={() => handleBlur("geographicContext")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.geographicContext
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        >
          <option value="">Select context</option>
          {geographicContexts.map((context) => (
            <option key={context} value={context}>
              {context}
            </option>
          ))}
        </select>
        {errors.geographicContext && (
          <p className="text-red-500 text-xs mt-1">{errors.geographicContext}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Why is this problem important right now? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="whyImportantNow"
          value={formData.whyImportantNow}
          onChange={handleChange}
          onBlur={() => handleBlur("whyImportantNow")}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.whyImportantNow
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.whyImportantNow && (
          <p className="text-red-500 text-xs mt-1">{errors.whyImportantNow}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expected impact if solved <span className="text-red-500">*</span>
        </label>
        <textarea
          name="expectedImpact"
          value={formData.expectedImpact}
          onChange={handleChange}
          onBlur={() => handleBlur("expectedImpact")}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.expectedImpact
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.expectedImpact && (
          <p className="text-red-500 text-xs mt-1">{errors.expectedImpact}</p>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Root causes already identified internally
            </label>
            <textarea
              name="rootCauses"
              value={formData.rootCauses}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous attempts to solve this problem and why they failed
            </label>
            <textarea
              name="previousAttempts"
              value={formData.previousAttempts}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hidden constraints or operational realities
            </label>
            <textarea
              name="hiddenConstraints"
              value={formData.hiddenConstraints}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stakeholder conflicts or sensitivities
            </label>
            <textarea
              name="stakeholderConflicts"
              value={formData.stakeholderConflicts}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Any risks students must know before engagement
            </label>
            <textarea
              name="risks"
              value={formData.risks}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionC = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relevant UN SDGs (Select all that apply) <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-2 gap-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
          {sdgOptions.map((sdg) => (
            <label key={sdg} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="SDG"
                value={sdg}
                checked={formData.relevantSDGs.includes(sdg)}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{sdg}</span>
            </label>
          ))}
        </div>
        {errors.relevantSDGs && (
          <p className="text-red-500 text-xs mt-1">{errors.relevantSDGs}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sector Category <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="sectorCategory"
          value={formData.sectorCategory}
          onChange={handleChange}
          onBlur={() => handleBlur("sectorCategory")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.sectorCategory
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="e.g., Agriculture, Disability, Climate, Infrastructure, Governance"
        />
        {errors.sectorCategory && (
          <p className="text-red-500 text-xs mt-1">{errors.sectorCategory}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beneficiary Groups <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="beneficiaryGroups"
          value={formData.beneficiaryGroups}
          onChange={handleChange}
          onBlur={() => handleBlur("beneficiaryGroups")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.beneficiaryGroups
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="e.g., Farmers, Children, Women, Elderly, Persons with Disabilities"
        />
        {errors.beneficiaryGroups && (
          <p className="text-red-500 text-xs mt-1">{errors.beneficiaryGroups}</p>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Real priority vs public narrative (if different)
            </label>
            <textarea
              name="realPriority"
              value={formData.realPriority}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Political or institutional alignment concerns
            </label>
            <textarea
              name="politicalAlignment"
              value={formData.politicalAlignment}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionD = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Field Location(s)
        </label>
        <input
          type="text"
          name="fieldLocations"
          value={formData.fieldLocations}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Availability for Site Visits
          </label>
          <select
            name="siteVisitsAvailable"
            value={formData.siteVisitsAvailable}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local Coordinator Available
          </label>
          <select
            name="localCoordinatorAvailable"
            value={formData.localCoordinatorAvailable}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Languages Spoken in Field
          </label>
          <input
            type="text"
            name="languagesSpoken"
            value={formData.languagesSpoken}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approximate Number of Beneficiaries
          </label>
          <input
            type="text"
            name="numberOfBeneficiaries"
            value={formData.numberOfBeneficiaries}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Safety considerations
            </label>
            <textarea
              name="safetyConsiderations"
              value={formData.safetyConsiderations}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cultural protocols or restrictions
            </label>
            <textarea
              name="culturalProtocols"
              value={formData.culturalProtocols}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local power structures students should be aware of
            </label>
            <textarea
              name="localPowerStructures"
              value={formData.localPowerStructures}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Any areas or topics that must not be documented publicly
            </label>
            <textarea
              name="restrictedAreas"
              value={formData.restrictedAreas}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionE = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Types of Data Available (Reports, Surveys, Images, Maps, Logs)
        </label>
        <textarea
          name="dataTypesAvailable"
          value={formData.dataTypesAvailable}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tools or Infrastructure already present
        </label>
        <textarea
          name="toolsInfrastructure"
          value={formData.toolsInfrastructure}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Willingness to collaborate long term
        </label>
        <select
          name="longTermCollaboration"
          value={formData.longTermCollaboration}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data sensitivity level
            </label>
            <select
              name="dataSensitivityLevel"
              value={formData.dataSensitivityLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NDA or permissions required
            </label>
            <textarea
              name="ndaRequired"
              value={formData.ndaRequired}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal datasets not for public sharing
            </label>
            <textarea
              name="internalDatasets"
              value={formData.internalDatasets}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionF = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What kind of support are you looking for? (Select all that apply){" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-2 gap-2 border border-gray-300 rounded-lg p-4">
          {supportTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="supportType"
                value={type}
                checked={formData.supportType.includes(type)}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
        {errors.supportType && (
          <p className="text-red-500 text-xs mt-1">{errors.supportType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expected Outcomes <span className="text-red-500">*</span>
        </label>
        <textarea
          name="expectedOutcomes"
          value={formData.expectedOutcomes}
          onChange={handleChange}
          onBlur={() => handleBlur("expectedOutcomes")}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.expectedOutcomes
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.expectedOutcomes && (
          <p className="text-red-500 text-xs mt-1">{errors.expectedOutcomes}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Timeline <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="preferredTimeline"
          value={formData.preferredTimeline}
          onChange={handleChange}
          onBlur={() => handleBlur("preferredTimeline")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.preferredTimeline
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="e.g., 3 months, 6 months, 1 year"
        />
        {errors.preferredTimeline && (
          <p className="text-red-500 text-xs mt-1">{errors.preferredTimeline}</p>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget expectations or financial limitations
            </label>
            <textarea
              name="budgetExpectations"
              value={formData.budgetExpectations}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decision making authority within organisation
            </label>
            <textarea
              name="decisionMakingAuthority"
              value={formData.decisionMakingAuthority}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal expectations that may not be publicly stated
            </label>
            <textarea
              name="internalExpectations"
              value={formData.internalExpectations}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionG = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consent to share problem statement with students and collaborators{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="consentShareWithStudents"
              value="Yes"
              checked={formData.consentShareWithStudents === "Yes"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="consentShareWithStudents"
              value="No"
              checked={formData.consentShareWithStudents === "No"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
        {errors.consentShareWithStudents && (
          <p className="text-red-500 text-xs mt-1">{errors.consentShareWithStudents}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consent to publish outcomes publicly <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="consentPublishOutcomes"
              value="Yes"
              checked={formData.consentPublishOutcomes === "Yes"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="consentPublishOutcomes"
              value="No"
              checked={formData.consentPublishOutcomes === "No"}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
        {errors.consentPublishOutcomes && (
          <p className="text-red-500 text-xs mt-1">{errors.consentPublishOutcomes}</p>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Any legal or ethical approvals required
            </label>
            <textarea
              name="legalEthicalApprovals"
              value={formData.legalEthicalApprovals}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensitive communities involved
            </label>
            <textarea
              name="sensitiveCommunities"
              value={formData.sensitiveCommunities}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionH = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">PUBLIC INFORMATION (Visible)</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Images (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="images-upload"
          />
          <label
            htmlFor="images-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click to upload or drag and drop images
            </span>
          </label>
        </div>
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile("image", index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Reports or Documents (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            name="reports"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="hidden"
            id="reports-upload"
          />
          <label
            htmlFor="reports-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click to upload or drag and drop documents (PDF, DOC, DOCX)
            </span>
          </label>
        </div>
        {formData.reports.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.reports.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile("report", index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Links to Videos or Media (Optional)
        </label>
        <input
          type="text"
          name="mediaLinks"
          value={formData.mediaLinks}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          BACKGROUND INFORMATION (Confidential)
        </h3>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal reports not for public circulation
            </label>
            <textarea
              name="internalReports"
              value={formData.internalReports}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field notes or unofficial documentation
            </label>
            <textarea
              name="fieldNotes"
              value={formData.fieldNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return renderSectionA();
      case 1:
        return renderSectionB();
      case 2:
        return renderSectionC();
      case 3:
        return renderSectionD();
      case 4:
        return renderSectionE();
      case 5:
        return renderSectionF();
      case 6:
        return renderSectionG();
      case 7:
        return renderSectionH();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Section Navigation */}
        <div className="mb-6 flex flex-wrap gap-2">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSection(index);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                index === currentSection
                  ? "bg-blue-600 text-white"
                  : index < currentSection
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {section.key}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Section {sections[currentSection].key}: {sections[currentSection].title}
            </h2>
          </div>

          {renderCurrentSection()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                currentSection === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Submit Problem Statement
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
