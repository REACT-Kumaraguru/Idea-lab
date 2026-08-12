import HackathonUser from "../../models/hackathon/HackathonUserModel.js";

/** All users who self-registered as students via POST /ich2026/register */
export const adminListRegisteredStudents = async (req, res) => {
  try {
    const rows = await HackathonUser.findAll({
      where: { role: "student" },
      attributes: [
        "id",
        "fullName",
        "email",
        "phone",
        "phoneNumber",
        "degree",
        "graduationYear",
        "college",
        "branch",
      ],
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json({ students: rows.map((u) => u.toJSON()) });
  } catch (error) {
    console.log("Error in adminListRegisteredStudents:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
