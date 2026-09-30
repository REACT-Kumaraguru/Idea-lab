import { getMailTransport } from "../lib/mailTransport.js";
import { ENV } from "../lib/env.js";
import { AppError } from "../utils/AppError.js";

/**
 * Builds the HTML template for notifying a Cluster Faculty Evaluator.
 */
export function buildClusterFacultyEmailTemplate({
  facultyName,
  facultyEmail,
  cluster,
  assignedCount,
  loginUrl,
  defaultPassword,
  customMessage,
}) {
  const fromAddress = ENV.MAIL_FROM || ENV.SMTP_FROM || ENV.EMAIL_FROM || `"AICTE IDEA Lab, KCT" <${ENV.SMTP_USER || "noreply.idealab@kct.ac.in"}>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart City Hackathon 2026 - Cluster Faculty Evaluation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f4;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0a09; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1c1917; border: 1px solid #78350f; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #451a03 0%, #1c1917 100%); padding: 32px 30px; text-align: center; border-bottom: 2px solid #d97706;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #fbbf24; margin-bottom: 8px;">
                AICTE IDEA Lab • Kumaraguru College of Technology
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Smart City Hackathon 2026
              </h1>
              <div style="font-size: 13px; color: #d6d3d1; margin-top: 6px;">
                Cluster Faculty Evaluation & Scoring Portal
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 30px;">
              <p style="font-size: 16px; font-weight: 600; color: #f5f5f4; margin: 0 0 16px 0;">
                Dear ${facultyName},
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #d6d3d1; margin: 0 0 24px 0;">
                You have been designated as a specialized <strong>Faculty Evaluator</strong> for the <strong>${cluster} Cluster</strong> in the Smart City Hackathon 2026.
              </p>

              <!-- Allocation Badge Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #292524; border: 1px solid #44403c; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a8a29e;">Assigned Cluster</td>
                        <td align="right" style="font-size: 14px; font-weight: 700; color: #38bdf8;">${cluster}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a8a29e;">Allocated Teams</td>
                        <td align="right" style="padding-top: 10px; font-size: 15px; font-weight: 800; color: #34d399;">${assignedCount} Teams</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Credentials Box -->
              <div style="margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; margin-bottom: 10px;">
                  🔐 Your Evaluation Portal Credentials
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #171513; border: 1px solid #57534e; border-radius: 10px; padding: 16px;">
                  <tr>
                    <td style="padding: 6px 12px; font-size: 13px; color: #a8a29e;">Login URL:</td>
                    <td style="padding: 6px 12px; font-size: 13px; font-weight: 600; color: #38bdf8;">
                      <a href="${loginUrl}" style="color: #38bdf8; text-decoration: none;">${loginUrl}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 12px; font-size: 13px; color: #a8a29e;">Email ID:</td>
                    <td style="padding: 6px 12px; font-size: 13px; font-family: monospace; font-weight: 700; color: #ffffff;">${facultyEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 12px; font-size: 13px; color: #a8a29e;">Password:</td>
                    <td style="padding: 6px 12px; font-size: 13px; font-family: monospace; font-weight: 700; color: #f59e0b;">${defaultPassword}</td>
                  </tr>
                </table>
              </div>

              ${
                customMessage
                  ? `<div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 14px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #fde68a;">
                      <strong>Special Note from Organizing Committee:</strong><br/>
                      ${customMessage}
                    </div>`
                  : ""
              }

              <!-- Evaluation Instructions -->
              <div style="margin-bottom: 30px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; margin-bottom: 12px;">
                  📋 Evaluation Instructions
                </div>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.7; color: #d6d3d1;">
                  <li>Log in to the portal using your credentials provided above.</li>
                  <li>Click on your assigned batch of <strong>${assignedCount} teams</strong> in the <strong>${cluster} Cluster</strong>.</li>
                  <li>Expand each team card to read the ~300-word project abstraction, methodology, and tech stack.</li>
                  <li>Type your evaluation score directly (from <strong>0.0 to 10.0</strong>) and enter qualitative remarks.</li>
                  <li>Click <strong>"Save Grade"</strong> to record your evaluation.</li>
                </ol>
              </div>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4);">
                      Access Evaluation Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #141210; padding: 24px 30px; text-align: center; border-top: 1px solid #292524;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #a8a29e;">
                AICTE IDEA Lab • Kumaraguru College of Technology
              </p>
              <p style="margin: 0; font-size: 11px; color: #78716c;">
                If you experience any difficulties logging in, please contact the hackathon coordination desk.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    from: fromAddress,
    to: facultyEmail,
    subject: `Smart City Hackathon 2026 - Evaluation Portal Credentials (${cluster} Cluster)`,
    html,
  };
}

/**
 * Sends notification emails to faculty evaluators.
 */
export async function sendClusterFacultyEmail({
  facultyName,
  facultyEmail,
  cluster,
  assignedCount,
  loginUrl = "https://idealab.kct.ac.in/Hackathon/login",
  defaultPassword = "faculty@2026",
  customMessage = "",
}) {
  const transport = getMailTransport();
  if (!transport) {
    throw new AppError("Email service (SMTP) is not configured on the server", 503);
  }

  const mailOptions = buildClusterFacultyEmailTemplate({
    facultyName,
    facultyEmail,
    cluster,
    assignedCount,
    loginUrl,
    defaultPassword,
    customMessage,
  });

  return await transport.sendMail(mailOptions);
}
