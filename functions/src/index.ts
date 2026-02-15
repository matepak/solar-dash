import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

const NOAA_KP_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

/**
 * Scheduled function to check solar activity and alert users.
 * Runs every 30 minutes.
 */
export const checkSolarActivity = functions.pubsub
  .schedule("every 30 minutes")
  .onRun(async (context) => {
    try {
      console.log("Checking solar activity...");
      
      // 1. Fetch latest Kp data from NOAA
      const response = await axios.get(NOAA_KP_URL);
      const data = response.data;
      
      // Get the latest valid Kp reading
      // data[0] is header: ["time_tag", "kp", "a_index", "station_count"]
      const lastReading = data[data.length - 1];
      const currentKp = parseFloat(lastReading[1]);
      
      console.log(`Current Kp index is: ${currentKp}`);
      
      if (isNaN(currentKp)) {
        console.error("Invalid Kp value received from NOAA");
        return null;
      }

      // 2. Query users who want email alerts and have a threshold <= current Kp
      const db = admin.firestore();
      const usersSnapshot = await db.collection("users")
        .where("alertSettings.emailAlerts", "==", true)
        .where("alertSettings.kpThreshold", "<=", currentKp)
        .get();

      if (usersSnapshot.empty) {
        console.log("No users to alert for this Kp level.");
        return null;
      }

      console.log(`Found ${usersSnapshot.size} users to alert.`);

      // 3. Create mail documents for the "Trigger Email" extension
      const batch = db.batch();
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userEmail = userData.email || doc.id; // Fallback to doc ID if email not stored in data

        const mailRef = db.collection("mail").doc();
        batch.set(mailRef, {
          to: userEmail,
          message: {
            subject: `Aurora Alert: Kp Index reached ${currentKp}!`,
            text: `Hello! The current Kp index has reached ${currentKp}. This is above your threshold of ${userData.alertSettings.kpThreshold}. Check the dashboard now: https://sdodash.webgrove.pl/`,
            html: `
              <h1>Aurora Alert!</h1>
              <p>The current <strong>Kp index has reached ${currentKp}</strong>.</p>
              <p>This meets your alert threshold of Kp ${userData.alertSettings.kpThreshold}.</p>
              <p><a href="https://sdodash.webgrove.pl/">View the Live Dashboard</a></p>
            `,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      console.log("Successfully queued alert emails.");
      
      return null;
    } catch (error) {
      console.error("Error in checkSolarActivity function:", error);
      return null;
    }
  });
