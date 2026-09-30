import { connectDB, sequelize } from "../lib/db.js";
import { setupAssociations } from "../models/associations.js";
import Equipment from "../models/EquipmentModel.js";
import EquipmentBooking from "../models/EquipmentBooking.model.js";
import User from "../models/UserModel.js";
import { checkSlotCapacity, createBooking, submitCart, updateBookingStatus, cancelBooking, getEquipmentBookings } from "../controllers/Booking.controller.js";
import { Op } from "sequelize";

// Mock Express response object
function createMockRes() {
  return {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
}

async function runEndToEndVerification() {
  console.log("===============================================================================");
  console.log("             END-TO-END VERIFICATION: 3D PRINTERS & PCB MILLING");
  console.log("===============================================================================\n");

  await connectDB();
  setupAssociations();

  const TEST_DATE = "2026-11-20";

  // Pre-cleanup
  await EquipmentBooking.destroy({ where: { bookingDate: TEST_DATE } });

  // -------------------------------------------------------------------------
  // STEP 1: VERIFY CATALOG BOOKABILITY
  // -------------------------------------------------------------------------
  console.log("[STEP 1] Verifying Catalog Bookability Rules...");
  const allEquipments = await Equipment.findAll({
    attributes: ["id", "equipmentName", "quantity", "isAvailable"],
  });

  const bookableItems = allEquipments.filter((e) => e.isAvailable);
  const unbookableItems = allEquipments.filter((e) => !e.isAvailable);

  console.log(`Total Equipment Items in Catalog: ${allEquipments.length}`);
  console.log(`Bookable Items Count: ${bookableItems.length}`);
  console.log(`Unbookable Items Count: ${unbookableItems.length}`);

  const bookableNames = bookableItems.map((b) => b.equipmentName);
  console.log("Bookable Equipments:", bookableNames);

  if (bookableItems.length !== 3) {
    throw new Error(`Expected exactly 3 bookable items, but found ${bookableItems.length}`);
  }

  const expectedBookable = [
    "Prusa 3D Printer (FDM)",
    "Bambu Lab 3D Printer (P1S)",
    "PCB Milling & Prototyping Machine",
  ];

  for (const name of expectedBookable) {
    if (!bookableNames.includes(name)) {
      throw new Error(`Missing expected bookable equipment: ${name}`);
    }
  }
  console.log("✅ STEP 1 PASSED: Exactly 3D printers and PCB Milling Machine are bookable.\n");

  // -------------------------------------------------------------------------
  // STEP 2: TEST STUDENTS SETUP
  // -------------------------------------------------------------------------
  console.log("[STEP 2] Setting up mock student accounts...");
  const student1 = await User.findByPk(1);
  const student2 = await User.findByPk(2);
  const [student3] = await User.findOrCreate({
    where: { email: "student3_e2e@kct.ac.in" },
    defaults: { fullName: "Student Three E2E", passwordHash: "dummyhash", phoneNumber: "9876543299", role: "student" },
  });
  console.log(`✅ STEP 2 PASSED: Verified 3 test students (${student1.email}, ${student2.email}, ${student3.email}).\n`);

  // -------------------------------------------------------------------------
  // STEP 3: PCB MILLING MACHINE CONCURRENCY & BOOKING FLOW (Qty = 1)
  // -------------------------------------------------------------------------
  console.log("[STEP 3] Testing PCB Milling Machine (Quantity = 1) Concurrency & Booking...");
  const pcbMachine = await Equipment.findOne({ where: { equipmentName: "PCB Milling & Prototyping Machine" } });
  console.log(`Target: ${pcbMachine.equipmentName} (ID: ${pcbMachine.id}, Quantity: ${pcbMachine.quantity})`);

  // 3a. Student 1 adds PCB Milling to cart for 10:00 - 11:30
  const reqCreate1 = {
    user: { id: student1.id, email: student1.email },
    body: {
      equipmentId: pcbMachine.id,
      bookingDate: TEST_DATE,
      bookingTime: "10:00",
      duration: 1.5,
      purposeOfUsage: "E2E PCB Prototyping for Smart Drone Flight Controller",
      benefitsForKCT: "yes",
      benefitsReason: "Smart City Hackathon project submission",
      notes: "Need 0.8mm endmill bit",
      consumablesRequested: [{ id: "c1", name: "FR4 Double-Sided Copper Clad Board", quantity: 1, unit: "Sheet" }],
      consumablesPurpose: "Milling double sided flight controller board",
    },
  };
  const resCreate1 = createMockRes();
  await createBooking(reqCreate1, resCreate1);

  if (resCreate1.statusCode !== 201) {
    throw new Error(`Student 1 failed to create booking: ${JSON.stringify(resCreate1.jsonData)}`);
  }
  const booking1 = resCreate1.jsonData.data;
  console.log(`- Student 1 added PCB Milling to cart: Booking ID #${booking1.id}, Status: ${booking1.status}`);

  // 3b. Student 1 clicks "Book Now" (submitCart)
  const reqSubmit1 = { user: { id: student1.id, email: student1.email } };
  const resSubmit1 = createMockRes();
  await submitCart(reqSubmit1, resSubmit1);

  if (resSubmit1.statusCode !== 200 || !resSubmit1.jsonData.success) {
    throw new Error(`Student 1 submitCart failed: ${JSON.stringify(resSubmit1.jsonData)}`);
  }
  console.log(`- Student 1 confirmed "Book Now": ${resSubmit1.jsonData.message}`);

  // Verify booking status is now 'pending'
  await booking1.reload();
  if (booking1.status !== "pending") {
    throw new Error(`Expected booking1 to be pending, but got ${booking1.status}`);
  }
  console.log(`- Booking #${booking1.id} is now 'pending' with submissionBatchId: ${booking1.submissionBatchId}`);

  // 3c. Student 2 attempts to book overlapping time: 10:30 - 11:30 (PCB Machine has Qty: 1)
  console.log("- Student 2 attempting to book overlapping slot (10:30 - 11:30) on same machine...");
  const reqCreate2 = {
    user: { id: student2.id, email: student2.email },
    body: {
      equipmentId: pcbMachine.id,
      bookingDate: TEST_DATE,
      bookingTime: "10:30",
      duration: 1.0,
      purposeOfUsage: "Robotics Sensor Board",
      benefitsForKCT: "yes",
      benefitsReason: "Capstone project",
    },
  };
  const resCreate2 = createMockRes();
  await createBooking(reqCreate2, resCreate2);

  if (resCreate2.statusCode === 201) {
    throw new Error("Concurrency Failure: Student 2 was permitted to book an occupied PCB Milling Machine slot!");
  }
  console.log(`- Overlap rejected as expected: [Status ${resCreate2.statusCode}] "${resCreate2.jsonData.message}"`);

  // 3d. Student 2 books subsequent non-overlapping time: 11:30 - 12:30 -> Should SUCCEED
  console.log("- Student 2 booking non-overlapping slot (11:30 - 12:30)...");
  reqCreate2.body.bookingTime = "11:30";
  reqCreate2.body.duration = 1.0;
  const resCreate2Valid = createMockRes();
  await createBooking(reqCreate2, resCreate2Valid);

  if (resCreate2Valid.statusCode !== 201) {
    throw new Error(`Student 2 should be able to book 11:30-12:30: ${JSON.stringify(resCreate2Valid.jsonData)}`);
  }
  const booking2 = resCreate2Valid.jsonData.data;
  console.log(`- Student 2 non-overlapping slot booked successfully: Booking ID #${booking2.id}`);

  console.log("✅ STEP 3 PASSED: PCB Milling Machine single-unit capacity & overlap protection verified.\n");

  // -------------------------------------------------------------------------
  // STEP 4: PRUSA 3D PRINTER (Qty = 2) MULTI-UNIT CONCURRENCY
  // -------------------------------------------------------------------------
  console.log("[STEP 4] Testing Prusa 3D Printer (Quantity = 2) Multi-Unit Concurrency...");
  const prusa = await Equipment.findOne({ where: { equipmentName: "Prusa 3D Printer (FDM)" } });
  console.log(`Target: ${prusa.equipmentName} (ID: ${prusa.id}, Quantity: ${prusa.quantity})`);

  // 4a. Student 1 books 14:00 - 15:30 on Prusa
  const reqPrusa1 = {
    user: { id: student1.id, email: student1.email },
    body: {
      equipmentId: prusa.id,
      bookingDate: TEST_DATE,
      bookingTime: "14:00",
      duration: 1.5,
      purposeOfUsage: "Prusa Part A",
      benefitsForKCT: "yes",
      benefitsReason: "Research",
    },
  };
  const resPrusa1 = createMockRes();
  await createBooking(reqPrusa1, resPrusa1);
  if (resPrusa1.statusCode !== 201) throw new Error("Prusa booking 1 failed");
  const pBooking1 = resPrusa1.jsonData.data;
  pBooking1.status = "approved"; // Mark approved
  await pBooking1.save();
  console.log(`- Prusa Unit 1 reserved: ID #${pBooking1.id} (14:00 - 15:30)`);

  // 4b. Student 2 books SAME time slot 14:00 - 15:00 on Prusa -> MUST BE ALLOWED (Quantity = 2)
  const reqPrusa2 = {
    user: { id: student2.id, email: student2.email },
    body: {
      equipmentId: prusa.id,
      bookingDate: TEST_DATE,
      bookingTime: "14:00",
      duration: 1.0,
      purposeOfUsage: "Prusa Part B",
      benefitsForKCT: "yes",
      benefitsReason: "Research",
    },
  };
  const resPrusa2 = createMockRes();
  await createBooking(reqPrusa2, resPrusa2);
  if (resPrusa2.statusCode !== 201) throw new Error(`Prusa booking 2 should succeed for quantity 2: ${resPrusa2.jsonData?.message}`);
  const pBooking2 = resPrusa2.jsonData.data;
  pBooking2.status = "pending";
  await pBooking2.save();
  console.log(`- Prusa Unit 2 reserved: ID #${pBooking2.id} (14:00 - 15:00) [Both units active]`);

  // 4c. Student 3 attempts 3rd concurrent booking at 14:15 - 15:15 -> MUST BE REJECTED
  console.log("- Student 3 attempting 3rd concurrent booking (14:15 - 15:15) on Prusa...");
  const reqPrusa3 = {
    user: { id: student3.id, email: student3.email },
    body: {
      equipmentId: prusa.id,
      bookingDate: TEST_DATE,
      bookingTime: "14:15",
      duration: 1.0,
      purposeOfUsage: "Prusa Part C",
      benefitsForKCT: "yes",
      benefitsReason: "Research",
    },
  };
  const resPrusa3 = createMockRes();
  await createBooking(reqPrusa3, resPrusa3);
  if (resPrusa3.statusCode === 201) throw new Error("Concurrency Failure: Prusa allowed 3 bookings on 2 units!");
  console.log(`- 3rd booking rejected as expected: [Status ${resPrusa3.statusCode}] "${resPrusa3.jsonData.message}"`);

  console.log("✅ STEP 4 PASSED: Multi-unit concurrency (2 allowed, 3rd blocked) verified.\n");

  // -------------------------------------------------------------------------
  // STEP 5: BAMBU LAB 3D PRINTER (Qty = 1) CONCURRENCY
  // -------------------------------------------------------------------------
  console.log("[STEP 5] Testing Bambu Lab 3D Printer (Quantity = 1) Concurrency...");
  const bambu = await Equipment.findOne({ where: { equipmentName: "Bambu Lab 3D Printer (P1S)" } });
  const reqBambu1 = {
    user: { id: student1.id, email: student1.email },
    body: {
      equipmentId: bambu.id,
      bookingDate: TEST_DATE,
      bookingTime: "09:00",
      duration: 2.0,
      purposeOfUsage: "High Speed Enclosure Prototype",
      benefitsForKCT: "yes",
      benefitsReason: "Prototyping",
    },
  };
  const resBambu1 = createMockRes();
  await createBooking(reqBambu1, resBambu1);
  if (resBambu1.statusCode !== 201) throw new Error("Bambu booking 1 failed");
  const bBooking1 = resBambu1.jsonData.data;
  bBooking1.status = "pending";
  await bBooking1.save();
  console.log(`- Bambu Lab Unit reserved: ID #${bBooking1.id} (09:00 - 11:00)`);

  // Student 2 attempts overlapping 09:30 - 10:30
  const reqBambu2 = {
    user: { id: student2.id, email: student2.email },
    body: {
      equipmentId: bambu.id,
      bookingDate: TEST_DATE,
      bookingTime: "09:30",
      duration: 1.0,
      purposeOfUsage: "Robotics Mount",
      benefitsForKCT: "yes",
      benefitsReason: "Prototyping",
    },
  };
  const resBambu2 = createMockRes();
  await createBooking(reqBambu2, resBambu2);
  if (resBambu2.statusCode === 201) throw new Error("Concurrency Failure: Bambu allowed 2 bookings on 1 unit!");
  console.log(`- Overlapping booking rejected as expected: [Status ${resBambu2.statusCode}] "${resBambu2.jsonData.message}"`);
  console.log("✅ STEP 5 PASSED: Bambu Lab single unit capacity verified.\n");

  // -------------------------------------------------------------------------
  // STEP 6: UNBOOKABLE EQUIPMENT ATTEMPT REJECTION
  // -------------------------------------------------------------------------
  console.log("[STEP 6] Testing rejection on unbookable equipment...");
  const laser = await Equipment.findOne({ where: { equipmentName: "Laser Cutter (CO2 100W, 1200x900mm)" } });
  const reqLaser = {
    user: { id: student1.id, email: student1.email },
    body: {
      equipmentId: laser.id,
      bookingDate: TEST_DATE,
      bookingTime: "10:00",
      duration: 1.0,
      purposeOfUsage: "Acrylic cutting",
      benefitsForKCT: "yes",
      benefitsReason: "Signage",
    },
  };
  const resLaser = createMockRes();
  await createBooking(reqLaser, resLaser);
  if (resLaser.statusCode === 201) throw new Error("Unbookable equipment allowed booking!");
  console.log(`- Unbookable rejection message: [Status ${resLaser.statusCode}] "${resLaser.jsonData.message}"`);
  console.log("✅ STEP 6 PASSED: Non-3D printer and non-PCB equipment cannot be booked.\n");

  // -------------------------------------------------------------------------
  // STEP 7: ADMIN APPROVAL AND CAPACITY PROTECTION
  // -------------------------------------------------------------------------
  console.log("[STEP 7] Testing Admin Approval Flow on PCB Machine...");
  const reqApprove = {
    params: { id: booking1.id },
    body: { status: "approved" },
  };
  const resApprove = createMockRes();
  await updateBookingStatus(reqApprove, resApprove);

  if (resApprove.statusCode !== 200) {
    throw new Error(`Admin failed to approve valid booking: ${resApprove.jsonData?.message}`);
  }
  console.log(`- Booking #${booking1.id} approved by admin successfully: status = ${resApprove.jsonData.data.status}`);
  console.log("✅ STEP 7 PASSED: Admin approval succeeded.\n");

  // -------------------------------------------------------------------------
  // STEP 8: CANCELLATION & SLOT LIBERATION
  // -------------------------------------------------------------------------
  console.log("[STEP 8] Testing Cancellation and Slot Liberation...");
  const reqCancel = {
    params: { id: booking1.id },
    user: { id: student1.id },
  };
  const resCancel = createMockRes();
  await cancelBooking(reqCancel, resCancel);
  if (resCancel.statusCode !== 200) throw new Error("Cancellation failed");
  console.log(`- Booking #${booking1.id} cancelled. Status: ${resCancel.jsonData.data.status}`);

  // Now Student 2 should be able to book the liberated slot (10:00 - 11:30) on PCB Machine!
  const reqCreateLiberated = {
    user: { id: student2.id, email: student2.email },
    body: {
      equipmentId: pcbMachine.id,
      bookingDate: TEST_DATE,
      bookingTime: "10:00",
      duration: 1.0,
      purposeOfUsage: "Now using freed slot",
      benefitsForKCT: "yes",
      benefitsReason: "Test",
    },
  };
  const resCreateLiberated = createMockRes();
  await createBooking(reqCreateLiberated, resCreateLiberated);
  if (resCreateLiberated.statusCode !== 201) {
    throw new Error(`Freed slot should be bookable: ${resCreateLiberated.jsonData?.message}`);
  }
  console.log(`- Student 2 successfully booked previously cancelled slot! Booking #${resCreateLiberated.jsonData.data.id}`);
  console.log("✅ STEP 8 PASSED: Slot liberation verified.\n");

  // -------------------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------------------
  console.log("[CLEANUP] Removing test bookings...");
  await EquipmentBooking.destroy({ where: { bookingDate: TEST_DATE } });
  await User.destroy({ where: { email: { [Op.in]: ["student1_e2e@kct.ac.in", "student2_e2e@kct.ac.in", "student3_e2e@kct.ac.in"] } } });
  console.log("✅ Cleaned up test data.\n");

  console.log("===============================================================================");
  console.log("           🎉 ALL 8 END-TO-END VERIFICATION TESTS PASSED! 🎉");
  console.log("===============================================================================");

  await sequelize.close();
}

runEndToEndVerification().catch((err) => {
  console.error("\n❌ E2E VERIFICATION FAILED:", err);
  process.exit(1);
});
