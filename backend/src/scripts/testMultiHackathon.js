import Hackathon from "../models/hackathon/HackathonModel.js";
import HackathonTeam from "../models/hackathon/HackathonTeamModel.js";
import HackathonProblem from "../models/hackathon/HackathonProblemModel.js";

async function test() {
  try {
    const hackathons = await Hackathon.findAll();
    console.log("Total Hackathons:", hackathons.length);
    for (const h of hackathons) {
      const teams = await HackathonTeam.findAll({ where: { hackathonId: h.id } });
      const problems = await HackathonProblem.findAll({ where: { hackathonId: h.id } });
      console.log(`- [${h.id}] ${h.name} (${h.slug}): ${teams.length} teams, ${problems.length} problems`);
    }
    console.log("TEST_MULTI_HACKATHON_SUCCESS");
  } catch (err) {
    console.error("TEST_ERROR:", err);
  }
}

test();
