import { toCsv } from "../../utils/download";

const HOMOLOGATED="homologada";
const PENDING="pending";
const MISSING="missing";

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
