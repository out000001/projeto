import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import PropTypes from "prop-types";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";
import ErrorBoundary from "./ErrorBoundary";

describe("Modal", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("não renderiza nada quando fechado", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Teste">
        <p>conteúdo</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza diálogo com título acessível quando aberto", () => {
    render(
      <Modal open onClose={() => {}} title="Detalhes" titleId="t1">
        <h2 id="t1">Detalhes</h2>
        <p>conteúdo</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Detalhes");
    expect(within(dialog).getByText("conteúdo")).toBeInTheDocument();
  });

  it("fecha com Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Fechável">
        <p>ok</p>
      </Modal>
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fecha ao clicar no backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Backdrop">
        <p>ok</p>
      </Modal>
    );

    await user.click(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("bloqueia o scroll do body e restaura ao fechar", () => {
    const { unmount } = render(
      <Modal open onClose={() => {}} title="Scroll">
        <p>ok</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("move o foco para o painel ao abrir", () => {
    render(
      <Modal open onClose={() => {}} title="Foco">
        <p>ok</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveFocus();
  });
});

describe("ErrorBoundary", () => {
  // Silencia o log de erro esperado do React durante o teste.
  beforeAll(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  function Bomb({ shouldThrow }) {
    if (shouldThrow) {
      throw new Error("explosão controlada");
    }
    return <p>conteúdo seguro</p>;
  }

  Bomb.propTypes = {
    shouldThrow: PropTypes.bool
  };

  it("renderiza filhos normalmente quando não há erro", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("conteúdo seguro")).toBeInTheDocument();
  });

  it("exibe fallback amigável quando filho quebra", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Algo deu errado nesta área/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByText("conteúdo seguro")).not.toBeInTheDocument();
  });

  it("permite retry após erro", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(screen.getByText("conteúdo seguro")).toBeInTheDocument();
  });
});

it('keeps Tab and Shift+Tab within the modal and restores focus on close',async()=>{
 const user=userEvent.setup();
 function content(open){return <><button>Acionador</button><Modal open={open} onClose={()=>{}} title="Teclado"><button>Última ação</button></Modal></>;}
 const{rerender}=render(content(false));const trigger=screen.getByRole('button',{name:'Acionador'});await user.click(trigger);rerender(content(true));
 expect(screen.getByRole('dialog')).toHaveFocus();await user.tab();expect(screen.getByRole('button',{name:'Fechar'})).toHaveFocus();await user.tab({shift:true});expect(screen.getByRole('button',{name:'Última ação'})).toHaveFocus();await user.tab();expect(screen.getByRole('button',{name:'Fechar'})).toHaveFocus();rerender(content(false));expect(trigger).toHaveFocus();
});
