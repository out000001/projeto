// Lógica pura das configurações da conta: validação, sanitização e comparação.
// Mantida isolada de React para testes unitários diretos (padrão dos módulos).

export const DEFAULT_SETTINGS = {
  displayName: "",
  alternateEmail: "",
  notifyDeadlines: true,
  notifyHomologacoes: true,
  notifyEditais: false,
  weeklyDigest: true,
  density: "confortavel",
  deadlineAlertDays: 7,
  sessionTimeoutMinutes: 30
};

export const SESSION_TIMEOUT_MINUTES = [15, 30, 60, 120];
const DENSITY_IDS = ["confortavel", "compacta"];
const DEADLINE_ALERT_MIN_DAYS = 1;
const DEADLINE_ALERT_MAX_DAYS = 30;

const BOOLEAN_KEYS = ["notifyDeadlines", "notifyHomologacoes", "notifyEditais", "weeklyDigest"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSettings(settings) {
  const errors = {};

  const alternateEmail = (settings?.alternateEmail || "").trim();
  if (alternateEmail && !EMAIL_RE.test(alternateEmail)) {
    errors.alternateEmail = "Informe um e-mail válido, como nome@dominio.br.";
  }

  const days = Number(settings?.deadlineAlertDays);
  if (!Number.isInteger(days) || days < DEADLINE_ALERT_MIN_DAYS || days > DEADLINE_ALERT_MAX_DAYS) {
    errors.deadlineAlertDays = `A antecedência do alerta deve ser entre ${DEADLINE_ALERT_MIN_DAYS} e ${DEADLINE_ALERT_MAX_DAYS} dias.`;
  }

  if (!DENSITY_IDS.includes(settings?.density)) {
    errors.density = "Selecione uma densidade válida.";
  }

  if (!SESSION_TIMEOUT_MINUTES.includes(Number(settings?.sessionTimeoutMinutes))) {
    errors.sessionTimeoutMinutes = "Selecione um tempo de sessão válido.";
  }

  for (const key of BOOLEAN_KEYS) {
    if (typeof settings?.[key] !== "boolean") {
      errors[key] = "Valor inválido.";
    }
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

// Preenche campos ausentes e corrige campos corrompidos com o valor padrão.
export function sanitizeSettings(saved) {
  const merged = { ...DEFAULT_SETTINGS, ...(saved || {}) };
  const { errors } = validateSettings(merged);
  for (const key of Object.keys(errors)) {
    merged[key] = DEFAULT_SETTINGS[key];
  }
  return merged;
}

export function settingsAreEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function settingsAreDefault(settings) {
  return settingsAreEqual(settings, DEFAULT_SETTINGS);
}
