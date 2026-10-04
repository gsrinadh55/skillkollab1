import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global Error Boundary caught an unhandled render error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full p-8 rounded-[24px] bg-[#111827] border border-rose-500/30 shadow-[0_10px_40px_rgba(244,63,94,0.15)] space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold uppercase tracking-wider">
                System Safeguard Active
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Workspace Feature View Restored
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                SkillKollab's error boundary intercepted an unexpected component exception. The workspace state is protected.
              </p>
            </div>

            {/* Error Diagnostics toggle */}
            {this.state.error && (
              <div className="text-left">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors mx-auto block mb-2 underline"
                >
                  {this.state.showDetails ? 'Hide Diagnostics ▲' : 'Show Error Diagnostics ▼'}
                </button>
                {this.state.showDetails && (
                  <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-40">
                    <p className="font-bold">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="text-slate-500 mt-2 text-[10px] whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recovery Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3BEB] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reload Workspace Page
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Return to Dashboard
              </button>
            </div>

          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
