import { sendAdminTeamNotificationEmail } from "../services/mailService.js";

async function run() {
  try {
    console.log("Sending test email...");
    await sendAdminTeamNotificationEmail({
      to: "ryuugamma10@gmail.com",
      subject: "Test Announcement - IDEA Lab",
      html: "<h1>Hello Ryuu!</h1><p>This is a test email sent from <b>demoidealab@gmail.com</b> using your Gmail App Password.</p>",
      text: "Hello Ryuu! This is a test email sent from demoidealab@gmail.com.",
    });
    console.log("EMAIL_SENT_SUCCESSFULLY");
  } catch (err) {
    console.error("EMAIL_FAILED_ERROR:", err.message);
  }
}

run();
