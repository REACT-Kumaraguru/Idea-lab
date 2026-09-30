import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const Hackathon = sequelize.define(
  "Hackathon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "end_date",
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "completed", "closed"),
      allowNull: false,
      defaultValue: "active",
    },
    registrationClosed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "registration_closed",
    },
    registrationClosedMessage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "registration_closed_message",
    },
    showResults: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "show_results",
    },
    schedule: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("schedule");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      },
      set(val) {
        this.setDataValue("schedule", JSON.stringify(val || []));
      },
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Kumaraguru College of Technology",
    },
    organizedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "AICTE IDEA Lab, KCT",
      field: "organized_by",
    },
    problemStatementType: {
      type: DataTypes.ENUM("predefined", "custom"),
      allowNull: false,
      defaultValue: "predefined",
      field: "problem_statement_type",
    },
    coordinators: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("coordinators");
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      },
      set(val) {
        this.setDataValue("coordinators", typeof val === "string" ? val : JSON.stringify(val || {}));
      },
    },
    tagline: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "tagline",
    },
    inAssociationWith: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "in_association_with",
    },
    prizes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "prizes",
    },
    refreshments: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "refreshments",
    },
    requiredDocuments: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "required_documents",
      get() {
        const raw = this.getDataValue("requiredDocuments");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return typeof raw === "string" ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
        }
      },
      set(val) {
        this.setDataValue("requiredDocuments", Array.isArray(val) ? JSON.stringify(val) : JSON.stringify(val ? [val] : []));
      },
    },
    themes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "themes",
      get() {
        const raw = this.getDataValue("themes");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return typeof raw === "string" ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
        }
      },
      set(val) {
        this.setDataValue("themes", Array.isArray(val) ? JSON.stringify(val) : JSON.stringify(val ? [val] : []));
      },
    },
    guidelines: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "guidelines",
    },
    isRegistrationLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_registration_locked",
    },
    isPoCSubmissionLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_poc_submission_locked",
    },
    isProblemStatementLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_problem_statement_locked",
    },
    isOnCampusEventActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_on_campus_event_active",
    },
    whatsappInviteLink: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "whatsapp_invite_link",
    },
    facultyCoordinates: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "faculty_coordinates",
      get() {
        const raw = this.getDataValue("facultyCoordinates");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      },
      set(val) {
        this.setDataValue("facultyCoordinates", JSON.stringify(val || []));
      },
    },
    studentCoordinates: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "student_coordinates",
      get() {
        const raw = this.getDataValue("studentCoordinates");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      },
      set(val) {
        this.setDataValue("studentCoordinates", JSON.stringify(val || []));
      },
    },
    gallery: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "gallery",
      get() {
        const raw = this.getDataValue("gallery");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      },
      set(val) {
        this.setDataValue("gallery", JSON.stringify(val || []));
      },
    },
  },
  {
    tableName: "hackathons",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Hackathon;
