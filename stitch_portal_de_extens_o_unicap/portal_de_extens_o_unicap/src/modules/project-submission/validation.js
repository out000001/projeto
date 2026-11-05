import { annexRules } from "./data/submissionOptions.js";

// Validações puras do fluxo de submissão — sem React, para testes de unidade diretos.

export function validateStep(stepId, form) {
  const errors = {};

  switch (stepId) {
    case "identificacao": {
      if (!form.title || form.title.trim().length < 10) {
        errors.title = "Informe um título com pelo menos 10 caracteres.";
      }
      if (!form.center) errors.center = "Selecione o centro acadêmico.";
      if (!form.modality) errors.modality = "Selecione a modalidade da ação (FORPROEX).";
      break;
    }
    case "impacto": {
      if (!form.ods || form.ods.length === 0) {
        errors.ods = "Selecione pelo menos um ODS.";
      }
      if (!form.socialJustification || form.socialJustification.trim().length < 50) {
        errors.socialJustification = "Descreva a justificativa social com pelo menos 50 caracteres.";
      }
      break;
    }
    case "equipe": {
      const labels = { bolsistas: "Bolsistas PIBEX", voluntarios: "Voluntários", expectedAudience: "Público Estimado" };
      for (const [field, label] of Object.entries(labels)) {
        const value = Number(form[field] ?? 0);
        if (!Number.isInteger(value) || value < 0 || value > 1000000) {
          errors[field] = `${label}: informe um número inteiro entre 0 e 1.000.000, sem vírgula ou ponto decimal.`;
        }
      }
      if (Object.keys(errors).length) break;
      const bolsistas = Number(form.bolsistas) || 0;
      const voluntarios = Number(form.voluntarios) || 0;
      const audience = Number(form.expectedAudience) || 0;
      if (bolsistas + voluntarios < 1) {
        errors.team = "Informe ao menos 1 bolsista ou voluntário.";
      }
      if (audience < 1) {
        errors.expectedAudience = "Estime o público diretamente impactado.";
      }
      break;
    }
    case "trabalho": {
      if (!form.objectives || form.objectives.trim().length < 20) {
        errors.objectives = "Descreva os objetivos com pelo menos 20 caracteres.";
      }
      if (!form.activities || form.activities.trim().length < 20) {
        errors.activities = "Descreva as atividades previstas com pelo menos 20 caracteres.";
      }
      if (!form.selectedDeliverables || form.selectedDeliverables.length === 0) {
        errors.selectedDeliverables = "Selecione ao menos um produto/entregável.";
      }
      break;
    }
    case "orcamento": {
      const total = (form.budget || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      if (total <= 0) {
        errors.budget = "O orçamento total deve ser maior que zero.";
      }
      break;
    }
    case "revisao": {
      const checklist = form.compliance || {};
      const pending = Object.entries(checklist).filter(([, checked]) => !checked);
      if (pending.length > 0) {
        errors.compliance = "Confirme todos os itens de conformidade institucional antes do envio.";
      }
      break;
    }
    default:
      break;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateCompliance(form) {
  const checklist = form.compliance || {};
  return {
    ok: Object.values(checklist).every(Boolean),
    pending: Object.entries(checklist)
      .filter(([, checked]) => !checked)
      .map(([key]) => key)
  };
}

export function validateAttachment(file) {
  if (file.size > annexRules.maxFileMb * 1024 * 1024) {
    return `Arquivo maior que ${annexRules.maxFileMb} MB.`;
  }
  const extensionOk = annexRules.acceptedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );
  const typeOk = Boolean(file.type) && annexRules.acceptedTypes.includes(file.type);
  if (!extensionOk && !typeOk) {
    return `Formato não aceito. Use: ${annexRules.acceptedExtensions.join(", ")}`;
  }
  return null;
}

export function totalBudget(budget) {
  return (budget || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}
