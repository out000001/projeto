import {describe,it,expect} from "vitest";
import {buildFrequencyCsv} from "./trackingLogic";
const HOMOLOGATED="homologada",PENDING="pending",MISSING="missing";

describe("buildFrequencyCsv — exportação da folha", () => {
  const students = [
    {
      id: "s1",
      name: "Ana Souza",
      mat: "20201001",
      course: "Direito",
      modality: "Bolsista PIBEX"
    },
    {
      id: "s2",
      name: "Beto Lima",
      mat: "20201002",
      course: "Psicologia",
      modality: "Voluntário"
    },
    {
      id: "s3",
      name: "Cássia Melo",
      mat: "20201003",
      course: "Serviço Social",
      modality: "Bolsista PIBEX"
    }
  ];

  const sheet = {
    s1: { hours: 30, status: HOMOLOGATED },
    s2: { hours: 0, status: MISSING },
    s3: { hours: 12, status: PENDING }
  };

  it("gera uma linha por discente com horas, previsão e situação", () => {
    const csv = buildFrequencyCsv({
      monthLabel: "Março / 2025",
      expectedHours: 30,
      students,
      sheet,
      totals: { s1: 60, s2: 0, s3: 12 }
    });
    const [header, ...rows] = csv.replace(/^\uFEFF/, "").trim().split("\r\n");

    expect(header).toContain("Discente");
    expect(header).toContain("Horas (Março / 2025)");
    expect(rows).toHaveLength(3);

    expect(rows[0]).toContain("Ana Souza");
    expect(rows[0]).toContain("Homologada");
    expect(rows[1]).toContain("Beto Lima");
    expect(rows[1]).toContain("Sem envio");
    expect(rows[2]).toContain("Cássia Melo");
    expect(rows[2]).toContain("Pendente");
  });

  it("funciona sem registro de folha (trata como sem envio)", () => {
    const csv = buildFrequencyCsv({
      monthLabel: "Abril / 2025",
      expectedHours: 30,
      students: [students[1]],
      sheet: {},
      totals: {}
    });
    const rows = csv.replace(/^\uFEFF/, "").trim().split("\r\n");

    expect(rows).toHaveLength(2);
    expect(rows[1]).toContain("Beto Lima");
    expect(rows[1]).toContain("Sem envio");
  });
});
