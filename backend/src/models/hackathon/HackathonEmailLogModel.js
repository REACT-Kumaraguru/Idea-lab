import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

const HackathonEmailLog = sequelize.define(
  "HackathonEmailLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hackathonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "hackathon_id",
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "recipient_email",
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "recipient_name",
    },
    recipientRole: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "team",
      field: "recipient_role",
    },
    teamName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "team_name",
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Admin",
      field: "sender_name",
    },
    senderEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "sender_email",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "sent",
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "error_message",
    },
    hasAttachments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "has_attachments",
    },
    attachmentNames: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "attachment_names",
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "sent_at",
    },
  },
  {
    tableName: "hackathon_email_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HackathonEmailLog;
