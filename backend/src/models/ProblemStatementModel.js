import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const ProblemStatement = sequelize.define(
  "ProblemStatement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "draft"),
      defaultValue: "pending",
      allowNull: false,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "admin_notes",
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "reviewed_by",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reviewed_at",
    },

    // Section A: Basic Organisation Details - Public
    organisationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "organisation_name",
    },
    organisationType: {
      type: DataTypes.ENUM("NGO", "Government", "Startup", "Community Group", "Individual", "Other"),
      allowNull: false,
      field: "organisation_type",
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cityRegion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "city_region",
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    primaryContactName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "primary_contact_name",
    },
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "contact_email",
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "contact_phone",
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "short_description",
    },
    keyFocusAreas: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "key_focus_areas",
    },

    // Section A: Confidential
    registrationNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "registration_number",
    },
    yearsOfOperation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "years_of_operation",
    },
    teamSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "team_size",
    },
    fundingSources: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "funding_sources",
    },
    previousCollaborations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "previous_collaborations",
    },
    sensitivities: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Section B: Problem Statement Overview - Public
    problemTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "problem_title",
    },
    oneLineSummary: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "one_line_summary",
    },
    detailedDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "detailed_description",
    },
    whoIsAffected: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "who_is_affected",
    },
    geographicContext: {
      type: DataTypes.ENUM("Rural", "Urban", "Tribal", "Coastal", "Forest", "Industrial"),
      allowNull: false,
      field: "geographic_context",
    },
    whyImportantNow: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "why_important_now",
    },
    expectedImpact: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "expected_impact",
    },

    // Section B: Confidential
    rootCauses: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "root_causes",
    },
    previousAttempts: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "previous_attempts",
    },
    hiddenConstraints: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "hidden_constraints",
    },
    stakeholderConflicts: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "stakeholder_conflicts",
    },
    risks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Section C: SDG and Thematic Alignment - Public
    relevantSDGs: {
      type: DataTypes.JSON,
      allowNull: false,
      field: "relevant_sdgs",
    },
    sectorCategory: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "sector_category",
    },
    beneficiaryGroups: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "beneficiary_groups",
    },

    // Section C: Confidential
    realPriority: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "real_priority",
    },
    politicalAlignment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "political_alignment",
    },

    // Section D: Field Context and Access - Public
    fieldLocations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "field_locations",
    },
    siteVisitsAvailable: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true,
      field: "site_visits_available",
    },
    localCoordinatorAvailable: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true,
      field: "local_coordinator_available",
    },
    languagesSpoken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "languages_spoken",
    },
    numberOfBeneficiaries: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "number_of_beneficiaries",
    },

    // Section D: Confidential
    safetyConsiderations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "safety_considerations",
    },
    culturalProtocols: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "cultural_protocols",
    },
    localPowerStructures: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "local_power_structures",
    },
    restrictedAreas: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "restricted_areas",
    },

    // Section E: Data and Resources - Public
    dataTypesAvailable: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "data_types_available",
    },
    toolsInfrastructure: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "tools_infrastructure",
    },
    longTermCollaboration: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true,
      field: "long_term_collaboration",
    },

    // Section E: Confidential
    dataSensitivityLevel: {
      type: DataTypes.ENUM("Low", "Moderate", "High"),
      allowNull: true,
      field: "data_sensitivity_level",
    },
    ndaRequired: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "nda_required",
    },
    internalDatasets: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "internal_datasets",
    },

    // Section F: Expectations from REACT - Public
    supportType: {
      type: DataTypes.JSON,
      allowNull: false,
      field: "support_type",
    },
    expectedOutcomes: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "expected_outcomes",
    },
    preferredTimeline: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "preferred_timeline",
    },

    // Section F: Confidential
    budgetExpectations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "budget_expectations",
    },
    decisionMakingAuthority: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "decision_making_authority",
    },
    internalExpectations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "internal_expectations",
    },

    // Section G: Ethics and Consent - Public
    consentShareWithStudents: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: false,
      field: "consent_share_with_students",
    },
    consentPublishOutcomes: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: false,
      field: "consent_publish_outcomes",
    },

    // Section G: Confidential
    legalEthicalApprovals: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "legal_ethical_approvals",
    },
    sensitiveCommunities: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "sensitive_communities",
    },

    // Section H: Supporting Materials - Public
    mediaLinks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "media_links",
    },

    // Section H: Confidential
    internalReports: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "internal_reports",
    },
    fieldNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "field_notes",
    },
  },
  {
    tableName: "problem_statements",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ProblemStatement;
