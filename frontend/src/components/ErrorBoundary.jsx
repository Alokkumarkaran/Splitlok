import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Splitlok Uncaught Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetApp = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 text-white font-sans">
          <div className="max-w-lg w-full bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
              <AlertTriangle size={32} className="stroke-[2.5px]" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
              Application Recovery
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Something went wrong
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              An unexpected error occurred while rendering the page. Don't worry, your ledger data on the server is completely safe.
            </p>

            {/* Collapsible Error Trace */}
            {this.state.error && (
              <div className="w-full mt-5 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
                <div className="font-bold text-rose-400 mb-1">{this.state.error.toString()}</div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-slate-500 text-[10px] whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleResetApp}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
              >
                <Trash2 size={15} />
                <span>Clear Cache & Reset</span>
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

