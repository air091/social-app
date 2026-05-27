import admin from "firebase-admin";
import serviceAccount from "../social-app-f65e0-firebase-adminsdk-fbsvc-f9dcb5eb35.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const db = admin.firestore();
