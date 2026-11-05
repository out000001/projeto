const DEFAULT_MONTHLY_HOURS = 30;
import { toCsv } from "../../utils/download";

// Regras de negócio puras do acompanhamento — sem React, para testes diretos.

export const HOMOLOGATED = "homologada";
export const PENDING = "pending";
export const MISSING = "missing";

export function monthlyProgress(record, expectedHours = DEFAULT_MONTHLY_HOURS) {
  const hours = Number(record?.hours) || 0;
  if (hours <= 0) return 0;
  return Math.min(100, Math.round((hours / expectedHours) * 100));
}

export function cumulativeHours(frequency, studentId) {
  let total = 0;
  for (const monthId of Object.keys(frequency)) {
    total += Number(frequency[monthId]?.[studentId]?.hours) || 0;
  }
  return total;
}

/**
 * Homologação da folha mensal de um estudante.
 * Regras:
 * - não pode homologar com 0 horas registradas;
 * - não pode homologar acima do teto mensal (com pequena tolerância de 2h);
 * - não pode homologar algo já homologado.
 * Retorna { ok, message?, status }.
 */
export function homologateRecord(record, expectedHours = DEFAULT_MONTHLY_HOURS) {
  const hours = Number(record?.hours) || 0;

  if (record?.status === HOMOLOGATED) {
    return { ok: false, message: "Folha já homologada.", status: record.status };
  }
  if (hours <= 0) {
    return {
      ok: false,
      message: "Não é possível homologar com 0 horas registradas.",
      status: MISSING
    };
  }
  if (hours > expectedHours + 2) {
    return {
      ok: false,
      message: `Horas acima do teto mensal (${expectedHours}h).`,
      status: PENDING
    };
  }
  return { ok: true, status: HOMOLOGATED };
}

export function countPendingHomologations(frequency, monthId) {
  const sheet = frequency[monthId] || {};
  return Object.values(sheet).filter((r) => r.status === PENDING && Number(r.hours) > 0).length;
}

export function monthCompletion(frequency, monthId) {
  const sheet = frequency[monthId] || {};
  const entries = Object.values(sheet);
  if (entries.length === 0) return 0;
  const homologated = entries.filter((r) => r.status === HOMOLOGATED).length;
  return Math.round((homologated / entries.length) * 100);
}

export function monthsUntil(monthId, monthList = []) {
  const index = monthList.findIndex((m) => m.id === monthId);
  return index === -1 ? 0 : index;
}

/** Conteúdo CSV da folha de frequência de uma competência (mês). */
export function buildFrequencyCsv({ monthLabel, expectedHours, students, sheet, totals }) {
  const headers = [
    "Discente",
    "Matrícula",
    "Curso",
    "Modalidade",
    `Horas (${monthLabel})`,
    `Prevista (${expectedHours}h)`,
    "Situação",
    "Total acumulado"
  ];

  const rows = (students || []).map((student) => {
    const record = sheet?.[student.id] || { hours: 0, status: MISSING };
    const statusLabel =
      record.status === HOMOLOGATED
        ? "Homologada"
        : record.status === PENDING && Number(record.hours) > 0
          ? "Pendente"
          : "Sem envio";
    return [
      student.name,
      student.mat,
      student.course,
      student.modality,
      record.hours,
      expectedHours,
      statusLabel,
      totals?.[student.id] || 0
    ];
  });

  return toCsv(headers, rows);
}
