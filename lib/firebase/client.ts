import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  browserSessionPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
} from "firebase/auth";
export const firebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
);
let authInstance: ReturnType<typeof initializeAuth> | undefined;
export function getClientAuth() {
  if (!firebaseConfigured)
    throw new Error(
      "Login Google belum tersedia. Gunakan mode guest atau lengkapi konfigurasi Firebase.",
    );
  if (authInstance) return authInstance;
  const app =
    getApps()[0] ||
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  authInstance = initializeAuth(app, {
    persistence: browserSessionPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  if (process.env.NEXT_PUBLIC_USE_EMULATORS === "true")
    connectAuthEmulator(authInstance, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  return authInstance;
}
