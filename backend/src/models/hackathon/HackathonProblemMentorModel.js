import { DataTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";

/** Join table: many mentors per problem statement. */
const HackathonProblemMentor = sequelize.define(
  "HackathonProblemMentor",
  {
    problemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "problem_id",
    },
    mentorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: "mentor_id",
    },
  },
  {
    tableName: "hackathon_problem_mentors",
    timestamps: false,
  }
);

export default HackathonProblemMentor;
