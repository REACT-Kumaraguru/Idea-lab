import { connectDB } from "../lib/db.js";
import ProblemStatement from "../models/ProblemStatementModel.js";
import ProblemStatementImage from "../models/ProblemStatementImageModel.js";
import ProblemStatementDocument from "../models/ProblemStatementDocumentModel.js";
import { setupAssociations } from "../models/associations.js";

const syncModels = async () => {
  try {
    await connectDB();
    setupAssociations();
    
    console.log("Syncing Problem Statement models...");
    
    // Sync models (creates tables if they don't exist)
    await ProblemStatement.sync({ alter: true });
    console.log("✓ problem_statements table synced");
    
    await ProblemStatementImage.sync({ alter: true });
    console.log("✓ problem_statement_images table synced");
    
    await ProblemStatementDocument.sync({ alter: true });
    console.log("✓ problem_statement_documents table synced");
    
    console.log("\nAll tables synced successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error syncing models:", error);
    process.exit(1);
  }
};

syncModels();
