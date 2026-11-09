import { describe, it, expect } from "vitest";
import { applyProjectFilters } from "./useProjectFilters";
import { projects } from "../../../test/fixtures/publicProjects";

describe("applyProjectFilters — Sprint 2 vitrine", () => {
  it("retorna todos os projetos sem critérios", () => {
    const result = applyProjectFilters(projects, {});
    expect(result).toHaveLength(projects.length);
  });

  it("filtra por termo de busca em título e descrição", () => {
    const result = applyProjectFilters(projects, { search: "psicológica" });
    expect(result).toHaveLength(1);
    expect(result[0].area).toBe("Saúde Comunitária");
  });

  it("busca também encontra por curso", () => {
    const result = applyProjectFilters(projects, { search: "Nutrição" });
    expect(result.some((p) => p.area === "Sustentabilidade")).toBe(true);
  });

  it("filtra por área temática", () => {
    const result = applyProjectFilters(projects, { area: "Direitos Humanos" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("filtra por local/território", () => {
    const result = applyProjectFilters(projects, { local: "Soledade" });
    expect(result).toHaveLength(2);
  });

  it("filtra apenas vagas abertas", () => {
    const result = applyProjectFilters(projects, { onlyOpen: true });
    expect(result.every((p) => p.spotsLeft > 0)).toBe(true);
  });

  it("filtra por turno selecionado", () => {
    const result = applyProjectFilters(projects, { turnos: ["Sábados"] });
    expect(result.every((p) => p.turnos.includes("Sábados"))).toBe(true);
  });

  it("ordena por prazo mais próximo (deadline)", () => {
    const result = applyProjectFilters(projects, { sortBy: "deadline" });
    for (let i = 1; i < result.length; i += 1) {
      expect(new Date(result[i - 1].deadline).getTime()).toBeLessThanOrEqual(
        new Date(result[i].deadline).getTime()
      );
    }
  });

  it("ordena por mais vagas disponíveis", () => {
    const result = applyProjectFilters(projects, { sortBy: "spots" });
    expect(result[0].spotsLeft).toBeGreaterThanOrEqual(result[1].spotsLeft);
  });

  it("ordena por maior carga horária ACC", () => {
    const result = applyProjectFilters(projects, { sortBy: "hours" });
    const toHours = (h) => Number(h.match(/\d+/)[0]);
    expect(toHours(result[0].hours)).toBeGreaterThanOrEqual(toHours(result[1].hours));
  });

  it("não muta a lista original", () => {
    const before = [...projects];
    applyProjectFilters(projects, { sortBy: "spots" });
    expect(projects).toEqual(before);
  });

  it("combina múltiplos critérios", () => {
    const result = applyProjectFilters(projects, {
      onlyOpen: true,
      local: "Soledade",
      search: "hortas"
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(6);
  });
});
