import { Component } from "react";
import PropTypes from "prop-types";
import {ErrorIcon} from "./Icons";
import Button from "./Button";

/**
 * Captura erros de renderização de qualquer filho e exibe um fallback
 * amigável, evitando tela branca. Oferece "Tentar novamente" (remonta
 * a árvore) e recarregar a página.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="mx-auto mt-12 max-w-lg rounded-2xl border border-error-container bg-error-container/40 p-8 text-center"
      >
        <ErrorIcon className="mx-auto h-9 w-9 text-error"/>
        <h2 className="mt-3 font-headline-md font-bold text-on-surface">
          Algo deu errado nesta área
        </h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Ocorreu um erro inesperado ao exibir esta tela. Suas informações não foram
          perdidas — tente novamente ou recarregue a página.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-surface-container-low p-3 text-left text-xs text-on-surface-variant">
            {String(this.state.error?.message || this.state.error)}
          </pre>
        )}
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={this.handleRetry}>
            Tentar novamente
          </Button>
          <Button onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
};
