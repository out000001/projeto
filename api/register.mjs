import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createRegistrationHandler } from '../server/registration.mjs';

export default async function register(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
    if (credentials.project_id !== 'portaldeextensaocomunitaria') throw new Error('Invalid project');
    const app = getApps()[0] || initializeApp({ credential: cert(credentials) });
    return await createRegistrationHandler({
      auth: getAuth(app), db: getFirestore(app), managerKey: process.env.MANAGER_REGISTRATION_KEY
    })(req, res);
  } catch {
    return res.status(503).json({ error: 'Cadastro indisponível. Entre em contato com o suporte.' });
  }
}
