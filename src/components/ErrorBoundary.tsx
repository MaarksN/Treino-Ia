import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureError } from '../utils/errorTelemetry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      captureError(error, `ErrorBoundary.${this.props.section ?? 'unknown'}`, {
        componentStack: info.componentStack ?? undefined,
      });
    } catch {
      // Telemetry failures should not prevent the fallback UI from rendering.
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center"
      >
        <p className="font-mono text-sm text-brand-magenta">Algo deu errado nesta secao.</p>
        {import.meta.env.DEV && (
          <pre className="max-w-full overflow-auto rounded bg-black/30 p-3 text-left text-xs text-red-300">
            {this.state.errorMessage}
          </pre>
        )}
        <button
          type="button"
          onClick={this.handleReset}
          className="rounded-lg border border-brand-neon/40 px-4 py-2 text-sm text-brand-neon hover:bg-brand-neon/10"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
}
