import Equipment from "./EquipmentModel.js";
import EquipmentBooking from "./EquipmentBooking.model.js";
import User from "./UserModel.js"; // Adjust path based on your project structure

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
};

export { Equipment, EquipmentBooking, User };