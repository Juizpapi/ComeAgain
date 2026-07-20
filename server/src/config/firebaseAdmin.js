import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";


const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

initializeApp({
  credential: cert(serviceAccount),
});

const adminAuth = getAuth();

export default adminAuth;