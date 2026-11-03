import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FamilySphere Caught Runtime Error:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.removeItem('familysphere_token');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-[#172033] font-sans">
          <div className="max-w-md w-full bg-white border-3 border-[#172033] shadow-[8px_8px_0px_#172033] p-8 rounded-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-amber-200 border-2 border-[#172033] rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-[3px_3px_0px_#172033]">
              🛡️
            </div>
            <div>
              <h2 className="text-2xl font-black font-serif">FamilySphere System Guard</h2>
              <p className="text-sm text-gray-600 mt-2">
                A temporary rendering exception occurred. The application state has been protected.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs font-mono rounded-lg border border-red-200 text-left overflow-auto max-h-28">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-yellow-300 hover:bg-yellow-200 border-2 border-[#172033] font-bold text-sm rounded-xl shadow-[3px_3px_0px_#172033] transition-all cursor-pointer"
              >
                Reload FamilySphere Archive
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 border border-[#172033] font-bold text-xs rounded-xl text-gray-700 cursor-pointer"
              >
                Reset Session &amp; Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

