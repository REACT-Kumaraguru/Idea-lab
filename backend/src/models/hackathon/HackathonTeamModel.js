import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonTeam = sequelize.define(
  "HackathonTeam",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "team_name",
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "invite_code",
    },
    leaderUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "leader_user_id",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    hackathonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "hackathon_id",
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    abstractionStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
      field: "abstraction_status",
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "reviewer_id",
    },
    reviewerFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "reviewer_feedback",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reviewed_at",
    },
    cluster: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cluster",
    },
    clusterMarks: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "cluster_marks",
    },
    clusterFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "cluster_feedback",
    },
    clusterEvaluatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cluster_evaluated_by",
    },
    clusterEvaluatedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "cluster_evaluated_by_id",
    },
    clusterEvaluatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "cluster_evaluated_at",
    },
    assignedFacultyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "assigned_faculty_id",
    },
    assignedFacultyName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "assigned_faculty_name",
    },
    assignedFacultyEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "assigned_faculty_email",
    },
    isPresent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_present",
    },
    benchNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "bench_number",
    },
    attendanceMarkedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "attendance_marked_at",
    },
    attendanceMarkedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "attendance_marked_by",
    },
  },
  {
    tableName: "hackathon_teams",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonTeam;

