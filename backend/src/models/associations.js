import Equipment from "./EquipmentModel.js";
import EquipmentBooking from "./EquipmentBooking.model.js";
import User from "./UserModel.js";
import ProblemStatement from "./ProblemStatementModel.js";
import ProblemStatementImage from "./ProblemStatementImageModel.js";
import ProblemStatementDocument from "./ProblemStatementDocumentModel.js";
import Admin from "./AdminModel.js";

// Define all associations here
export const setupAssociations = () => {
  // Equipment and EquipmentBooking relationship
  Equipment.hasMany(EquipmentBooking, {
    foreignKey: "equipmentId",
    as: "bookings",
  });

  EquipmentBooking.belongsTo(Equipment, {
    foreignKey: "equipmentId",
    as: "equipment",
  });

  // User and EquipmentBooking relationship
  User.hasMany(EquipmentBooking, {
    foreignKey: "userId",
    as: "bookings",
  });

  EquipmentBooking.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // User and ProblemStatement relationship
  User.hasMany(ProblemStatement, {
    foreignKey: "userId",
    as: "problemStatements",
  });

  ProblemStatement.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Admin and ProblemStatement relationship (for reviewer)
  Admin.hasMany(ProblemStatement, {
    foreignKey: "reviewedBy",
    as: "reviewedProblemStatements",
  });

  ProblemStatement.belongsTo(Admin, {
    foreignKey: "reviewedBy",
    as: "reviewer",
  });

  // ProblemStatement and Images relationship
  ProblemStatement.hasMany(ProblemStatementImage, {
    foreignKey: "problemStatementId",
    as: "images",
  });

  ProblemStatementImage.belongsTo(ProblemStatement, {
    foreignKey: "problemStatementId",
    as: "problemStatement",
  });

  // ProblemStatement and Documents relationship
  ProblemStatement.hasMany(ProblemStatementDocument, {
    foreignKey: "problemStatementId",
    as: "documents",
  });

  ProblemStatementDocument.belongsTo(ProblemStatement, {
    foreignKey: "problemStatementId",
    as: "problemStatement",
  });
};

export { 
  Equipment, 
  EquipmentBooking, 
  User, 
  ProblemStatement, 
  ProblemStatementImage, 
  ProblemStatementDocument,
  Admin 
};