# Implementation Log - February 15, 2026

## Summary of Changes

### 1. Frontend: Profile & Alerts Fixes

- **State Separation**: In `AlertsContext.tsx`, separated `loading` (initial fetch) from `isUpdating` (save state). This prevents the entire Profile page from disappearing/flickering when clicking "Save".
- **Button Behavior**: Updated `Profile.tsx` to use the new `isUpdating` state for the `LoadingButton`.
- **Save Reliability**: Switched from Firebase `updateDoc` to `setDoc(..., { merge: true })` to ensure user documents are created if they don't exist.
- **Improved Debugging**: Added configuration validation in `AuthContext.tsx` and detailed console logs in `AlertsContext.tsx` to catch missing `.env` keys or network blocks (ad-blockers).

### 2. Infrastructure: Firebase Setup

- **Database Identification**: Confirmed via error logs that the Firestore database was not initialized in the Firebase project `webgrove-1719942620266`.
- **Security Rules**: Provided optimized `firestore.rules` and `firestore.indexes.json`.

### 3. Backend: Self-Hosted Alert Service

Since the app is hosted via Docker (not on Firebase Hosting), we added a dedicated backend service to handle background tasks:

- **Location**: `/backend/`
- **Features**:
  - Cron job running every 15 minutes to fetch NOAA Kp-index data.
  - Automatic email alerts using `nodemailer`.
  - Spam prevention (max 1 alert per 6 hours per user).
  - Uses Firebase Admin SDK to securely access user preferences.
- **Docker Integration**: Updated `docker-compose.yml` to run the `backend` container alongside the `app` container.
- **Environment**: Updated `sample.env` with SMTP and `FIREBASE_SERVICE_ACCOUNT` placeholders.

## Next Steps for Testing

1. **Firebase Console**:
   - Enable **Firestore Database** in the Firebase Console (choose "Test Mode" initially).
   - Go to Project Settings > Service Accounts and generate a **New Private Key**.

2. **Configuration**:
   - Update your `.env.development` with the JSON content of the service account key.
   - Fill in your SMTP server details (for sending emails).

3. **Execution**:
   - Build and start the services:
     ```bash
     docker-compose up --build
     ```
   - Check the logs of the `solar-dashboard-backend` container to verify it's successfully connecting to NOAA and Firestore.

4. **Verification**:
   - Log in to your dashboard.
   - Go to the Profile page, set a low Kp threshold (e.g., Kp 1), and enable Email Alerts.
   - Click "Save Settings" (verify the button spins and stays visible).
   - Check the console for "Firestore save successful".
   - The backend should pick up the change within 15 minutes and send an email if the current Kp exceeds your threshold.
