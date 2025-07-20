import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  // Add a key prop to reset the error boundary when data changes
  dataKey?: string | number;
  // Optional custom error message
  fallback?: ReactNode;
  // Optional className for the error container
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  lastErrorKey?: string | number;
  retryCount: number;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare state: ErrorBoundaryState;
  declare props: ErrorBoundaryProps;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      lastErrorKey: props.dataKey,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      errorInfo: { componentStack: '' } // Will be updated in componentDidCatch
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  // Reset error state when dataKey changes
  static getDerivedStateFromProps(
    nextProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ): Partial<ErrorBoundaryState> | null {
    // Reset the error boundary when the dataKey changes
    if (nextProps.dataKey !== prevState.lastErrorKey) {
      return {
        hasError: false,
        error: null,
        errorInfo: null,
        lastErrorKey: nextProps.dataKey,
        retryCount: 0
      };
    }
    return null;
  }

  // Type-safe setState
  setState = <K extends keyof ErrorBoundaryState>(
    state: ((prevState: Readonly<ErrorBoundaryState>) => (Pick<ErrorBoundaryState, K> | ErrorBoundaryState | null)) | (Pick<ErrorBoundaryState, K> | ErrorBoundaryState | null),
    callback?: () => void
  ) => {
    super.setState(state as any, callback);
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    const { children, fallback, className = '' } = this.props;
    
    if (this.state.hasError) {
      // If a custom fallback is provided, render it
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ error: this.state.error, errorInfo: this.state.errorInfo, retry: this.handleRetry })
          : fallback;
      }

      // Default error UI
      return (
        <div className={`flex items-center justify-center h-full w-full bg-black/50 p-4 ${className}`}>
          <div className="text-center p-6 bg-gray-900/95 rounded-lg max-w-md w-full">
            <div className="text-red-400 mb-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-red-300 text-sm mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.error?.stack && (
              <details className="mb-4 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer">Show details</summary>
                <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-300 overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
