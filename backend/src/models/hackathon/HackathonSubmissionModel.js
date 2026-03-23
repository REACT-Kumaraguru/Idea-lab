import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonSubmission = sequelize.define(
  "HackathonSubmission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "team_id",
    },
    problemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "problem_id",
    },
    submissionPhase: {
      type: DataTypes.ENUM("poc", "prototype", "final"),
      allowNull: false,
      field: "submission_phase",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Stored as JSON string arrays (we keep DB type simple)
    pocFilePaths: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "poc_file_paths",
      get() {
        const raw = this.getDataValue("pocFilePaths");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("pocFilePaths", JSON.stringify(value || []));
      },
    },
    prototypeFilePaths: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "prototype_file_paths",
      get() {
        const raw = this.getDataValue("prototypeFilePaths");
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("prototypeFilePaths", JSON.stringify(value || []));
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "submitted", "under_review", "approved", "rejected", "winner"),
      allowNull: false,
      defaultValue: "pending",
    },
    winnerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "winner_amount",
    },
    seedMoneyAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "seed_money_amount",
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "admin_notes",
    },
    submittedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "submitted_by_user_id",
    },
  },
  {
    tableName: "hackathon_submissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonSubmission;

