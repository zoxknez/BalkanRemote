'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface ErrorInfo {
  componentStack: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[ErrorBoundary] Caught error', { error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="mx-auto max-w-2xl p-6 my-8">
          <div className="rounded-lg border border-red-300 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Ups! Nešto je pošlo po zlu
            </h2>
            <p className="text-sm text-red-700 mb-4">
              Došlo je do greške pri učitavanju ove stranice. Pokušajte da osvježite stranicu ili se vratite kasnije.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-red-800">
                  Tehnički detalji
                </summary>
                <pre className="mt-2 text-xs bg-red-100 p-3 rounded overflow-auto max-h-96">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
            >
              Osvježi stranicu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

