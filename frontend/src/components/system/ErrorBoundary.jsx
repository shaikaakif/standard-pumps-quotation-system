import React, { Component } from "react";
import { FiAlertOctagon, FiRefreshCw } from "react-icons/fi";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an uncaught React error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-brand-gray-200 shadow-md p-6 max-w-md w-full text-center">
            <div className="bg-red-50 text-red-600 p-4 rounded-full inline-block mb-4">
              <FiAlertOctagon className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-800 uppercase tracking-wide">
              Application Crashed
            </h2>
            <p className="text-sm text-brand-gray-550 mt-2 leading-relaxed">
              An unexpected error occurred in the user interface. Don't worry, all pricing configs and calculation services are safe.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-brand-gray-50 border border-brand-gray-200 rounded text-left text-xs font-mono text-red-500 overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-brand-navy-800 text-white py-2.5 rounded font-bold hover:bg-brand-navy-900 transition-colors shadow-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Reset Shop Estimate Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
