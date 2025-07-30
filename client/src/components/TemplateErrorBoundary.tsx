import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class TemplateErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Template Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-medium mb-2">Template Rendering Error</h2>
            <p className="text-sm mb-4 text-red-700">
              There was an error rendering the template. This might be due to:
            </p>
            <ul className="text-xs text-red-600 text-left mb-4 space-y-1">
              <li>• Invalid data structure</li>
              <li>• Missing required fields</li>
              <li>• Template compatibility issues</li>
            </ul>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-red-600">Error Details</summary>
                <pre className="mt-2 text-left overflow-auto bg-red-100 p-2 rounded">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return (
      <div data-template-error-boundary="true">
        {this.props.children}
      </div>
    );
  }
}