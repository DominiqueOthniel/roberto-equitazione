'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">
                Qualcosa è andato storto
              </h2>
              <p className="text-text-secondary mb-6">
                Si è verificato un errore imprevisto. Per favore, ricarica la pagina.
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast"
              >
                Ricarica la pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

