import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { submitProject } from "../../services/projectApi";
import ProjectSubmission from "./ProjectSubmission";

vi.mock("../../services/projectApi", () => ({ submitProject: vi.fn().mockResolvedValue({ id: "saved-project", ok: true }) }));

// O rascunho vive no localStorage: limpa antes de cada teste para evitar vazamento de estado.
beforeEach(() => {
  window.localStorage.clear();
});

function renderSubmission() {
  return render(
    <MemoryRouter>
      <ProjectSubmission />
    </MemoryRouter>
  );
}

const titleInput = () => screen.getByLabelText(/título do projeto/i);

async function fillIdentification(user) {
  await user.clear(titleInput());
  await user.type(titleInput(), "Cidadania Digital e Letramento Midiático na Comunidade dos Coelhos");
  await user.selectOptions(screen.getByLabelText(/centro acadêmico/i), "IH - Inst. Humanitas de Direitos Humanos");
}

async function fillImpacto(user) {
  await user.click(screen.getByRole("checkbox", { name: /educação qualidade/i }));
  await user.type(
    screen.getByLabelText(/justificativa social/i),
    "A ação responde à lacuna de inclusão digital na comunidade dos Coelhos com oficinas semanais de mediação tecnológica."
  );
}

async function fillEquipe(user) {
  await user.type(screen.getByLabelText(/bolsistas pibex/i, { selector: "input" }), "2");
  await user.type(screen.getByLabelText(/^público estimado$/i, { selector: "input" }), "120");
}

async function fillTrabalho(user) {
  await user.type(
    screen.getByLabelText(/objetivos da ação/i),
    "Capacitar moradores para o uso seguro de serviços públicos digitais."
  );
  await user.type(
    screen.getByLabelText(/atividades previstas/i),
    "Oficinas semanais, mentorias individuais e rodas de conversa sobre segurança digital."
  );
  await user.click(screen.getByRole("checkbox", { name: /relatório parcial/i }));
}

async function fillOrcamento(user) {
  await user.type(screen.getByLabelText(/bolsas de extensão/i), "9600");
}

async function checkCompliance(user) {
  const checkboxes = screen.getAllByRole("checkbox");
  for (const checkbox of checkboxes) {
    if (!checkbox.checked) await user.click(checkbox);
  }
}

async function completeAllSteps(user) {
  await fillIdentification(user);
  await user.click(screen.getByRole("button", { name: /continuar/i }));

  await fillImpacto(user);
  await user.click(screen.getByRole("button", { name: /continuar/i }));

  await fillEquipe(user);
  await user.click(screen.getByRole("button", { name: /continuar/i }));

  await fillTrabalho(user);
  await user.click(screen.getByRole("button", { name: /continuar/i }));

  await fillOrcamento(user);
  await user.click(screen.getByRole("button", { name: /continuar/i }));

  await checkCompliance(user);
}

describe("Sprint 3 — submissão de projeto", () => {
  it("renderiza stepper com 6 etapas e começa na primeira", () => {
    renderSubmission();

    expect(screen.getByRole("navigation", { name: /etapas da submissão/i })).toBeInTheDocument();
    expect(screen.getByText("Identificação Geral")).toBeInTheDocument();
    expect(screen.getByText("Revisão e Envio")).toBeInTheDocument();
    expect(titleInput()).toHaveValue("");
  });

  it("bloqueia avanço com erro de validação e exibe mensagem", async () => {
    const user = userEvent.setup();
    renderSubmission();

    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.getByText(/informe um título com pelo menos 10 caracteres/i)).toBeInTheDocument();
    // Continua na etapa 1
    expect(screen.getByText(/dados gerais da ação extensionista/i)).toBeInTheDocument();
  });

  it("permite navegar entre etapas com voltar/continuar", async () => {
    const user = userEvent.setup();
    renderSubmission();

    await fillIdentification(user);
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText(/alinhamento pedagógico e ods/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /voltar/i }));
    expect(screen.getByText(/dados gerais da ação extensionista/i)).toBeInTheDocument();
    // Estado preservado ao voltar
    expect(titleInput()).toHaveValue("Cidadania Digital e Letramento Midiático na Comunidade dos Coelhos");
  });

  it("persiste rascunho no localStorage entre montagens", async () => {
    const user = userEvent.setup();
    const { unmount } = renderSubmission();

    await fillIdentification(user);
    await waitFor(
      () => {
        expect(window.localStorage.getItem("unicap:submission-draft")).toBeTruthy();
      },
      { timeout: 2000 }
    );

    unmount();
    renderSubmission();
    expect(titleInput()).toHaveValue("Cidadania Digital e Letramento Midiático na Comunidade dos Coelhos");
  });

  it("envia a proposta completa e mostra sucesso", async () => {
    const user = userEvent.setup();
    renderSubmission();

    await completeAllSteps(user);
    await user.click(screen.getByRole("button", { name: /enviar proposta/i }));

    expect(screen.getByText(/proposta enviada com sucesso/i)).toBeInTheDocument();
    expect(screen.getByText(/Cidadania Digital e Letramento Midiático/i)).toBeInTheDocument();
  });

  it("mantém o rascunho quando o servidor não confirma o salvamento", async () => {
    vi.mocked(submitProject).mockRejectedValueOnce(new Error("Não foi possível salvar. Tente novamente."));
    const user = userEvent.setup();
    renderSubmission();
    await completeAllSteps(user);
    await user.click(screen.getByRole("button", { name: /enviar proposta/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("O rascunho foi mantido");
    expect(screen.queryByText(/proposta enviada com sucesso/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar proposta/i })).toBeEnabled();
  });

  it("bloqueia envio final sem checklist de conformidade completo", async () => {
    const user = userEvent.setup();
    renderSubmission();

    await completeAllSteps(user);

    // desmarca o último item do checklist
    const checkboxes = screen.getAllByRole("checkbox");
    const last = checkboxes[checkboxes.length - 1];
    await user.click(last);

    await user.click(screen.getByRole("button", { name: /enviar proposta/i }));
    expect(screen.getByText(/confirme todos os itens de conformidade/i)).toBeInTheDocument();
    expect(screen.queryByText(/proposta enviada com sucesso/i)).not.toBeInTheDocument();
  });

  it("resumo da revisão exibe orçamento formatado e ODS", async () => {
    const user = userEvent.setup();
    renderSubmission();

    await completeAllSteps(user);

    expect(screen.getByRole("heading", { name: /resumo da proposta/i })).toBeInTheDocument();
    expect(screen.getByText(/R\$ 9\.600,00/)).toBeInTheDocument();
    expect(screen.getByText(/educação qualidade/i)).toBeInTheDocument();
  });

  it("valida anexos: formato inválido é rejeitado com mensagem", async () => {
    const user = userEvent.setup();
    renderSubmission();

    // avança até a etapa de orçamento
    await fillIdentification(user);
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await fillImpacto(user);
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await fillEquipe(user);
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await fillTrabalho(user);
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    const invalidFile = new File(["data"], "planilha.xls", { type: "" });
    const input = document.querySelector('input[type="file"]');
    // fireEvent direto para contornar o filtro do atributo accept e exercitar a validação do módulo
    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/formato não aceito/i)).toBeInTheDocument();
    });
  });

  it("limpa o rascunho com o botão dedicado", async () => {
    const user = userEvent.setup();
    renderSubmission();

    await fillIdentification(user);
    await waitFor(
      () => {
        expect(window.localStorage.getItem("unicap:submission-draft")).toBeTruthy();
      },
      { timeout: 2000 }
    );

    await user.click(screen.getByRole("button", { name: /limpar rascunho/i }));
    await waitFor(() => {
      expect(window.localStorage.getItem("unicap:submission-draft")).toBeNull();
    });
  });
});
