import bcrypt from "bcryptjs";
import Hackathon from "../models/hackathon/HackathonModel.js";
import HackathonUser from "../models/hackathon/HackathonUserModel.js";
import HackathonProblem from "../models/hackathon/HackathonProblemModel.js";
import HackathonTeam from "../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../models/hackathon/HackathonTeamMemberModel.js";
import HackathonSubmission from "../models/hackathon/HackathonSubmissionModel.js";
import HackathonMentor from "../models/hackathon/HackathonMentorModel.js";

const DUMMY_LEADER = {
  email: "ryuugamma10@gmail.com",
  fullName: "Ryuu Gamma",
  phoneNumber: "9876543210",
  degree: "UG",
  college: "Kumaraguru College of Technology",
  branch: "CSE",
  graduationYear: 2026,
  role: "student",
};

const defaultSchedule1 = [
  {
    dayNum: "01",
    date: "April 10, 2026",
    title: "Prototype Development & Mentoring",
    details: [
      "Build and refine your prototype.",
      "Follow technical guidance from mentors.",
      "Improve your solution based on suggestions.",
    ],
  },
  {
    dayNum: "02",
    date: "April 11, 2026",
    title: "Final Review & Presentation",
    details: [
      "Final refinement of the solution.",
      "Project presentation before the jury panel.",
      "Demonstration of your PoC / Prototype.",
    ],
  },
];

export async function ensureDummyTeam() {
  try {
    let hackathon1 = await Hackathon.findOne({ where: { slug: "ich2026" } });
    if (!hackathon1) {
      hackathon1 = await Hackathon.create({
        name: "IDEA LAB Hackathon 2026",
        slug: "ich2026",
        description: "National Level Student Innovation & Prototype Challenge.",
        status: "ended",
        schedule: defaultSchedule1,
      });
      console.log("[dummy-team] Created default hackathon: ICH 2026 (ended)");
    } else {
      await hackathon1.update({ status: "ended", schedule: defaultSchedule1 });
    }



    let smartCityHackathon = await Hackathon.findOne({ where: { slug: "smart-city-2026" } });
    const smartCitySchedule = [
      {
        dayNum: "01",
        date: "August 8, 2026",
        title: "Workshop (Evening)",
        details: ["Learn, ideate and build a strong foundation."],
      },
      {
        dayNum: "02",
        date: "August 14, 2026",
        title: "Abstract Submission Deadline",
        details: ["Submit your ideas & project abstract before the deadline."],
      },
      {
        dayNum: "03",
        date: "August 18, 2026",
        title: "Team Selection Notification",
        details: ["Shortlisted teams will be notified for the next round."],
      },
      {
        dayNum: "04",
        date: "September 5, 2026",
        title: "Project Demo – Level 1",
        details: ["Level 1 Prototype Demo at MGATE, KCT. Working lunch / refreshments provided on demo days."],
      },
      {
        dayNum: "05",
        date: "October 13, 2026",
        title: "Final Project Demo / Exhibition",
        details: ["Final Real-Time Project Demo & Exhibition at MGATE, KCT. Refreshments provided."],
      },
    ];

    const smartCityCoordinators = {
      facultyCoordinators: [
        { name: "Dr. S. Sasikala", email: "sasikala.s.ece@kct.ac.in", role: "Smart City Ambassador" },
        { name: "Dr. M. Alagumeenaakshi", email: "alagumeenaakshi.m.ece@kct.ac.in" },
        { name: "Dr. A. P. Arun", email: "arun.ap.mec@kct.ac.in" },
      ],
      studentCoordinators: [
        { name: "Sriram A", phone: "+91 88388 41430" },
        { name: "Harshavarthini S", phone: "+91 63817 71934" },
      ],
    };

    const smartCityData = {
      name: "Smart City Hackathon 2026",
      slug: "smart-city-2026",
      tagline: "An Initiative under IEEE Smart Cities Ambassadors Program",
      description: "Solving Local Urban Challenges — Build Innovative Solutions for Smarter, Sustainable Cities.",
      startDate: new Date("2026-08-08"),
      endDate: new Date("2026-10-13"),
      status: "active",
      venue: "MGATE, KCT, COIMBATORE",
      organizedBy: "IDEA Lab, KCT & IEEE Smart Cities",
      inAssociationWith: "KCT IEEE Student Branch | KCT IEEE WIE",
      prizes: "₹ 15,000",
      problemStatementType: "custom",
      refreshments: "Working lunch / refreshments will be provided on both demo days at KCT.",
      requiredDocuments: ["College ID Card", "Bona-fide Letter"],
      themes: [
        "Disaster Resilience",
        "Waste Management",
        "Energy Solutions",
        "Smart Agriculture",
        "Pollution Control",
        "Smart Mobility & Parking",
        "Smart Healthcare",
      ],
      schedule: smartCitySchedule,
      coordinators: smartCityCoordinators,
    };

    if (!smartCityHackathon) {
      smartCityHackathon = await Hackathon.create(smartCityData);
      console.log("[dummy-team] Created Smart City Hackathon 2026");
    } else {
      await smartCityHackathon.update(smartCityData);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("ryuugamma123", salt);
    let user = await HackathonUser.findOne({ where: { email: DUMMY_LEADER.email } });
    if (!user) {
      user = await HackathonUser.create({
        email: DUMMY_LEADER.email,
        fullName: DUMMY_LEADER.fullName,
        name: DUMMY_LEADER.fullName,
        phoneNumber: DUMMY_LEADER.phoneNumber,
        phone: DUMMY_LEADER.phoneNumber,
        degree: DUMMY_LEADER.degree,
        college: DUMMY_LEADER.college,
        branch: DUMMY_LEADER.branch,
        graduationYear: DUMMY_LEADER.graduationYear,
        password: hashedPassword,
        role: DUMMY_LEADER.role,
      });
      console.log("[dummy-team] Created dummy leader user:", DUMMY_LEADER.email);
    } else {
      await user.update({
        password: hashedPassword,
        fullName: DUMMY_LEADER.fullName,
        name: DUMMY_LEADER.fullName,
        role: DUMMY_LEADER.role,
      });
      console.log("[dummy-team] Updated dummy leader password:", DUMMY_LEADER.email);
    }

    let problem = await HackathonProblem.findOne({ where: { title: "Smart IoT Monitoring System" } });
    if (!problem) {
      problem = await HackathonProblem.create({
        title: "Smart IoT Monitoring System",
        description: "Develop an automated sensor network for industrial data monitoring and alerts.",
        sector: "IoT & Automation",
        teamRegistrationLimit: 20,
        hackathonId: hackathon1.id,
      });
      console.log("[dummy-team] Created dummy problem statement");
    }

    let team = await HackathonTeam.findOne({ where: { leaderUserId: user.id } });
    if (!team) {
      team = await HackathonTeam.create({
        teamName: "Gamma Innovators",
        inviteCode: "GAMMA10",
        leaderUserId: user.id,
        status: "approved",
        hackathonId: hackathon1.id,
      });
      console.log("[dummy-team] Created dummy team: Gamma Innovators");
    }

    const member = await HackathonTeamMember.findOne({ where: { userId: user.id } });
    if (!member) {
      await HackathonTeamMember.create({
        teamId: team.id,
        userId: user.id,
        isLeader: true,
      });
    }

    let submission = await HackathonSubmission.findOne({ where: { teamId: team.id } });
    if (!submission) {
      await HackathonSubmission.create({
        teamId: team.id,
        problemId: problem.id,
        submissionPhase: "poc",
        title: "IoT Smart Sensor Platform",
        description: "An automated sensor platform using microcontrollers and cloud analytics.",
        whyParticipate: "To build sustainable IoT infrastructure.",
        problemToSolve: "High downtime in industrial machinery.",
        plannedTech: "Node.js, C++, ESP32, React",
        workedBefore: "No",
        agreedTerms: true,
        mentorApproved: true,
        status: "approved",
        submittedByUserId: user.id,
        hackathonId: hackathon1.id,
      });
      console.log("[dummy-team] Created dummy submission for Gamma Innovators");
    }



    // Seed Mentor Account
    let mentorUser = await HackathonUser.findOne({ where: { email: "mentor@kct.ac.in" } });
    const mentorSalt = await bcrypt.genSalt(10);
    const mentorHashedPassword = await bcrypt.hash("mentorpass123", mentorSalt);

    if (!mentorUser) {
      mentorUser = await HackathonUser.create({
        email: "mentor@kct.ac.in",
        fullName: "Dr. Mentor AI & IoT",
        name: "Dr. Mentor AI & IoT",
        phoneNumber: "9876549999",
        phone: "9876549999",
        role: "mentor",
        password: mentorHashedPassword,
      });
      console.log("[dummy-team] Created mentor user: mentor@kct.ac.in");
    } else {
      await mentorUser.update({ password: mentorHashedPassword, role: "mentor" });
    }

    let mentorRecord = await HackathonMentor.findOne({ where: { userId: mentorUser.id } });
    if (!mentorRecord) {
      await HackathonMentor.create({
        userId: mentorUser.id,
        expertise: "Artificial Intelligence, Robotics & IoT Systems",
      });
      console.log("[dummy-team] Created mentor record for Dr. Mentor AI & IoT");
    }
  } catch (err) {
    console.error("[dummy-team] Error seeding dummy team:", err);
  }
}
