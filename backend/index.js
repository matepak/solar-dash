const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env.development"),
});
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const admin = require("firebase-admin");
const axios = require("axios");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const fs = require("fs");

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let serviceAccount;
    try {
      // Try to parse as JSON string
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log("Firebase initialized using JSON string from environment.");
    } catch (e) {
      // If parsing fails, try to treat it as a file path
      if (fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
        serviceAccount = JSON.parse(
          fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, "utf8"),
        );
        console.log(
          `Firebase initialized using file: ${process.env.FIREBASE_SERVICE_ACCOUNT}`,
        );
      } else {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT is neither valid JSON nor a valid file path.",
        );
      }
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp();
    console.log("Firebase initialized with default credentials.");
  }
} catch (error) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK:");
  console.error(error.message);
  process.exit(1);
}

const db = admin.firestore();
const NOAA_KP_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

// Setup Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function checkSolarActivity() {
  console.log(`[${new Date().toISOString()}] Checking solar activity...`);

  try {
    // 1. Fetch latest Kp data
    const response = await axios.get(NOAA_KP_URL);
    const data = response.data;
    const lastReading = data[data.length - 1];
    const currentKp = parseFloat(lastReading[1]);

    console.log(`Current Kp index: ${currentKp}`);

    if (isNaN(currentKp)) throw new Error("Invalid Kp value");

    // 2. Query users with active email alerts
    const usersSnapshot = await db
      .collection("users")
      .where("alertSettings.emailAlerts", "==", true)
      .get();

    if (usersSnapshot.empty) {
      console.log("No users found with email alerts enabled.");
      return;
    }

    const alertsSent = [];

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      const threshold = user.alertSettings.kpThreshold || 5;
      const recipientEmail = user.email;

      if (!recipientEmail) {
        console.warn(
          `[User ${doc.id}] Skipping alert: No email address found in Firestore document.`,
        );
        continue;
      }

      if (currentKp >= threshold) {
        // Only send if we haven't sent an alert too recently (e.g., in the last 1 hours)
        const lastAlertTime = user.lastAlertSent?.toDate() || new Date(0);
        const hoursSinceLastAlert =
          (new Date() - lastAlertTime) / (1000 * 60 * 60);

        if (hoursSinceLastAlert >= 1) {
          console.log(
            `Alerting user ${recipientEmail} (Threshold: ${threshold})`,
          );

          try {
            await transporter.sendMail({
              from: `"Solar Dash Alerts" <${process.env.SMTP_USER}>`,
              to: recipientEmail,
              subject: `Aurora Alert: Kp Index reached ${currentKp}!`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                  <h1 style="color: #ff9800;">Solar Activity Alert</h1>
                  <p>The current <b>Kp index has reached ${currentKp}</b>.</p>
                  <p>This meets or exceeds your alert threshold of <b>Kp ${threshold}</b>.</p>
                  <p>Go outside or check the dashboard for aurora viewing opportunities!</p>
                  <a href="https://sdodash.webgrove.pl/" style="display: inline-block; padding: 10px 20px; background: #2196f3; color: white; text-decoration: none; border-radius: 5px;">View Live Dashboard</a>
                  <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
                  <p style="font-size: 0.8em; color: #777;">You received this because you enabled email alerts on Solar Dash.</p>
                </div>
              `,
            });

            // Update user's last alert time to prevent spam
            alertsSent.push(
              doc.ref.update({
                lastAlertSent: admin.firestore.FieldValue.serverTimestamp(),
              }),
            );
          } catch (mailError) {
            console.error(
              `Failed to send email to ${recipientEmail}:`,
              mailError.message,
            );
          }
        }
      }
    }

    await Promise.all(alertsSent);
    console.log(`Alert check complete. ${alertsSent.length} alerts sent.`);
  } catch (error) {
    console.error("Error in checkSolarActivity:", error.message);
  }
}

// Run every 15 minutes
cron.schedule("*/15 * * * *", checkSolarActivity);

// Initial run on startup
checkSolarActivity();

console.log("Solar Dash Backend Service Started.");
