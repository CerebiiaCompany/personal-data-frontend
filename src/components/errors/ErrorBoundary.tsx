"use client";

import React, { Component, ReactNode } from "react";
import Button from "../base/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error capturado:", error);
    console.error("[ErrorBoundary] ErrorInfo:", errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // Recargar la página para resetear todo el estado
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary-900 mb-2">
                Algo salió mal
              </h1>
              <p className="text-stone-600 mb-4">
                Ocurrió un error inesperado al cargar la aplicación.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="font-semibold text-red-800 mb-1">
                  Error: {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-red-600 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={this.handleReset}
                className="w-full"
              >
                Recargar página
              </Button>
              <Button
                onClick={() => (window.location.href = "/login")}
                hierarchy="secondary"
                className="w-full"
              >
                Ir al inicio de sesión
              </Button>
            </div>

            <p className="text-xs text-stone-500 text-center">
              Si el problema persiste, por favor contacta al soporte técnico.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
