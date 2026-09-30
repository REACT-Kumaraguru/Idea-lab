
import fs from "fs";
import path from "path";
import Equipment from "../models/EquipmentModel.js";
import EquipmentBooking from "../models/EquipmentBooking.model.js";
import { sequelize } from "../lib/db.js";

export const createEquipment = async (req, res) => {
  try {
    const { equipmentName, brandName, quantity, pricePerHour, kctPricePerHour, equipmentDetails, isAvailable, category } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newEquipment = await Equipment.create({
      equipmentName,
      brandName,
      quantity,
      pricePerHour: pricePerHour != null && pricePerHour !== '' ? pricePerHour : null,
      kctPricePerHour: kctPricePerHour != null && kctPricePerHour !== '' ? kctPricePerHour : 0.00,
      equipmentDetails,
      category: category || "Mandatory Machines",
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
    const equipments = await Equipment.findAll({
      order: [
        ["isAvailable", "DESC"],
        ["id", "ASC"],
      ],
    });
    res.status(200).json(equipments);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipmentName, brandName, quantity, pricePerHour, kctPricePerHour, equipmentDetails, isAvailable, category } = req.body;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    let imagePath = equipment.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const updateData = {
      equipmentName,
      brandName,
      quantity,
      equipmentDetails,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      image: imagePath,
    };
    if (category !== undefined) updateData.category = category;
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour === '' ? null : pricePerHour;
    if (kctPricePerHour !== undefined) updateData.kctPricePerHour = (kctPricePerHour === '' || kctPricePerHour == null) ? 0.00 : kctPricePerHour;

    await equipment.update(updateData);

    res.status(200).json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const toggleEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    const updated = await equipment.update({
      isAvailable: !equipment.isAvailable,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error toggling equipment status:", error);
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

    if (equipment.image) {
      const filename = path.basename(equipment.image);
      const possiblePaths = [
        path.join(process.cwd(), "src", "uploads", filename),
        path.join(process.cwd(), "uploads", filename),
      ];
      if (process.env.UPLOADS_DIR) {
        possiblePaths.unshift(path.resolve(process.env.UPLOADS_DIR, filename));
      }
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          try {
            fs.unlinkSync(p);
          } catch (e) {
            console.warn("Failed to unlink equipment image file:", e.message);
          }
        }
      }
    }

    await sequelize.transaction(async (t) => {
      await EquipmentBooking.destroy({ where: { equipmentId: id }, transaction: t });
      await equipment.destroy({ transaction: t });
    });

    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
