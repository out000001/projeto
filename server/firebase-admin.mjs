import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
export function services() {
  const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  if (credentials.project_id !== 'portaldeextensaocomunitaria') throw new Error('Invalid project');
  const app = getApps()[0] || initializeApp({ credential: cert(credentials) });
  return { auth: getAuth(app), db: getFirestore(app) };
}
