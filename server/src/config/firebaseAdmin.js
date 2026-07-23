import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../../firebase-service-account.json" with { type: "json" };


initializeApp({
  credential: cert(serviceAccount),
});


const adminAuth = getAuth();

export default adminAuth;