import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (value) => createHash('sha256').update(value).digest();

export function createRegistrationHandler({ auth, db, managerKey }) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Método não permitido.' });
    }
    const { name, email, password, profile, managerCode } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.length > 120 ||
        typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof password !== 'string' || password.length < 8 || password.length > 128 ||
        !['estudante', 'gestor'].includes(profile)) {
      return res.status(400).json({ error: 'Preencha nome, e-mail válido e senha de 8 a 128 caracteres.' });
    }
    if (profile === 'gestor' && !managerKey) {
      return res.status(503).json({ error: 'Cadastro de gestores indisponível. Entre em contato com o suporte.' });
    }
    try {
      // Persistent, atomic limit across serverless instances. Never store the code.
      const ip = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const ref = db.collection('_registrationLimits').doc(digest(String(ip)).toString('hex'));
      const allowed = await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        const now = Date.now();
        const previous = snapshot.data();
        const current = previous?.expiresAt > now ? previous : { count: 0, expiresAt: now + 15 * 60_000 };
        if (current.count >= 10) return false;
        tx.set(ref, { count: current.count + 1, expiresAt: current.expiresAt });
        return true;
      });
      if (!allowed) return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });
      if (profile === 'gestor' && (typeof managerCode !== 'string' || managerCode.length > 256 ||
          !timingSafeEqual(digest(managerCode), digest(managerKey)))) {
        return res.status(403).json({ error: 'Chave de gestor inválida.' });
      }
      const user = await auth.createUser({ email: email.trim(), password, displayName: name.trim() });
      try {
        await db.collection('users').doc(user.uid).create({ name: name.trim(), profile });
      } catch (error) {
        await auth.deleteUser(user.uid);
        throw error;
      }
      return res.status(201).json({ ok: true });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') return res.status(409).json({ error: 'Não foi possível cadastrar este e-mail. Tente entrar ou contate o suporte.' });
      console.error('Registration failed', { code: error.code || 'unknown' });
      return res.status(503).json({ error: 'Não foi possível criar sua conta. Tente novamente mais tarde.' });
    }
  };
}
