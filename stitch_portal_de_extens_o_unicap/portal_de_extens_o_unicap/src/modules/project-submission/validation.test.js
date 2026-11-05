import { describe, it, expect } from "vitest";
import {
  validateStep,
  validateCompliance,
  validateAttachment,
  totalBudget
} from "./validation";
import { createEmptySubmission } from "./data/submissionOptions";

const validForm = () => ({
  ...createEmptySubmission(),
  title: "Cidadania Digital e Letramento Midiático na Comunidade dos Coelhos",
  ods: ["4", "10"],
  socialJustification:
    "A ação responde à lacuna de inclusão digital na comunidade dos Coelhos, com oficinas de mediação tecnológica para jovens e adultos.",
  bolsistas: 2,
  voluntarios: 4,
  expectedAudience: 120,
  objectives: "Capacitar moradores para o uso seguro de serviços públicos digitais.",
  activities: "Oficinas semanais, mentorias individuais e rodas de conversa sobre segurança digital.",
  selectedDeliverables: ["relatorio_parcial", "lista_frequencia"],
  budget: [
    { category: "bolsas", amount: 9600 },
    { category: "material", amount: 800 },
    { category: "transporte", amount: 400 },
    { category: "divulgacao", amount: 200 }
  ],
  compliance: { cne: true, forproex: true, lgpd: true, autorizacao: true }
});

describe("validateStep — Sprint 3 submissão", () => {
  it("formulário completo passa em todas as etapas", () => {
    for (const stepId of [
      "identificacao",
      "impacto",
      "equipe",
      "trabalho",
      "orcamento",
      "revisao"
    ]) {
      const result = validateStep(stepId, validForm());
      expect(result.ok, `etapa ${stepId}: ${JSON.stringify(result.errors)}`).toBe(true);
    }
  });

  it("etapa 1 exige título com no mínimo 10 caracteres", () => {
    const result = validateStep("identificacao", { ...validForm(), title: "curto" });
    expect(result.ok).toBe(false);
    expect(result.errors.title).toMatch(/10 caracteres/i);
  });

  it("etapa 1 valida centro e modalidade", () => {
    const result = validateStep("identificacao", { ...validForm(), center: "", modality: "" });
    expect(result.ok).toBe(false);
    expect(result.errors.center).toBeDefined();
    expect(result.errors.modality).toBeDefined();
  });

  it("etapa 2 exige pelo menos um ODS", () => {
    const result = validateStep("impacto", { ...validForm(), ods: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.ods).toBeDefined();
  });

  it("etapa 2 exige justificativa social com no mínimo 50 caracteres", () => {
    const result = validateStep("impacto", {
      ...validForm(),
      socialJustification: "muito curta"
    });
    expect(result.ok).toBe(false);
    expect(result.errors.socialJustification).toMatch(/50 caracteres/i);
  });

  it("etapa 3 exige equipe e público estimado", () => {
    const result = validateStep("equipe", {
      ...validForm(),
      bolsistas: 0,
      voluntarios: 0,
      expectedAudience: 0
    });
    expect(result.ok).toBe(false);
    expect(result.errors.team).toBeDefined();
    expect(result.errors.expectedAudience).toBeDefined();
  });

  it("etapa 3 aceita apenas voluntários, sem bolsistas", () => {
    const result = validateStep("equipe", { ...validForm(), bolsistas: 0, voluntarios: 3 });
    expect(result.ok).toBe(true);
  });

  it("etapa 4 exige objetivos e atividades detalhados", () => {
    const result = validateStep("trabalho", {
      ...validForm(),
      objectives: "resumo",
      activities: "resumo"
    });
    expect(result.ok).toBe(false);
    expect(result.errors.objectives).toBeDefined();
    expect(result.errors.activities).toBeDefined();
  });

  it("etapa 4 exige pelo menos um entregável", () => {
    const result = validateStep("trabalho", { ...validForm(), selectedDeliverables: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.selectedDeliverables).toBeDefined();
  });

  it("etapa 5 exige orçamento total maior que zero", () => {
    const result = validateStep("orcamento", {
      ...validForm(),
      budget: [
        { category: "bolsas", amount: 0 },
        { category: "material", amount: 0 }
      ]
    });
    expect(result.ok).toBe(false);
    expect(result.errors.budget).toBeDefined();
  });

  it("etapa 6 bloqueia envio com checklist pendente", () => {
    const result = validateStep("revisao", {
      ...validForm(),
      compliance: { cne: true, forproex: true, lgpd: false, autorizacao: false }
    });
    expect(result.ok).toBe(false);
    expect(result.errors.compliance).toBeDefined();
  });
});

describe("validateCompliance", () => {
  it("retorna ok quando todos os itens confirmados", () => {
    expect(validateCompliance(validForm()).ok).toBe(true);
  });

  it("lista itens pendentes", () => {
    const result = validateCompliance({
      compliance: { cne: true, forproex: false, lgpd: true, autorizacao: false }
    });
    expect(result.ok).toBe(false);
    expect(result.pending).toEqual(["forproex", "autorizacao"]);
  });
});

describe("validateAttachment", () => {
  const makeFile = (name, size, type) => ({ name, size, type });

  it("aceita PDF dentro do limite", () => {
    expect(validateAttachment(makeFile("plano.pdf", 2 * 1024 * 1024, "application/pdf"))).toBeNull();
  });

  it("rejeita arquivo acima de 10 MB", () => {
    expect(
      validateAttachment(makeFile("grande.pdf", 11 * 1024 * 1024, "application/pdf"))
    ).toMatch(/10 MB/);
  });

  it("rejeita formato não permitido", () => {
    expect(validateAttachment(makeFile("planilha.xls", 1024, ""))).toMatch(/Formato não aceito/);
  });
});

describe("totalBudget", () => {
  it("soma todas as categorias", () => {
    expect(totalBudget(validForm().budget)).toBe(11000);
  });

  it("retorna zero para lista vazia", () => {
    expect(totalBudget([])).toBe(0);
  });
});

it("identifica o contador que contém fração antes do envio", () => {
  const result = validateStep("equipe", { bolsistas: 1.5, voluntarios: 2, expectedAudience: 50 });
  expect(result.ok).toBe(false);
  expect(result.errors.bolsistas).toMatch(/Bolsistas PIBEX.*número inteiro/);
  expect(result.errors.voluntarios).toBeUndefined();
});
