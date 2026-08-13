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
  },
  {
    tableName: "hackathons",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Hackathon;
