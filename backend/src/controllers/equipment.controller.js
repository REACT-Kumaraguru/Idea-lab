
import Equipment from "../models/EquipmentModel.js";

export const createEquipment = async (req, res) => {
  try {
    const { equipmentName, brandName, quantity, rentAmount, pricePerHour, equipmentDetails, isAvailable } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = req.file.path.replace(/\\/g, "/"); // Normalize path for different OS
    }

    const newEquipment = await Equipment.create({
      equipmentName,
      brandName,
      quantity,
      rentAmount,
      pricePerHour: pricePerHour != null && pricePerHour !== '' ? pricePerHour : null,
      equipmentDetails,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      image: imagePath,
    });

    res.status(201).json(newEquipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllEquipment = async (req, res) => {
  try {
    const equipments = await Equipment.findAll();
    res.status(200).json(equipments);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipmentName, brandName, quantity, rentAmount, pricePerHour, equipmentDetails, isAvailable } = req.body;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    let imagePath = equipment.image;
    if (req.file) {
      imagePath = req.file.path.replace(/\\/g, "/");
    }

    const updateData = {
      equipmentName,
      brandName,
      quantity,
      rentAmount,
      equipmentDetails,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      image: imagePath,
    };
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour === '' ? null : pricePerHour;

    await equipment.update(updateData);

    res.status(200).json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await equipment.destroy();
    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
