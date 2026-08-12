import ProblemStatement from "../models/ProblemStatementModel.js";
import ProblemStatementImage from "../models/ProblemStatementImageModel.js";
import ProblemStatementDocument from "../models/ProblemStatementDocumentModel.js";
import User from "../models/UserModel.js";
import { sendProblemSubmittedEmail, sendProblemAcceptedEmail } from "../lib/email.js";

export const submitProblemStatement = async (req, res) => {
  try {
    const userId = req.user.id; // From protectRoute middleware

    // Parse JSON fields from form data
    let relevantSDGs = [];
    let supportType = [];
    
    try {
      if (req.body.relevantSDGs) {
        relevantSDGs = typeof req.body.relevantSDGs === 'string' 
          ? JSON.parse(req.body.relevantSDGs) 
          : req.body.relevantSDGs;
      }
    } catch (e) {
      console.error("Error parsing relevantSDGs:", e);
      relevantSDGs = [];
    }
    
    try {
      if (req.body.supportType) {
        supportType = typeof req.body.supportType === 'string'
          ? JSON.parse(req.body.supportType)
          : req.body.supportType;
      }
    } catch (e) {
      console.error("Error parsing supportType:", e);
      supportType = [];
    }

    // Create problem statement record
    const problemStatement = await ProblemStatement.create({
      userId,
      status: "pending",
      // Section A: Basic Organisation Details - Public
      organisationName: req.body.organisationName,
      organisationType: req.body.organisationType,
      country: req.body.country,
      state: req.body.state,
      cityRegion: req.body.cityRegion,
      website: req.body.website || null,
      primaryContactName: req.body.primaryContactName,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      shortDescription: req.body.shortDescription,
      keyFocusAreas: req.body.keyFocusAreas || null,
      // Section A: Confidential
      registrationNumber: req.body.registrationNumber || null,
      yearsOfOperation: req.body.yearsOfOperation || null,
      teamSize: req.body.teamSize || null,
      fundingSources: req.body.fundingSources || null,
      previousCollaborations: req.body.previousCollaborations || null,
      sensitivities: req.body.sensitivities || null,
      // Section B: Problem Statement Overview - Public
      problemTitle: req.body.problemTitle,
      oneLineSummary: req.body.oneLineSummary,
      detailedDescription: req.body.detailedDescription,
      whoIsAffected: req.body.whoIsAffected,
      geographicContext: req.body.geographicContext,
      whyImportantNow: req.body.whyImportantNow,
      expectedImpact: req.body.expectedImpact,
      // Section B: Confidential
      rootCauses: req.body.rootCauses || null,
      previousAttempts: req.body.previousAttempts || null,
      hiddenConstraints: req.body.hiddenConstraints || null,
      stakeholderConflicts: req.body.stakeholderConflicts || null,
      risks: req.body.risks || null,
      // Section C: SDG and Thematic Alignment - Public
      relevantSDGs,
      sectorCategory: req.body.sectorCategory,
      beneficiaryGroups: req.body.beneficiaryGroups,
      // Section C: Confidential
      realPriority: req.body.realPriority || null,
      politicalAlignment: req.body.politicalAlignment || null,
      // Section D: Field Context and Access - Public
      fieldLocations: req.body.fieldLocations || null,
      siteVisitsAvailable: req.body.siteVisitsAvailable || null,
      localCoordinatorAvailable: req.body.localCoordinatorAvailable || null,
      languagesSpoken: req.body.languagesSpoken || null,
      numberOfBeneficiaries: req.body.numberOfBeneficiaries || null,
      // Section D: Confidential
      safetyConsiderations: req.body.safetyConsiderations || null,
      culturalProtocols: req.body.culturalProtocols || null,
      localPowerStructures: req.body.localPowerStructures || null,
      restrictedAreas: req.body.restrictedAreas || null,
      // Section E: Data and Resources - Public
      dataTypesAvailable: req.body.dataTypesAvailable || null,
      toolsInfrastructure: req.body.toolsInfrastructure || null,
      longTermCollaboration: req.body.longTermCollaboration || null,
      // Section E: Confidential
      dataSensitivityLevel: req.body.dataSensitivityLevel || null,
      ndaRequired: req.body.ndaRequired || null,
      internalDatasets: req.body.internalDatasets || null,
      // Section F: Expectations from REACT - Public
      supportType,
      expectedOutcomes: req.body.expectedOutcomes,
      preferredTimeline: req.body.preferredTimeline,
      // Section F: Confidential
      budgetExpectations: req.body.budgetExpectations || null,
      decisionMakingAuthority: req.body.decisionMakingAuthority || null,
      internalExpectations: req.body.internalExpectations || null,
      // Section G: Ethics and Consent - Public
      consentShareWithStudents: req.body.consentShareWithStudents,
      consentPublishOutcomes: req.body.consentPublishOutcomes,
      // Section G: Confidential
      legalEthicalApprovals: req.body.legalEthicalApprovals || null,
      sensitiveCommunities: req.body.sensitiveCommunities || null,
      // Section H: Supporting Materials - Public
      mediaLinks: req.body.mediaLinks || null,
      // Section H: Confidential
      internalReports: req.body.internalReports || null,
      fieldNotes: req.body.fieldNotes || null,
    });

    // Handle image uploads
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      const imagePromises = imageFiles.map((file) => {
        const imagePath = file.path.replace(/\\/g, "/");
        return ProblemStatementImage.create({
          problemStatementId: problemStatement.id,
          imagePath,
          imageName: file.originalname,
          imageSize: file.size,
          imageType: file.mimetype,
        });
      });
      await Promise.all(imagePromises);
    }

    // Handle document uploads
    if (req.files && req.files.reports) {
      const documentFiles = Array.isArray(req.files.reports) ? req.files.reports : [req.files.reports];
      const documentPromises = documentFiles.map((file) => {
        const documentPath = file.path.replace(/\\/g, "/");
        return ProblemStatementDocument.create({
          problemStatementId: problemStatement.id,
          documentPath,
          documentName: file.originalname,
          documentSize: file.size,
          documentType: file.mimetype,
        });
      });
      await Promise.all(documentPromises);
    }

    // Fetch the complete problem statement with relations
    const completeProblemStatement = await ProblemStatement.findByPk(problemStatement.id, {
      include: [
        { model: ProblemStatementImage, as: "images" },
        { model: ProblemStatementDocument, as: "documents" },
      ],
    });

    if (req.user?.email) {
      try {
        await sendProblemSubmittedEmail(req.user.email, req.user.fullName);
      } catch (emailErr) {
        console.error("Error sending problem submitted email:", emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Problem statement submitted successfully",
      data: completeProblemStatement,
    });
  } catch (error) {
    console.error("Error submitting problem statement:", error);
    console.error("Error stack:", error.stack);
    console.error("Request body keys:", Object.keys(req.body));
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

export const getMyProblemStatements = async (req, res) => {
  try {
    const userId = req.user.id;

    const problemStatements = await ProblemStatement.findAll({
      where: { userId },
      include: [
        { model: ProblemStatementImage, as: "images" },
        { model: ProblemStatementDocument, as: "documents" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: problemStatements,
    });
  } catch (error) {
    console.error("Error fetching problem statements:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getProblemStatementById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const problemStatement = await ProblemStatement.findOne({
      where: { id, userId },
      include: [
        { model: ProblemStatementImage, as: "images" },
        { model: ProblemStatementDocument, as: "documents" },
      ],
    });

    if (!problemStatement) {
      return res.status(404).json({
        success: false,
        message: "Problem statement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: problemStatement,
    });
  } catch (error) {
    console.error("Error fetching problem statement:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Admin routes
export const getAllProblemStatements = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const problemStatements = await ProblemStatement.findAll({
      where,
      include: [
        { model: ProblemStatementImage, as: "images" },
        { model: ProblemStatementDocument, as: "documents" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: problemStatements,
    });
  } catch (error) {
    console.error("Error fetching problem statements:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateProblemStatementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id; // Admin user from protectAdminRoute

    const problemStatement = await ProblemStatement.findByPk(id);

    if (!problemStatement) {
      return res.status(404).json({
        success: false,
        message: "Problem statement not found",
      });
    }

    await problemStatement.update({
      status,
      adminNotes: adminNotes || null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });

    if (status === "approved") {
      try {
        const withUser = await ProblemStatement.findByPk(id, {
          include: [{ model: User, as: "user", attributes: ["email", "fullName"] }],
        });
        if (withUser?.user?.email) {
          await sendProblemAcceptedEmail(
            withUser.user.email,
            withUser.user.fullName,
            withUser.problemTitle
          );
        }
      } catch (emailErr) {
        console.error("Error sending problem accepted email:", emailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Problem statement ${status} successfully`,
      data: problemStatement,
    });
  } catch (error) {
    console.error("Error updating problem statement status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
